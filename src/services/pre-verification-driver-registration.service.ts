import { Injectable, Logger, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TempDriverRegistration } from '../entities/tempDriverRegistration.entity';
import Driver from '../entities/driver.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { CreateDriverDTO } from '../drivers/dto/createDriver';
import * as crypto from 'crypto';

@Injectable()
export class PreVerificationDriverRegistrationService {
    private readonly logger = new Logger(PreVerificationDriverRegistrationService.name);

    constructor(
        @InjectRepository(TempDriverRegistration)
        private readonly tempDriverRegistrationRepository: Repository<TempDriverRegistration>,
        @InjectRepository(Driver)
        private readonly driverRepository: Repository<Driver>,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Initiate registration process - store driver data temporarily and send verification email
     */
    async initiateRegistration(driverData: CreateDriverDTO): Promise<void> {
        try {
            const { email, firstName, lastName, phoneNumber, password, carIdentifier } = driverData;

            // Check if driver already exists
            const existingDriver = await this.driverRepository.findOne({ where: { email } });
            if (existingDriver) {
                throw new ConflictException('A driver with this email already exists.');
            }

            // Check if there's already a pending registration for this email
            const existingTempRegistration = await this.tempDriverRegistrationRepository.findOne({
                where: { email, used: false }
            });
            if (existingTempRegistration) {
                // Delete the existing temporary registration
                await this.tempDriverRegistrationRepository.delete({ id: existingTempRegistration.id });
            }

            // Generate 6-digit OTP
            const otp = this.generateOtp();
            this.logger.log(`[DEBUG] [REGISTRATION] Generated OTP for ${email}: ${otp}`);

            // Set expiration time (15 minutes from now)
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 15);

            // Create temporary registration record
            const tempRegistration = this.tempDriverRegistrationRepository.create({
                email,
                firstName,
                lastName,
                phoneNumber,
                password, // This should already be hashed from the auth service
                carIdentifier,
                otp,
                expiresAt,
                used: false,
            });

            const saved = await this.tempDriverRegistrationRepository.save(tempRegistration);
            this.logger.log(`[DEBUG] [REGISTRATION] Saved temp registration for ${email}:`, {
                id: saved.id,
                otp: saved.otp,
                used: saved.used,
                expiresAt: saved.expiresAt
            });

            // Log all temp registrations for this email
            const allTempRegs = await this.tempDriverRegistrationRepository.find({ where: { email } });
            this.logger.log(`[DEBUG] [REGISTRATION] All temp registrations for ${email}:`, allTempRegs.map(tr => ({
                id: tr.id,
                otp: tr.otp,
                used: tr.used,
                expiresAt: tr.expiresAt
            })));

            // Check if email sending is disabled for development
            const skipEmailSending = process.env.SKIP_EMAIL_SENDING === 'true';

            if (skipEmailSending) {
                this.logger.warn(`[DEBUG] [REGISTRATION] Email sending is disabled. Registration proceeding without email for ${email}. OTP: ${otp}`);
            } else {
                // Send verification email
                await this.sendVerificationEmail(email, firstName, otp);
            }

            this.logger.log(`Driver registration initiated for ${email}`);
        } catch (error) {
            this.logger.error(`Error initiating driver registration: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    /**
     * Verify OTP and create actual driver account
     */
    async verifyAndCreateAccount(email: string, otp: string): Promise<Driver> {
        try {
            this.logger.log(`[DEBUG] Attempting to verify OTP for email: ${email}, OTP: ${otp}`);

            // Use database transaction for atomicity
            return await this.driverRepository.manager.transaction(async (transactionalEntityManager) => {
                // Find the temporary registration
                const tempRegistration = await transactionalEntityManager.findOne(TempDriverRegistration, {
                    where: {
                        email,
                        otp,
                        used: false,
                    },
                });

                this.logger.log(`[DEBUG] Found temp registration: ${tempRegistration ? 'Yes' : 'No'}`);

                if (!tempRegistration) {
                    // Let's check what temp registrations exist for this email
                    const allTempRegistrations = await transactionalEntityManager.find(TempDriverRegistration, {
                        where: { email }
                    });

                    if (!allTempRegistrations || allTempRegistrations.length === 0) {
                        throw new NotFoundException('No registration found for this email. Please register first.');
                    }

                    // If there are temp registrations but none match the OTP
                    throw new BadRequestException('Invalid OTP. Please check the code and try again.');
                }

                this.logger.log(`[DEBUG] Temp registration found:`, {
                    id: tempRegistration.id,
                    email: tempRegistration.email,
                    otp: tempRegistration.otp,
                    used: tempRegistration.used,
                    expiresAt: tempRegistration.expiresAt
                });

                // Check if OTP has expired
                if (new Date() > tempRegistration.expiresAt) {
                    throw new BadRequestException('OTP has expired. Please request a new code.');
                }

                // Mark OTP as used
                tempRegistration.used = true;
                await transactionalEntityManager.save(TempDriverRegistration, tempRegistration);

                // Create the actual driver account with email verification set to true
                const driverData = {
                    email: tempRegistration.email,
                    firstName: tempRegistration.firstName,
                    lastName: tempRegistration.lastName,
                    phoneNumber: tempRegistration.phoneNumber,
                    password: tempRegistration.password,
                    carIdentifier: tempRegistration.carIdentifier,
                    isVerified: true, // Email is verified since they completed OTP verification
                    isAvailable: true, // Default to available
                    completedRides: 0, // Default value
                    averageRating: 0, // Default value
                };

                this.logger.log(`Creating driver with verification data: ${JSON.stringify({
                    email: driverData.email,
                    isVerified: driverData.isVerified
                })}`);

                const newDriver = transactionalEntityManager.create(Driver, driverData);
                const savedDriver = await transactionalEntityManager.save(Driver, newDriver);

                this.logger.log(`Driver account created for ${email} with verification: ${savedDriver.isVerified}`);

                return savedDriver;
            });
        } catch (error) {
            this.logger.error(`Error verifying and creating driver account: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    /**
     * Resend verification OTP
     */
    async resendVerificationOtp(email: string): Promise<void> {
        const tempRegistration = await this.tempDriverRegistrationRepository.findOne({
            where: { email, used: false }
        });

        if (!tempRegistration) {
            throw new NotFoundException('No pending registration found for this email');
        }

        // Generate new OTP
        const newOtp = this.generateOtp();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        // Update the temporary registration
        tempRegistration.otp = newOtp;
        tempRegistration.expiresAt = expiresAt;
        const saved = await this.tempDriverRegistrationRepository.save(tempRegistration);
        this.logger.log(`[DEBUG] [RESEND] Updated temp registration for ${email}:`, {
            id: saved.id,
            otp: saved.otp,
            used: saved.used,
            expiresAt: saved.expiresAt
        });

        // Log all temp registrations for this email
        const allTempRegs = await this.tempDriverRegistrationRepository.find({ where: { email } });
        this.logger.log(`[DEBUG] [RESEND] All temp registrations for ${email}:`, allTempRegs.map(tr => ({
            id: tr.id,
            otp: tr.otp,
            used: tr.used,
            expiresAt: tr.expiresAt
        })));

        // Send new verification email
        await this.sendVerificationEmail(email, tempRegistration.firstName, newOtp);

        this.logger.log(`Verification OTP resent to ${email}`);
    }

    /**
     * Clean up expired temporary registrations
     */
    async cleanupExpiredRegistrations(): Promise<void> {
        const expiredDate = new Date();
        await this.tempDriverRegistrationRepository.delete({
            expiresAt: expiredDate,
            used: false,
        });
    }

    /**
     * Generate 6-digit OTP
     */
    private generateOtp(): string {
        return crypto.randomInt(100000, 999999).toString();
    }

    /**
     * Send verification email
     */
    private async sendVerificationEmail(email: string, firstName: string, otp: string): Promise<void> {
        try {
            const verificationUrl = `${this.configService.get('FRONTEND_URL')}/driver/verify-email?email=${email}&otp=${otp}`;

            this.logger.log(`Attempting to send verification email to ${email}`);

            const emailContext = {
                firstName,
                otp,
                email,
                verificationUrl,
                expiresIn: '15 minutes',
            };

            this.logger.log(`[DEBUG] Email context: ${JSON.stringify(emailContext, null, 2)}`);

            await this.mailerService.sendMail({
                to: email,
                subject: 'Verify Your Email Address - Complete Driver Registration',
                template: 'email-verification',
                context: emailContext,
            });

            this.logger.log(`Verification email sent successfully to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send verification email to ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);

            // Log detailed error information for debugging
            if (error instanceof Error) {
                this.logger.error(`Error details: ${error.stack}`);
            }

            // For now, we'll still allow the registration to proceed
            // In production, you might want to throw an error here
            this.logger.warn(`Registration proceeding without email verification for ${email}. OTP: ${otp}`);

            // You can uncomment the line below to make email sending required
            // throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 
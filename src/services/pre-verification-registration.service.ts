import { Injectable, Logger, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TempUserRegistration } from '../entities/tempUserRegistration.entity';
import User from '../entities/users.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { CreateUserDTO } from '../users/dto/createUser';
import * as crypto from 'crypto';

@Injectable()
export class PreVerificationRegistrationService {
    private readonly logger = new Logger(PreVerificationRegistrationService.name);

    constructor(
        @InjectRepository(TempUserRegistration)
        private readonly tempUserRegistrationRepository: Repository<TempUserRegistration>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Initiate registration process - store user data temporarily and send verification email
     */
    async initiateRegistration(userData: CreateUserDTO): Promise<void> {
        try {
            const { email, firstName, lastName, phoneNumber, password, isStudent, matricNumber } = userData;

            // Check if user already exists
            const existingUser = await this.userRepository.findOne({ where: { email } });
            if (existingUser) {
                throw new ConflictException('A user with this email already exists.');
            }

            // Check if matric number already exists (for students)
            if (isStudent && matricNumber) {
                const existingMatricUser = await this.userRepository.findOne({ where: { matricNumber } });
                if (existingMatricUser) {
                    throw new ConflictException('A user with this matric number already exists.');
                }
            }

            // Check if there's already a pending registration for this email
            const existingTempRegistration = await this.tempUserRegistrationRepository.findOne({
                where: { email, used: false }
            });
            if (existingTempRegistration) {
                // Delete the existing temporary registration
                await this.tempUserRegistrationRepository.delete({ id: existingTempRegistration.id });
            }

            // Generate 6-digit OTP
            const otp = this.generateOtp();

            // Set expiration time (15 minutes from now)
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 15);

            // Create temporary registration record
            const tempRegistration = this.tempUserRegistrationRepository.create({
                email,
                firstName,
                lastName,
                phoneNumber,
                password, // This should already be hashed from the auth service
                isStudent,
                matricNumber: isStudent ? matricNumber : null,
                otp,
                expiresAt,
                used: false,
            });

            await this.tempUserRegistrationRepository.save(tempRegistration);

            // Check if email sending is disabled for development
            const skipEmailSending = process.env.SKIP_EMAIL_SENDING === 'true';

            if (skipEmailSending) {
                this.logger.warn(`Email sending is disabled. Registration proceeding without email for ${email}. OTP: ${otp}`);
            } else {
                // Send verification email
                await this.sendVerificationEmail(email, firstName, otp);
            }

            this.logger.log(`Registration initiated for ${email}`);
        } catch (error) {
            this.logger.error(`Error initiating registration: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    /**
     * Verify OTP and create actual user account
     */
    async verifyAndCreateAccount(email: string, otp: string): Promise<User> {
        try {
            // Use database transaction for atomicity
            return await this.userRepository.manager.transaction(async (transactionalEntityManager) => {
                // Find the temporary registration
                const tempRegistration = await transactionalEntityManager.findOne(TempUserRegistration, {
                    where: {
                        email,
                        otp,
                        used: false,
                    },
                });

                if (!tempRegistration) {
                    throw new BadRequestException('Invalid OTP');
                }

                // Check if OTP has expired
                if (new Date() > tempRegistration.expiresAt) {
                    throw new BadRequestException('OTP has expired');
                }

                // Mark OTP as used
                tempRegistration.used = true;
                await transactionalEntityManager.save(TempUserRegistration, tempRegistration);

                // Create the actual user account with email verification set to true
                const userData = {
                    email: tempRegistration.email,
                    firstName: tempRegistration.firstName,
                    lastName: tempRegistration.lastName,
                    phoneNumber: tempRegistration.phoneNumber,
                    password: tempRegistration.password,
                    isStudent: tempRegistration.isStudent,
                    matricNumber: tempRegistration.matricNumber,
                    emailVerified: true, // Email is verified since they completed OTP verification
                    emailVerifiedAt: new Date(),
                    isVerified: true, // Also set isVerified to true
                };

                this.logger.log(`Creating user with email verification data: ${JSON.stringify({
                    email: userData.email,
                    emailVerified: userData.emailVerified,
                    emailVerifiedAt: userData.emailVerifiedAt,
                    isVerified: userData.isVerified
                })}`);

                const newUser = transactionalEntityManager.create(User, userData);
                const savedUser = await transactionalEntityManager.save(User, newUser);

                // Verify the saved user has the correct verification status
                this.logger.log(`User account created for ${email} with email verification: ${savedUser.emailVerified}, isVerified: ${savedUser.isVerified}`);

                // Double-check by querying the database directly
                const verifiedUser = await transactionalEntityManager.findOne(User, {
                    where: { email: savedUser.email },
                    select: ['email', 'emailVerified', 'emailVerifiedAt', 'isVerified']
                });

                this.logger.log(`Database verification check - emailVerified: ${verifiedUser?.emailVerified}, isVerified: ${verifiedUser?.isVerified}`);

                return savedUser;
            });
        } catch (error) {
            this.logger.error(`Error verifying and creating account: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    /**
     * Resend verification OTP
     */
    async resendVerificationOtp(email: string): Promise<void> {
        const tempRegistration = await this.tempUserRegistrationRepository.findOne({
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
        await this.tempUserRegistrationRepository.save(tempRegistration);

        // Send new verification email
        await this.sendVerificationEmail(email, tempRegistration.firstName, newOtp);

        this.logger.log(`Verification OTP resent to ${email}`);
    }

    /**
     * Clean up expired temporary registrations
     */
    async cleanupExpiredRegistrations(): Promise<void> {
        const expiredDate = new Date();
        await this.tempUserRegistrationRepository.delete({
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
            const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?email=${email}&otp=${otp}`;

            this.logger.log(`[DEBUG] About to send email with transport config: HOST=${process.env.SMTP_HOST}, PORT=${process.env.SMTP_PORT}, USER=${process.env.SMTP_USER}, SECURE=${process.env.SMTP_PORT == '465'}`);

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
                subject: 'Verify Your Email Address - Complete Registration',
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
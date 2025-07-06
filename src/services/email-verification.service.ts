import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerification } from '../entities/emailVerification.entity';
import User from '../entities/users.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EmailVerificationService {
    private readonly logger = new Logger(EmailVerificationService.name);

    constructor(
        @InjectRepository(EmailVerification)
        private readonly emailVerificationRepository: Repository<EmailVerification>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Generate and send verification OTP to user's email
     */
    async generateAndSendVerificationOtp(email: string, firstName: string): Promise<void> {
        try {
            // Find the user
            const user = await this.userRepository.findOne({ where: { email } });
            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Check if email is already verified
            if (user.emailVerified) {
                throw new BadRequestException('Email is already verified');
            }

            // Generate 6-digit OTP
            const otp = this.generateOtp();

            // Set expiration time (15 minutes from now)
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 15);

            // Delete any existing unused verification records for this user
            await this.emailVerificationRepository.delete({
                userId: user.identifier,
                used: false,
            });

            // Create new verification record
            const emailVerification = this.emailVerificationRepository.create({
                userId: user.identifier,
                email: user.email,
                otp,
                expiresAt,
                used: false,
            });

            await this.emailVerificationRepository.save(emailVerification);

            // Send verification email
            await this.sendVerificationEmail(email, firstName, otp);

            this.logger.log(`Verification OTP sent to ${email}`);
        } catch (error) {
            this.logger.error(`Error generating verification OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    /**
     * Verify OTP and mark email as verified
     */
    async verifyOtp(email: string, otp: string): Promise<void> {
        try {
            // Find the user
            const user = await this.userRepository.findOne({ where: { email } });
            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Check if email is already verified
            if (user.emailVerified) {
                throw new BadRequestException('Email is already verified');
            }

            // Find the verification record
            const verification = await this.emailVerificationRepository.findOne({
                where: {
                    userId: user.identifier,
                    email,
                    otp,
                    used: false,
                },
            });

            if (!verification) {
                throw new BadRequestException('Invalid OTP');
            }

            // Check if OTP has expired
            if (new Date() > verification.expiresAt) {
                throw new BadRequestException('OTP has expired');
            }

            // Mark OTP as used
            verification.used = true;
            await this.emailVerificationRepository.save(verification);

            // Mark email as verified
            user.emailVerified = true;
            user.emailVerifiedAt = new Date();
            await this.userRepository.save(user);

            this.logger.log(`Email verified for ${email}`);
        } catch (error) {
            this.logger.error(`Error verifying OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    /**
     * Check if user's email is verified
     */
    async isEmailVerified(email: string): Promise<boolean> {
        const user = await this.userRepository.findOne({ where: { email } });
        return user?.emailVerified || false;
    }

    /**
     * Resend verification OTP
     */
    async resendVerificationOtp(email: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.emailVerified) {
            throw new BadRequestException('Email is already verified');
        }

        await this.generateAndSendVerificationOtp(email, user.firstName);
    }

    /**
     * Clean up expired verification records
     */
    async cleanupExpiredVerifications(): Promise<void> {
        const expiredDate = new Date();
        await this.emailVerificationRepository.delete({
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

            this.logger.log(`Attempting to send verification email to ${email}`);

            await this.mailerService.sendMail({
                to: email,
                subject: 'Verify Your Email Address',
                template: 'email-verification',
                context: {
                    firstName,
                    otp,
                    email,
                    verificationUrl,
                    expiresIn: '15 minutes',
                },
            });

            this.logger.log(`Verification email sent successfully to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send verification email to ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);

            // Log detailed error information for debugging
            if (error instanceof Error) {
                this.logger.error(`Error details: ${error.stack}`);
            }

            // For now, we'll still allow the verification to proceed
            // In production, you might want to throw an error here
            this.logger.warn(`Email verification proceeding without email sending for ${email}. OTP: ${otp}`);

            // You can uncomment the line below to make email sending required
            // throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 
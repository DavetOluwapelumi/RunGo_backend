import { Injectable, Logger, NotFoundException, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetOtpEntity } from '../entities/passwordResetOtp.entity';
import { EmailService } from './email.service';
import { CommonAuthService } from '../auth/auth.service.common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PasswordResetService {
    private readonly logger = new Logger(PasswordResetService.name);

    constructor(
        @InjectRepository(PasswordResetOtpEntity)
        private readonly passwordResetOtpRepository: Repository<PasswordResetOtpEntity>,
        private readonly emailService: EmailService,
        private readonly commonAuthService: CommonAuthService,
        private readonly jwtService: JwtService,
    ) { }

    async generateAndSendOtp(email: string, userName: string): Promise<void> {
        try {
            // Delete any existing unused OTPs for this email
            await this.passwordResetOtpRepository.delete({
                email,
                isUsed: false,
            });

            // Create new OTP
            const otpEntity = this.passwordResetOtpRepository.create({
                email,
            });

            await this.passwordResetOtpRepository.save(otpEntity);

            // Send OTP via email
            await this.emailService.sendPasswordResetOtp(email, otpEntity.otp, userName);

            this.logger.log(`OTP generated and sent to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to generate/send OTP for ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw new UnprocessableEntityException('Failed to send OTP');
        }
    }

    async verifyOtp(email: string, otp: string): Promise<string> {
        try {
            const otpEntity = await this.passwordResetOtpRepository.findOne({
                where: {
                    email,
                    otp,
                    isUsed: false,
                },
            });

            if (!otpEntity) {
                throw new BadRequestException('Invalid or expired OTP');
            }

            // Check if OTP has expired
            if (new Date() > otpEntity.expiresAt) {
                throw new BadRequestException('OTP has expired');
            }

            // Mark OTP as used
            otpEntity.isUsed = true;
            await this.passwordResetOtpRepository.save(otpEntity);

            // Generate reset token (JWT)
            const resetToken = this.jwtService.sign(
                { email, type: 'password_reset' },
                { expiresIn: '15m' }
            );

            this.logger.log(`OTP verified successfully for ${email}`);
            return resetToken;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to verify OTP for ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw new UnprocessableEntityException('Failed to verify OTP');
        }
    }

    async resetPassword(email: string, newPassword: string, confirmPassword: string): Promise<string> {
        try {
            if (newPassword !== confirmPassword) {
                throw new BadRequestException('Passwords do not match');
            }

            if (newPassword.length < 8) {
                throw new BadRequestException('Password must be at least 8 characters');
            }

            // Hash the new password
            const hashedPassword = await this.commonAuthService.hashPassword(newPassword);

            // Return hashed password for user service to update
            return hashedPassword;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to reset password for ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw new UnprocessableEntityException('Failed to reset password');
        }
    }

    async cleanupExpiredOtps(): Promise<void> {
        try {
            const result = await this.passwordResetOtpRepository
                .createQueryBuilder()
                .delete()
                .where('expiresAt < :now', { now: new Date() })
                .execute();

            this.logger.log(`Cleaned up ${result.affected} expired OTPs`);
        } catch (error) {
            this.logger.error(`Failed to cleanup expired OTPs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 
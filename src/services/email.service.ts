import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(private readonly mailerService: MailerService) { }

    async sendPasswordResetOtp(email: string, otp: string, userName: string): Promise<void> {
        try {
            this.logger.log(`Attempting to send OTP email to ${email} with userName: ${userName}`);

            await this.mailerService.sendMail({
                to: email,
                subject: 'Password Reset Request - Run.go',
                template: 'simple-password-reset',
                context: {
                    otp: otp,
                },
            });

            this.logger.log(`Password reset OTP sent successfully to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send password reset OTP to ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // Fallback: Log the intended email to the console
            console.log('[EMAIL FALLBACK]', {
                to: email,
                subject: 'Password Reset Request - Run.go',
                template: 'simple-password-reset',
                context: {
                    otp: otp,
                },
            });
            throw new Error('Failed to send OTP email');
        }
    }

    async sendRideRequestNotification(email: string, driverName: string, dashboardLink: string): Promise<void> {
        try {
            this.logger.log(`Attempting to send ride request notification to ${email} for driver: ${driverName}`);

            await this.mailerService.sendMail({
                to: email,
                subject: 'New Ride Request - Run.go',
                template: 'ride-request-notification',
                context: {
                    driverName,
                    dashboardLink,
                },
            });

            this.logger.log(`Ride request notification sent successfully to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send ride request notification to ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // Fallback: Log the intended email to the console
            console.log('[EMAIL FALLBACK]', {
                to: email,
                subject: 'New Ride Request - Run.go',
                template: 'ride-request-notification',
                context: {
                    driverName,
                    dashboardLink,
                },
            });
        }
    }
} 
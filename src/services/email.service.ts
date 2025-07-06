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
            throw new Error('Failed to send OTP email');
        }
    }
} 
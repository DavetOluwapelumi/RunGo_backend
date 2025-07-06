import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { PasswordResetService } from './password-reset.service';
import { EmailVerificationService } from './email-verification.service';
import { PasswordResetOtpEntity } from '../entities/passwordResetOtp.entity';
import { EmailVerification } from '../entities/emailVerification.entity';
import User from '../entities/users.entity';
import { CommonAuthService } from '../auth/auth.service.common';

@Module({
    imports: [
        TypeOrmModule.forFeature([PasswordResetOtpEntity, EmailVerification, User]),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key',
            signOptions: { expiresIn: '15m' },
        }),
        MailerModule,
    ],
    providers: [EmailService, PasswordResetService, EmailVerificationService, CommonAuthService],
    exports: [EmailService, PasswordResetService, EmailVerificationService],
})
export class ServicesModule { } 
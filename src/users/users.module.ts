import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuthController } from './controllers/user.auth.controller';
import { UserAuthService } from './services/user.auth.service';
import User from '../entities/users.entity';
import { EmailVerification } from '../entities/emailVerification.entity';
import { TempUserRegistration } from '../entities/tempUserRegistration.entity';
import { AuthModule } from '../auth/auth.module';
import { ServicesModule } from '../services/services.module';
import { PreVerificationRegistrationService } from '../services/pre-verification-registration.service';
import { MulterModule } from '@nestjs/platform-express';
import { UserProfileService } from './services/user.profile.service';
import { UserProfileController } from './controllers/user.profile.controller';

@Module({
  providers: [UserService, UserAuthService, PreVerificationRegistrationService, UserProfileService],
  imports: [
    TypeOrmModule.forFeature([User, EmailVerification, TempUserRegistration]),
    AuthModule,
    ServicesModule,
    MulterModule.register({
      dest: './uploads/profile-images',
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  controllers: [UserAuthController, UserProfileController],
  exports: [UserService],
})
export class UsersModule { }

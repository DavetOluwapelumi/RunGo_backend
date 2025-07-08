import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonAuthService } from 'src/auth/auth.service.common';
import { DriverAuthController } from './controllers/driver.auth.controller';
import { DriverAuthService } from './services/driver.auth.service';
import { DriverService } from './services/drivers.service';
import Driver from 'src/entities/driver.entity';
import { DriversController } from './controllers/drivers.controller';
import { DriverProfileService } from './services/driver.profile.service';
import { DriverAvailabilityController } from './controllers/drivers.availability.controller';
import { TempDriverRegistration } from 'src/entities/tempDriverRegistration.entity';
import { PreVerificationDriverRegistrationService } from 'src/services/pre-verification-driver-registration.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { PasswordResetOtpEntity } from 'src/entities/passwordResetOtp.entity';
import { ServicesModule } from 'src/services/services.module';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  providers: [
    DriverService,
    CommonAuthService,
    DriverAuthService,
    DriverProfileService,
    PreVerificationDriverRegistrationService,
  ],
  imports: [
    TypeOrmModule.forFeature([Driver, TempDriverRegistration, PasswordResetOtpEntity]),
    MailerModule,
    ConfigModule,
    ServicesModule,
    AuthModule,
  ],
  controllers: [
    DriversController,
    DriverAuthController,
    DriverAvailabilityController,
  ],
  exports: [DriverService],
})
export class DriversModule { }

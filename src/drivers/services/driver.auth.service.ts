import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CommonAuthService } from '../../auth/auth.service.common';
import { CreateDriverDTO } from 'src/drivers/dto/createDriver';
import { DriverService } from './drivers.service';
import { ApiResponse } from 'src/adapters/apiResponse';
import { LoginDriverDTO } from '../dto/loginDriver';
import { JwtPayload } from 'src/interfaces/jwt';
import { RequestPasswordResetDTO } from '../dto/requestPasswordReset';
import { SetNewPasswordDTO } from '../dto/setNewPassword';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Driver from '../../entities/driver.entity';
import { PreVerificationDriverRegistrationService } from '../../services/pre-verification-driver-registration.service';
import { DriverForgotPasswordDTO } from '../dto/forgotPassword';
import { DriverVerifyOtpDTO } from '../dto/verifyOtp';
import { DriverResetPasswordDTO } from '../dto/resetPassword';
import { PasswordResetOtpEntity } from '../../entities/passwordResetOtp.entity';
import { EmailService } from '../../services/email.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class DriverAuthService {
  constructor(
    @Inject(CommonAuthService)
    private readonly commonAuthService: CommonAuthService,
    @Inject(DriverService)
    private readonly driverService: DriverService,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @Inject(PreVerificationDriverRegistrationService)
    private readonly preVerificationDriverRegistrationService: PreVerificationDriverRegistrationService,
    @InjectRepository(PasswordResetOtpEntity)
    private readonly passwordResetOtpRepository: Repository<PasswordResetOtpEntity>,
    @Inject(EmailService)
    private readonly emailService: EmailService,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
  ) { }

  private readonly logger = new Logger(DriverAuthService.name);

  public async verifyHotlink(link: string) {
    throw 'inmplemented';
  }
  public async register(request: CreateDriverDTO) {
    try {
      // Hash the password
      const hashedPassword = await this.commonAuthService
        .hashPassword(request.password)
        .catch((error) => {
          this.logger.error(`Error hashing password: ${error.message}`);
          throw new InternalServerErrorException(
            'The request could not be completed',
          );
        });

      // Prepare payload with hashed password
      const payload: CreateDriverDTO = {
        ...request,
        password: hashedPassword,
      };

      // Initiate registration process (stores data temporarily and sends verification email)
      await this.preVerificationDriverRegistrationService.initiateRegistration(payload);

      return new ApiResponse('Registration initiated successfully. Please check your email to verify your account and complete registration.', {
        email: request.email,
        message: 'Verification email sent'
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const err = error as { status: number; message: string };
        if (err.status === HttpStatus.CONFLICT) {
          throw new ConflictException(err.message);
        }
      }
      this.logger.error(`Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new HttpException(
        'Request could not be completed',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  public async login(request: LoginDriverDTO) {
    try {
      this.logger.log(`Login attempt for email: ${request.email}`);
      const driver = await this.driverService.findOneByEmail(request.email);
      this.logger.log(`Driver found: ${!!driver}`);
      if (!driver) {
        this.logger.warn('Login failed: Invalid email/phone or password');
        throw new NotFoundException('Invalid email/phone or password');
      }

      this.logger.log(`Driver isVerified: ${driver.isVerified}`);
      if (!driver.isVerified) {
        this.logger.warn('Login failed: Account not verified');
        throw new UnauthorizedException('Account not verified. Please complete registration and email/OTP verification.');
      }

      const isCorrectPassword = await this.commonAuthService
        .validatePasswordHash(driver.password, request.password)
        .catch((error) => {
          this.logger.error('Password validation error: ' + error.message);
          throw error;
        });

      this.logger.log(`Password correct: ${isCorrectPassword}`);
      if (!isCorrectPassword) {
        this.logger.warn('Login failed: Invalid email/phone or password');
        throw new UnauthorizedException('Invalid email/phone or password');
      }

      const jwtPayload: JwtPayload = {
        userEmail: driver.email,
        userId: driver.identifier,
        accountType: 'driver',
        isStudent: false,
      };

      const jwtToken = await this.commonAuthService
        .generateJwt(jwtPayload)
        .catch((error) => {
          this.logger.error('JWT generation error: ' + error.message);
          throw error;
        });

      this.logger.log('Login successful, JWT generated.');
      return new ApiResponse('Login successful', { jwtToken });
    } catch (error) {
      this.logger.error('Login error: ' + (typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : error));
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const err = error as { status: number; message: string };
        if (err.status === HttpStatus.CONFLICT) {
          throw new ConflictException(err.message);
        }
      }
      throw new HttpException(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : 'An unexpected error occurred',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  public async requestPasswordReset(request: RequestPasswordResetDTO) {
    try {
      const driver = await this.driverService.findOneByEmail(request.email);
      if (!driver) {
        throw new NotFoundException(
          'It appears the email is not registered on our servers',
        );
      }
      //TODO: send  else send email
      return new ApiResponse(
        'You would receive and email with further instructions',
        null,
      );
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const err = error as { status: number; message: string };

        if (err.status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(err.message);
        }
      }

      throw new UnprocessableEntityException(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : 'An unexpected error occurred',
      );
    }
  }

  public async setNewPassword(
    request: SetNewPasswordDTO,
    authorizedUser: JwtPayload,
  ) {
    try {
      const driver = await this.driverService.findOneByEmail(
        authorizedUser.userEmail,
      );
      if (!driver) {
        throw new NotFoundException('Invalid email');
      }

      if (request.newPassword !== request.confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      const hashedPassword = await this.commonAuthService
        .hashPassword(request.newPassword)
        .catch((error) => {
          throw error;
        });

      driver.password = hashedPassword;
      await this.driverRepository.save(driver).catch((error) => {
        throw error;
      });

      return new ApiResponse('Password successfully updated', null);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const err = error as { status: number; message: string };

        if (err.status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(err.message);
        } else {
          throw new HttpException(err.message, err.status);
        }
      }

      // Fallback in case `error` does not have `.status`
      throw new HttpException(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : 'An unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async verifyOtp(email: string, otp: string) {
    try {
      const driver = await this.preVerificationDriverRegistrationService.verifyAndCreateAccount(email, otp);
      return new ApiResponse('Driver account verified and created successfully.', {
        email: driver.email,
        firstName: driver.firstName,
        lastName: driver.lastName,
        phoneNumber: driver.phoneNumber,
        identifier: driver.identifier,
        isVerified: driver.isVerified,
        carIdentifier: driver.carIdentifier,
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const err = error as { status: number; message: string };
        if (err.status === HttpStatus.BAD_REQUEST) {
          throw new BadRequestException(err.message);
        }
        if (err.status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(err.message);
        }
      }
      this.logger.error(`OTP verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new HttpException(
        'OTP verification failed',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  public async resendOtp(email: string) {
    try {
      await this.preVerificationDriverRegistrationService.resendVerificationOtp(email);
      return new ApiResponse('Verification OTP resent successfully.', { email });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const err = error as { status: number; message: string };
        if (err.status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(err.message);
        }
      }
      this.logger.error(`Resend OTP error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new HttpException(
        'Resend OTP failed',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  // --- DRIVER FORGOT PASSWORD FLOW ---
  public async forgotPassword(request: DriverForgotPasswordDTO) {
    const { email } = request;
    const driver = await this.driverService.findOneByEmail(email);
    if (!driver) {
      // For security, do not reveal if email is not registered
      return new ApiResponse('If this email is registered, you will receive a password reset OTP.', null);
    }
    // Delete any existing unused OTPs for this email
    await this.passwordResetOtpRepository.delete({ email, isUsed: false });
    // Create new OTP entity
    const otpEntity = this.passwordResetOtpRepository.create({ email });
    await this.passwordResetOtpRepository.save(otpEntity);
    // Send OTP via email
    await this.emailService.sendPasswordResetOtp(email, otpEntity.otp, driver.firstName || 'Driver');
    return new ApiResponse('If this email is registered, you will receive a password reset OTP.', null);
  }

  public async verifyOtpForPasswordReset(request: DriverVerifyOtpDTO) {
    const { email, otp } = request;
    const otpEntity = await this.passwordResetOtpRepository.findOne({ where: { email, otp, isUsed: false } });
    if (!otpEntity) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    if (new Date() > otpEntity.expiresAt) {
      throw new BadRequestException('OTP has expired');
    }
    otpEntity.isUsed = true;
    await this.passwordResetOtpRepository.save(otpEntity);
    // Generate reset token (JWT)
    const resetToken = this.jwtService.sign({ email, type: 'password_reset' }, { expiresIn: '15m' });
    return new ApiResponse('OTP verified. You may now reset your password.', { resetToken });
  }

  public async resetPassword(request: DriverResetPasswordDTO) {
    const { email, otp, newPassword, confirmPassword } = request;
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    if (newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    // Verify OTP again for extra security
    const otpEntity = await this.passwordResetOtpRepository.findOne({ where: { email, otp, isUsed: true } });
    if (!otpEntity) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    // Hash new password
    const hashedPassword = await this.commonAuthService.hashPassword(newPassword);
    // Update driver password
    const driver = await this.driverService.findOneByEmail(email);
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    driver.password = hashedPassword;
    await this.driverRepository.save(driver);
    return new ApiResponse('Password reset successful.', null);
  }
}

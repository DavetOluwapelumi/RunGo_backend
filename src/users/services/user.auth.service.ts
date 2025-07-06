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
import { CreateUserDTO } from 'src/users/dto/createUser';
import { UserService } from './users.service';
import { ApiResponse } from 'src/adapters/apiResponse';
import { LoginUserDTO } from '../dto/loginUser';
import { JwtPayload } from 'src/interfaces/jwt';
// Removed RequestPasswordResetDTO and SetNewPasswordDTO - using new password reset DTOs instead
import { ForgotPasswordDTO } from '../dto/forgotPassword';
import { VerifyOtpDTO } from '../dto/verifyOtp';
import { ResetPasswordDTO } from '../dto/resetPassword';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from '../../entities/users.entity';
import { PasswordResetService } from '../../services/password-reset.service';
import { EmailVerificationService } from '../../services/email-verification.service';
import { PreVerificationRegistrationService } from '../../services/pre-verification-registration.service';

@Injectable()
export class UserAuthService {
  constructor(
    @Inject(CommonAuthService)
    private readonly commonAuthService: CommonAuthService,
    @Inject(UserService)
    private readonly userService: UserService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(PasswordResetService)
    private readonly passwordResetService: PasswordResetService,
    @Inject(EmailVerificationService)
    private readonly emailVerificationService: EmailVerificationService,
    @Inject(PreVerificationRegistrationService)
    private readonly preVerificationRegistrationService: PreVerificationRegistrationService,
  ) { }

  private readonly logger = new Logger(UserAuthService.name);

  public async register(request: CreateUserDTO) {
    const {
      isStudent,
      email,
      phoneNumber,
      firstName,
      lastName,
      password: rawPassword,
      matricNumber,
    } = request;

    try {
      // Additional validation for students
      if (isStudent && !matricNumber) {
        throw new BadRequestException(
          'Matric number is required for students.',
        );
      }

      // Hash the password
      const hashedPassword = await this.commonAuthService
        .hashPassword(rawPassword)
        .catch((error) => {
          this.logger.error(`Error hashing password: ${error.message}`);
          throw new InternalServerErrorException(
            'The request could not be completed',
          );
        });

      // Create the payload with hashed password
      const payload: CreateUserDTO = {
        isStudent,
        firstName,
        lastName,
        email,
        phoneNumber,
        matricNumber: isStudent ? matricNumber : undefined,
        password: hashedPassword,
      };

      // Initiate registration process (stores data temporarily and sends verification email)
      await this.preVerificationRegistrationService.initiateRegistration(payload);

      return new ApiResponse('Registration initiated successfully. Please check your email to verify your account and complete registration.', {
        email,
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

  public async login(request: LoginUserDTO) {
    const { isStudent, matricNumber, email, password } = request;

    this.logger.log(`Login attempt - isStudent: ${isStudent}, matricNumber: ${matricNumber}, email: ${email}`);

    try {
      let user: User;

      if (isStudent) {
        if (!matricNumber) {
          throw new BadRequestException(
            'Matric number is required for students.',
          );
        }
        user = await this.userService.findOneByMatricNumber(matricNumber);
        this.logger.log(`Student login - Found user: ${user ? 'Yes' : 'No'}`);
      } else {
        if (!email) {
          throw new BadRequestException('Email is required for non-students.');
        }
        user = await this.userService.findOneByEmail(email);
        this.logger.log(`Non-student login - Found user: ${user ? 'Yes' : 'No'}`);
      }

      if (!user) {
        this.logger.warn(`User not found for login attempt`);
        throw new NotFoundException('Invalid credentials.');
      }

      this.logger.log(`User found: ${user.firstName} ${user.lastName}, isStudent: ${user.isStudent}`);

      const isCorrectPassword =
        await this.commonAuthService.validatePasswordHash(
          user.password,
          password,
        );

      this.logger.log(`Password validation result: ${isCorrectPassword}`);

      if (!isCorrectPassword) {
        this.logger.warn(`Invalid password for user: ${user.email}`);
        throw new UnauthorizedException('Invalid credentials.');
      }

      // Check if email is verified
      if (!user.emailVerified) {
        this.logger.warn(`Unverified email login attempt: ${user.email}`);
        throw new UnauthorizedException('EMAIL_NOT_VERIFIED');
      }

      const jwtPayload: JwtPayload = {
        userId: user.identifier,
        userEmail: user.email,
        isStudent: user.isStudent,
        accountType: 'user',
      };

      const jwtToken = await this.commonAuthService.generateJwt(jwtPayload);

      this.logger.log(`Login successful for user: ${user.email}, token generated: ${jwtToken ? 'Yes' : 'No'}`);

      const responseData = {
        jwtToken,
        user: {
          identifier: user.identifier,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isStudent: user.isStudent,
          matricNumber: user.matricNumber
        }
      };

      this.logger.log(`Login response data: ${JSON.stringify(responseData, null, 2)}`);

      return new ApiResponse('Login successful', responseData);
    } catch (error) {
      // Re-throw specific exceptions without wrapping them
      if (error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException) {
        throw error;
      }

      // Log unexpected errors
      this.logger.error(`Unexpected login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new HttpException(
        'An unexpected error occurred during login',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // This method is replaced by forgotPassword method
  public async requestPasswordReset(request: any) {
    // Redirect to new forgotPassword method
    return this.forgotPassword(request);
  }

  public async setNewPassword(
    request: ResetPasswordDTO,
    authorizedUser: JwtPayload,
  ) {
    try {
      const user = await this.userService.findOneByEmail(
        authorizedUser.userEmail,
      );
      if (!user) {
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

      user.password = hashedPassword;
      await this.userRepository.save(user).catch((error) => {
        throw error;
      });

      return new ApiResponse('Password successfully updated', null);
    } catch (error) {
      throw new HttpException(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : 'An unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Temporary debug method - remove after testing
  public async debugUsers() {
    try {
      const users = await this.userRepository.find({
        select: ['identifier', 'firstName', 'lastName', 'email', 'matricNumber', 'isStudent']
      });
      return {
        message: 'Debug users found',
        count: users.length,
        users: users
      };
    } catch (error) {
      this.logger.error(`Debug users error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new HttpException(
        'Debug failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // New password reset methods
  public async forgotPassword(request: ForgotPasswordDTO) {
    try {
      const user = await this.userService.findOneByEmail(request.email);
      if (!user) {
        throw new NotFoundException('Email not registered');
      }

      await this.passwordResetService.generateAndSendOtp(request.email, user.firstName);

      return new ApiResponse('OTP sent successfully to your email', {
        email: request.email
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new UnprocessableEntityException(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : 'An unexpected error occurred',
      );
    }
  }

  public async verifyOtp(request: VerifyOtpDTO) {
    try {
      const user = await this.userService.findOneByEmail(request.email);
      if (!user) {
        throw new NotFoundException('Email not registered');
      }

      const resetToken = await this.passwordResetService.verifyOtp(request.email, request.otp);

      return new ApiResponse('OTP verified successfully', {
        email: request.email,
        resetToken: resetToken
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new UnprocessableEntityException(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : 'An unexpected error occurred',
      );
    }
  }

  public async resetPassword(request: ResetPasswordDTO) {
    try {
      const user = await this.userService.findOneByEmail(request.email);
      if (!user) {
        throw new NotFoundException('Email not registered');
      }

      const hashedPassword = await this.passwordResetService.resetPassword(
        request.email,
        request.newPassword,
        request.confirmPassword
      );

      // Update user password
      user.password = hashedPassword;
      await this.userRepository.save(user);

      return new ApiResponse('Password updated successfully', {
        email: request.email
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new UnprocessableEntityException(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : 'An unexpected error occurred',
      );
    }
  }

  public async verifyEmail(request: any) {
    try {
      await this.emailVerificationService.verifyOtp(request.email, request.otp);
      return new ApiResponse('Email verified successfully', {
        email: request.email
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new UnprocessableEntityException(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : 'An unexpected error occurred',
      );
    }
  }

  public async resendVerificationEmail(request: any) {
    try {
      await this.emailVerificationService.resendVerificationOtp(request.email);
      return new ApiResponse('Verification email sent successfully', {
        email: request.email
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new UnprocessableEntityException(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : 'An unexpected error occurred',
      );
    }
  }

  // New methods for pre-verification registration flow
  public async verifyRegistration(request: any) {
    try {
      const user = await this.preVerificationRegistrationService.verifyAndCreateAccount(request.email, request.otp);
      return new ApiResponse('Registration completed successfully. Your account has been created and verified.', {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isStudent: user.isStudent
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new UnprocessableEntityException(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : 'An unexpected error occurred',
      );
    }
  }

  public async resendRegistrationVerification(request: any) {
    try {
      await this.preVerificationRegistrationService.resendVerificationOtp(request.email);
      return new ApiResponse('Verification email sent successfully', {
        email: request.email
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new UnprocessableEntityException(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : 'An unexpected error occurred',
      );
    }
  }

  // Debug method to check temporary registrations
  public async debugTempRegistrations() {
    try {
      const tempRegistrations = await this.preVerificationRegistrationService['tempUserRegistrationRepository'].find({
        select: ['id', 'email', 'firstName', 'lastName', 'used', 'expiresAt', 'createdAt']
      });
      return {
        message: 'Debug temp registrations found',
        count: tempRegistrations.length,
        registrations: tempRegistrations
      };
    } catch (error) {
      this.logger.error(`Debug temp registrations error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new HttpException(
        'Debug failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Debug method to check user verification status
  public async debugUserVerification(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        select: ['identifier', 'email', 'firstName', 'lastName', 'emailVerified', 'emailVerifiedAt', 'isVerified', 'isStudent']
      });

      if (!user) {
        return {
          message: 'User not found',
          email: email
        };
      }

      return {
        message: 'User verification status',
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
          emailVerifiedAt: user.emailVerifiedAt,
          isVerified: user.isVerified,
          isStudent: user.isStudent
        }
      };
    } catch (error) {
      this.logger.error(`Debug user verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new HttpException(
        'Debug failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Manual fix for email verification status (for testing)
  public async fixEmailVerification(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update email verification status
      user.emailVerified = true;
      user.emailVerifiedAt = new Date();
      user.isVerified = true;

      await this.userRepository.save(user);

      return new ApiResponse('Email verification status fixed', {
        email: user.email,
        emailVerified: user.emailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
        isVerified: user.isVerified
      });
    } catch (error) {
      this.logger.error(`Fix email verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new HttpException(
        'Fix failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Database health check method
  public async databaseHealthCheck() {
    try {
      // Test database connection
      const connection = this.userRepository.manager.connection;
      const isConnected = connection.isInitialized;

      if (!isConnected) {
        return {
          status: 'error',
          message: 'Database connection not initialized',
          details: 'TypeORM connection is not ready'
        };
      }

      // Test if User entity metadata exists
      const userMetadata = connection.getMetadata(User);

      // Test if users table exists by running a simple query
      const tableExists = await this.userRepository.query('SELECT 1 FROM users LIMIT 1').catch(() => false);

      return {
        status: 'success',
        message: 'Database health check completed',
        details: {
          connectionInitialized: isConnected,
          userMetadataFound: !!userMetadata,
          usersTableExists: !!tableExists,
          databaseName: connection.options.database,
          entitiesCount: connection.entityMetadatas.length,
          entities: connection.entityMetadatas.map(meta => meta.name)
        }
      };
    } catch (error) {
      this.logger.error(`Database health check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        status: 'error',
        message: 'Database health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      };
    }
  }
}

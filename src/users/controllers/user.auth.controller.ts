import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { UserAuthService } from '../services/user.auth.service';
import { CreateUserDTO } from '../dto/createUser';
import { LoginUserDTO } from '../dto/loginUser';
// Removed RequestPasswordResetDTO and SetNewPasswordDTO - using new password reset DTOs instead
import { ForgotPasswordDTO } from '../dto/forgotPassword';
import { VerifyOtpDTO } from '../dto/verifyOtp';
import { ResetPasswordDTO } from '../dto/resetPassword';
import { VerifyEmailDTO } from '../dto/verifyEmail';
import { VerifyRegistrationDTO } from '../dto/verifyRegistration';
import { ResendVerificationDTO } from '../dto/resendVerification';
import { JwtPayload } from 'src/interfaces/jwt';

@Controller({ version: '1', path: 'user/auth' })
export class UserAuthController {
  constructor(
    private readonly userAuthService: UserAuthService,
  ) { }

  @HttpCode(201)
  @Post('register')
  async createUser(@Body() request: CreateUserDTO) {
    return this.userAuthService.register(request);
  }

  @Post('login')
  async loginUserUser(@Body() loginUserDTO: LoginUserDTO) {
    console.log('Login request received:', JSON.stringify(loginUserDTO, null, 2));
    const response = await this.userAuthService.login(loginUserDTO);
    console.log('Login response sent:', JSON.stringify(response, null, 2));
    return response;
  }

  @HttpCode(200)
  @Post('reset-password')
  async userPasswordReset(@Body() request: ForgotPasswordDTO) {
    return this.userAuthService.requestPasswordReset(request);
  }

  @Put('set-password')
  async userSetNewPassword(
    @Body() request: ResetPasswordDTO,
    @Request() authorizedUser: JwtPayload,
  ) {
    return this.userAuthService.setNewPassword(request, authorizedUser);
  }

  // Temporary debug endpoint - remove after testing
  @Post('debug-users')
  async debugUsers() {
    return this.userAuthService.debugUsers();
  }

  // New password reset endpoints
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 300000, limit: 3 } }) // 3 requests per 5 minutes
  @Post('forgot-password')
  async forgotPassword(@Body() request: ForgotPasswordDTO) {
    return this.userAuthService.forgotPassword(request);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 300000, limit: 5 } }) // 5 requests per 5 minutes
  @Post('verify-otp')
  async verifyOtp(@Body() request: VerifyOtpDTO) {
    return this.userAuthService.verifyOtp(request);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 300000, limit: 3 } }) // 3 requests per 5 minutes
  @Post('set-password')
  async resetPassword(@Body() request: ResetPasswordDTO) {
    return this.userAuthService.resetPassword(request);
  }

  // Email verification endpoints
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 300000, limit: 3 } }) // 3 requests per 5 minutes
  @Post('verify-email')
  async verifyEmail(@Body() request: VerifyEmailDTO) {
    return this.userAuthService.verifyEmail(request);
  }

  // Pre-verification registration endpoints
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 300000, limit: 3 } }) // 3 requests per 5 minutes
  @Post('verify-registration')
  async verifyRegistration(@Body() request: VerifyRegistrationDTO) {
    return this.userAuthService.verifyRegistration(request);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 300000, limit: 3 } }) // 3 requests per 5 minutes
  @Post('resend-registration-verification')
  async resendRegistrationVerification(@Body() request: ResendVerificationDTO) {
    return this.userAuthService.resendRegistrationVerification(request);
  }

  // Debug endpoint - remove after testing
  @Get('debug-temp-registrations')
  async debugTempRegistrations() {
    return this.userAuthService.debugTempRegistrations();
  }

  // Debug endpoint to check user verification status
  @Get('debug-user-verification/:email')
  async debugUserVerification(@Param('email') email: string) {
    return this.userAuthService.debugUserVerification(email);
  }

  // Manual fix endpoint for email verification (for testing)
  @Post('fix-email-verification/:email')
  async fixEmailVerification(@Param('email') email: string) {
    return this.userAuthService.fixEmailVerification(email);
  }

  // Database health check endpoint
  @Get('database-health')
  async databaseHealthCheck() {
    return this.userAuthService.databaseHealthCheck();
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 300000, limit: 3 } }) // 3 requests per 5 minutes
  @Post('resend-verification')
  async resendVerificationEmail(@Body() request: { email: string }) {
    return this.userAuthService.resendVerificationEmail(request);
  }

  // Test endpoint to check login response format
  @Post('test-login-response')
  async testLoginResponse() {
    const mockResponse = {
      success: true,
      message: 'Login successful',
      data: {
        jwtToken: 'mock-jwt-token-12345',
        user: {
          identifier: 'test-user-123',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          isStudent: false,
          matricNumber: null
        }
      }
    };

    console.log('Test login response:', JSON.stringify(mockResponse, null, 2));
    return mockResponse;
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Put,
  Query,
  Request,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DriverAuthService } from '../services/driver.auth.service';
import { DriverService } from '../services/drivers.service';
import { CreateDriverDTO } from '../dto/createDriver';
import { LoginDriverDTO } from '../dto/loginDriver';
import { RequestPasswordResetDTO } from '../dto/requestPasswordReset';
import { SetNewPasswordDTO } from '../dto/setNewPassword';
import { JwtPayload } from 'src/interfaces/jwt';
import { DriverVerifyRegistrationDTO } from '../dto/verifyRegistration';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { DriverForgotPasswordDTO } from '../dto/forgotPassword';
import { DriverVerifyOtpDTO } from '../dto/verifyOtp';
import { DriverResetPasswordDTO } from '../dto/resetPassword';
import { DriverProfileService } from '../services/driver.profile.service';
import { AuthGuard } from '@nestjs/passport';

class ResendOtpDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

@Controller({ version: '1', path: 'driver/auth' })
export class DriverAuthController {
  constructor(
    @Inject(DriverAuthService)
    private readonly driverAuthService: DriverAuthService,
    @Inject(DriverService)
    private readonly driverService: DriverService,
    private readonly driverProfileService: DriverProfileService,
  ) { }

  @HttpCode(201)
  @Post('register')
  async createDriverUser(@Body() request: CreateDriverDTO) {
    return this.driverAuthService.register(request);
  }

  @HttpCode(200)
  @Get('verify')
  async verifyEmail(@Query('token') token: string) {
    return this.driverAuthService.verifyHotlink(token.trim());
  }

  @Post('login')
  async loginDriverUser(@Body() request: LoginDriverDTO) {
    return this.driverAuthService.login(request);
  }

  @HttpCode(200)
  @Post('reset-password')
  async driverPasswordReset(@Body() request: RequestPasswordResetDTO) {
    return this.driverAuthService.requestPasswordReset(request);
  }

  @Put('reset-password')
  async driverSetNewPassword(
    @Body() request: SetNewPasswordDTO,
    @Request() authorizedUser: JwtPayload,
  ) {
    return this.driverAuthService.setNewPassword(request, authorizedUser);
  }

  @Post('verify-registration')
  async verifyDriverRegistration(@Body() request: DriverVerifyRegistrationDTO) {
    console.log('Received verify-registration request:', request);
    return this.driverAuthService.verifyOtp(request.email, request.otp);
  }

  @Post('resend-verification')
  async resendDriverOtp(@Body() request: ResendOtpDTO) {
    return this.driverAuthService.resendOtp(request.email);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() request: DriverForgotPasswordDTO) {
    return this.driverAuthService.forgotPassword(request);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() request: DriverVerifyOtpDTO) {
    return this.driverAuthService.verifyOtpForPasswordReset(request);
  }

  @Post('set-password')
  async setPassword(@Body() request: DriverResetPasswordDTO) {
    return this.driverAuthService.resetPassword(request);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req: any) {
    return this.driverProfileService.getProfile(req.user);
  }

  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Request() req: any, @Body() updateDto: any) {
    return this.driverProfileService.updateProfile(req.user, updateDto);
  }
}

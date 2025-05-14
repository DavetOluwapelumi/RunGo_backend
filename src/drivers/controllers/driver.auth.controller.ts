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
} from '@nestjs/common';
import { DriverAuthService } from '../services/driver.auth.service';
import { DriverService } from '../services/drivers.service';
import { CreateDriverDTO } from '../dto/createDriver';
import { LoginDriverDTO } from '../dto/loginDriver';
import { RequestPasswordResetDTO } from '../dto/requestPasswordReset';
import { SetNewPasswordDTO } from '../dto/setNewPassword';
import { JwtPayload } from 'src/interfaces/jwt';

@Controller({ version: '1', path: 'driver/auth' })
export class DriverAuthController {
  constructor(
    @Inject(DriverAuthService)
    private readonly driverAuthService: DriverAuthService,
    @Inject(DriverService)
    private readonly driverService: DriverService,
  ) {}

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
}

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
} from '@nestjs/common';
import { AdminAuthService } from '../services/admin.auth.service';
import { CreateAdminDTO } from 'src/admin/dto/createAdmin';
import { LoginAdminDTO } from '../dto/loginAdmin';
import { RequestPasswordResetDTO } from '../dto/requestPasswordReset';
import { SetNewPasswordDTO } from '../dto/setNewPassword';
import { JwtPayload } from 'src/interfaces/jwt';

@Controller({ version: '1', path: 'admin/auth' })
export class AdminAuthController {
  constructor(
    @Inject(AdminAuthService)
    private readonly adminAuthService: AdminAuthService,
  ) {}

  @HttpCode(201)
  @Post('register')
  async createAdminUser(@Body() request: CreateAdminDTO) {
    return this.adminAuthService.register(request);
  }

  @HttpCode(200)
  @Get('verify')
  async verifyEmail(@Query('token') token: string) {
    return this.adminAuthService.verifyHotlink(token.trim());
  }

  @Post('login')
  async loginAdminUser(@Body() request: LoginAdminDTO) {
    return this.adminAuthService.login(request);
  }

  @Post('password')
  async adminPasswordReset(@Body() request: RequestPasswordResetDTO) {
    return this.adminAuthService.requestPasswordReset(request);
  }

  @Put('password')
  async adminSetNewPassword(
    @Body() request: SetNewPasswordDTO,
    @Request() authorizedUser: JwtPayload,
  ) {
    return this.adminAuthService.setNewPassword(request, authorizedUser);
  }
}

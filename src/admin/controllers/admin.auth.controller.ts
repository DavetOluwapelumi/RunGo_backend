import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { AdminAuthService } from '../services/admin.auth.service';
import { CreateAdminDTO } from 'src/admin/dto/createAdmin';
import { LoginAdminDTO } from '../dto/loginAdmin';
import { RequestPasswordResetDTO } from '../dto/requestPasswordReset';

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

  @Post('login')
  async loginAdminUser(@Body() request: LoginAdminDTO) {
    return this.adminAuthService.login(request);
  }

  @Post('reset-password')
  async adminPasswordReset(@Body() request: RequestPasswordResetDTO) {
    return this.adminAuthService.requestPasswordReset(request);
  }
}

import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthService } from '../services/admin.auth.service';
import { CreateAdminDTO } from 'src/admin/dto/createAdmin';
import { LoginAdminDTO } from '../dto/loginAdmin';
import { ForgottenPasswordDTO } from '../dto/requestPasswordReset';
import { SetNewPasswordDTO } from '../dto/setNewPassword';
import { AdminAuthGuard } from '../admin.auth.guard';

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
  @Post('login')
  async loginAdminUser(@Body() request: LoginAdminDTO) {
    return this.adminAuthService.login(request);
  }

  @HttpCode(200)
  @Post('forgotten-password')
  async forgottenPassword(@Body() request: ForgottenPasswordDTO) {
    return this.adminAuthService.forgottenPassword(request);
  }

  @UseGuards(AdminAuthGuard)
  @HttpCode(200)
  @Post('set-new-password')
  async setNewPassword(@Body() body: SetNewPasswordDTO, @Req() req: any) {
    return this.adminAuthService.setNewPassword(body, req.admin);
  }
}

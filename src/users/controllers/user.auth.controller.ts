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
import { UserAuthService } from '../services/user.auth.service';
import { CreateUserDTO } from '../dto/createUser';
import { LoginUserDTO } from '../dto/loginUser';
import { RequestPasswordResetDTO } from '../dto/requestPasswordReset';
import { SetNewPasswordDTO } from '../dto/setNewPassword';
import { JwtPayload } from 'src/interfaces/jwt';

@Controller({ version: '1', path: 'user/auth' })
export class UserAuthController {
  constructor(
    @Inject(UserAuthService)
    private readonly userAuthService: UserAuthService,
  ) {}

  @HttpCode(201)
  @Post('register')
  async createUser(@Body() request: CreateUserDTO) {
    return this.userAuthService.register(request);
  }
}

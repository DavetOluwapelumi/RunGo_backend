import { All, Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller({ version: '1' })
export class AppController {
  constructor(private readonly appService: AppService) { }

  @All('/health')
  healthCheck() {
    return this.appService.healthCheck();
  }

  @Get('api-info')
  getApiInfo() {
    return {
      version: '1.0.0',
      endpoints: {
        health: '/v1/health',
        userLogin: '/v1/user/auth/login',
        userRegister: '/v1/user/auth/register',
        testLoginResponse: '/v1/user/auth/test-login-response'
      },
      port: process.env.PORT || 3000
    };
  }
}

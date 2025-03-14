import { All, Controller } from '@nestjs/common';
import { AppService } from './app.service';

@Controller({ version: '1' })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @All('/health')
  healthCheck() {
    return this.appService.healthCheck();
  }
}

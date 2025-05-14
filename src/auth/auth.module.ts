import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { CommonAuthService } from './auth.service.common';
import { JWT_SECRET } from 'src/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [],
  providers: [CommonAuthService],
  exports: [CommonAuthService],
  imports: [
    JwtModule.register({
      global: true,
      secret: JWT_SECRET,
      signOptions: { expiresIn: '120s' },
    }),
  ],
})
export class AuthModule { }

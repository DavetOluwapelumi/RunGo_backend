import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { CommonAuthService } from './auth.service.common';
import { JWT_SECRET } from 'src/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  controllers: [],
  providers: [
    CommonAuthService,
    JwtStrategy,
  ],
  exports: [
    CommonAuthService,
    JwtModule,
    PassportModule,
  ],
  imports: [
    JwtModule.register({
      global: true,
      secret: JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    PassportModule,
  ],
})
export class AuthModule { }

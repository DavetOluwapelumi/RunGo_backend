import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpService } from './otp.service';
import { OtpEntity } from '../entities/otp.entity';

@Module({
  providers: [OtpService],
  exports: [OtpService],
  imports: [TypeOrmModule.forFeature([OtpEntity])],
})
export class OtpModule {}

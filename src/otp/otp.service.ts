import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpEntity } from '../entities/otp.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OtpEntity)
    private readonly otpRepository: Repository<OtpEntity>,
  ) {}

  async generateOtp(): Promise<OtpEntity> {
    const otp = this.otpRepository.create();
    return await this.otpRepository.save(otp);
  }

  async validateOtp(identifier: string, token: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({ where: { identifier, token } });
    if (!otp) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return otp.validityPeriod >= currentTime;
  }
}
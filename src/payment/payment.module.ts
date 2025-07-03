import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import paystackConfig from '../config/paystack.config';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Payment from '../entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    ConfigModule.forFeature(paystackConfig),
  ],
  providers: [
    {
      provide: 'paystack',
      useFactory: (configService: ConfigService) => configService.get('paystack'),
      inject: [ConfigService],
    },
    PaymentService,
  ],
  exports: [PaymentService],
})
export class PaymentModule { }

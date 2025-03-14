import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Booking from '../entities/booking.entity';
import { PaymentModule } from 'src/payment/payment.module';
import Payment from '../entities/payment.entity';
import User from '../entities/users.entity';
import Car from '../entities/car.entity';
import { PaymentService } from '../payment/payment.service';

@Module({
  providers: [BookingService, PaymentService],
  controllers: [BookingController],
  imports: [
    TypeOrmModule.forFeature([Booking, Payment, User, Car]),
    PaymentModule,
  ],
})
export class BookingModule {}

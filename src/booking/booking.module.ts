import { forwardRef, Module } from '@nestjs/common';
import { BookingService } from './service/booking.service';
import { BookingController } from './controller/booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Booking from '../entities/booking.entity';
import { PaymentModule } from 'src/payment/payment.module';
import Payment from '../entities/payment.entity';
import User from '../entities/users.entity';
import Car from '../entities/car.entity';
import { PaymentService } from '../payment/payment.service';
import { DriversModule } from '../drivers/drivers.module';
import { UsersModule } from '../users/users.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  providers: [BookingService, PaymentService],
  controllers: [BookingController],
  imports: [forwardRef(() => AdminModule),
  TypeOrmModule.forFeature([Booking, Payment, User, Car]),
    PaymentModule, DriversModule, UsersModule,
  ],
})
export class BookingModule { }

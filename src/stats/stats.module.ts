import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { DriversModule } from 'src/drivers/drivers.module';
import { AdminModule } from 'src/admin/admin.module';
import { UsersModule } from 'src/users/users.module';
import { BookingModule } from 'src/booking/booking.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [
    DriversModule,
    AdminModule,
    UsersModule,
    BookingModule,
    PaymentModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}

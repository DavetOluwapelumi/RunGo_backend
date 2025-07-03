import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverGatewayGateway } from './driver_gateway.gateway';
import { DriversModule } from '../drivers/drivers.module';
import { BookingModule } from '../booking/booking.module'; // Import BookingModule
import { RideRequest } from '../entities/rideRequest.entity';

@Module({
  imports: [
    DriversModule,
    BookingModule, // Add this to get access to RideRequestService
    TypeOrmModule.forFeature([RideRequest]),
  ],
  providers: [DriverGatewayGateway],
})
export class DriverGatewayModule { }
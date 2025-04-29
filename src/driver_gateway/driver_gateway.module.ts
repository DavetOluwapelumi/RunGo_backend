import { Module } from '@nestjs/common';
import { DriverGatewayGateway } from './driver_gateway.gateway';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [DriversModule],
  providers: [DriverGatewayGateway]
})
export class DriverGatewayModule {}

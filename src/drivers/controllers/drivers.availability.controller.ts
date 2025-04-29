import {
    Body,
    Controller,
    Get,
    HttpCode,
    Inject,
    Put,
     NotFoundException, Param
  } from '@nestjs/common';
import { DriverAuthService } from '../services/driver.auth.service';
import { DriverService } from '../services/drivers.service';


@Controller({ version: '1', path: 'driver/availability' })
export class DriverAvailabilityController {
    constructor(
    @Inject(DriverAuthService)
    private readonly driverAuthService: DriverAuthService,
    @Inject(DriverService)
    private readonly driverService: DriverService,
  ) {}
  
  @HttpCode(200)
  @Put('availability/:driverId')
  async updateDriverAvailability(
    @Param('driverId') driverId: string,
    @Body('isAvailable') isAvailable: boolean,
  ){
    await this.driverService.updateDriverAvailability(driverId, isAvailable);
    return { message: `Driver ${driverId} availability updated to ${isAvailable}` };
  }

  @HttpCode(200)
  @Get('availability/:driverId')
  async getDriverAvailability(@Param('driverId') driverId: string) {
    const driver = await this.driverService.findOneByIdentifier(driverId);
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    return { isAvailable: driver.isAvailable };
  }

}
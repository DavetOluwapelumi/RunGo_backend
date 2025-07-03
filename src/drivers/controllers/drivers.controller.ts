import { Controller, Body, Put, Param, Get, HttpCode, NotFoundException, Inject } from '@nestjs/common';
import { DriverService } from '../services/drivers.service';

@Controller('drivers')
export class DriversController {
    constructor(
        @Inject(DriverService)
        private readonly driverService: DriverService,
    ) { }

    // Update driver's current location
    @HttpCode(200)
    @Put(':driverId/location')
    async updateDriverLocation(
        @Param('driverId') driverId: string,
        @Body('latitude') latitude: number,
        @Body('longitude') longitude: number,
    ) {
        await this.driverService.updateDriverLocation(driverId, latitude, longitude);
        return { message: 'Driver location updated successfully' };
    }

    // Get driver's current location
    @Get(':driverId/location')
    async getDriverLocation(@Param('driverId') driverId: string) {
        const location = await this.driverService.getDriverLocation(driverId);
        if (!location) {
            throw new NotFoundException('Driver not found');
        }
        return location;
    }
}

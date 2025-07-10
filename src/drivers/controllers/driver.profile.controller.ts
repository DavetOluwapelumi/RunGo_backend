import { Controller, Get, Put, Body, Request, UseGuards } from '@nestjs/common';
import { DriverProfileService } from '../services/driver.profile.service';
// import { AuthGuard } from 'src/auth/auth.guard'; // Uncomment if you have a custom AuthGuard

@Controller({ version: '1', path: 'driver/profile' })
export class DriverProfileController {
    constructor(private readonly driverProfileService: DriverProfileService) { }

    // @UseGuards(AuthGuard) // Uncomment if you have a custom AuthGuard
    @Get()
    async getProfile(@Request() req: any) {
        // Assume req.user contains the authenticated driver's info (e.g., from JWT)
        return this.driverProfileService.getProfile(req.user);
    }

    // @UseGuards(AuthGuard)
    @Put()
    async updateProfile(@Request() req: any, @Body() updateDto: any) {
        return this.driverProfileService.updateProfile(req.user, updateDto);
    }
}

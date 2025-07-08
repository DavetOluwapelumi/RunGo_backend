import { Controller, Get, Post, Put, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { LocationService } from './location.service';
import { Location } from '../entities/location.entity';
import { LocationPricing } from '../entities/locationPricing.entity';

@Controller({ version: '1', path: 'location' })
export class LocationController {
    constructor(private readonly locationService: LocationService) { }

    @Get()
    async getAllLocations(): Promise<Location[]> {
        return this.locationService.getAllLocations();
    }

    @Get('pricing')
    async getAllPricing(): Promise<LocationPricing[]> {
        return this.locationService.getAllPricing();
    }

    @Get('price/:pickupLocation/:dropoffLocation')
    async getPriceBetweenLocations(
        @Param('pickupLocation') pickupLocation: string,
        @Param('dropoffLocation') dropoffLocation: string,
    ): Promise<{ price: number; pickupLocation: string; dropoffLocation: string }> {
        const price = await this.locationService.getPriceBetweenLocations(pickupLocation, dropoffLocation);
        return {
            price,
            pickupLocation,
            dropoffLocation,
        };
    }

    @Put('pricing')
    @HttpCode(HttpStatus.OK)
    async updatePricing(
        @Body() body: {
            pickupLocation: string;
            dropoffLocation: string;
            price: number;
        },
    ): Promise<LocationPricing> {
        return this.locationService.updatePricing(
            body.pickupLocation,
            body.dropoffLocation,
            body.price,
        );
    }

    @Post('seed')
    @HttpCode(HttpStatus.OK)
    async seedData(): Promise<{ message: string }> {
        await this.locationService.seedLocations();
        await this.locationService.seedPricing();
        return { message: 'Locations and pricing seeded successfully' };
    }
} 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { Location } from '../entities/location.entity';
import { LocationPricing } from '../entities/locationPricing.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Location, LocationPricing]),
    ],
    controllers: [LocationController],
    providers: [LocationService],
    exports: [LocationService],
})
export class LocationModule { } 
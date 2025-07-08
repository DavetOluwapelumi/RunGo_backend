import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../entities/location.entity';
import { LocationPricing } from '../entities/locationPricing.entity';
import { CarType } from '../enums/carType.enum';

@Injectable()
export class LocationService {
    constructor(
        @InjectRepository(Location)
        private readonly locationRepository: Repository<Location>,
        @InjectRepository(LocationPricing)
        private readonly locationPricingRepository: Repository<LocationPricing>,
    ) { }

    async getAllLocations(): Promise<Location[]> {
        return this.locationRepository.find({ where: { isActive: true } });
    }

    async getLocationById(id: string): Promise<Location> {
        const location = await this.locationRepository.findOne({ where: { id, isActive: true } });
        if (!location) {
            throw new NotFoundException('Location not found');
        }
        return location;
    }

    async getLocationByName(name: string): Promise<Location> {
        const location = await this.locationRepository.findOne({ where: { location: name, isActive: true } });
        if (!location) {
            throw new NotFoundException('Location not found');
        }
        return location;
    }

    async getPriceBetweenLocations(pickupLocationName: string, dropoffLocationName: string): Promise<number> {
        // Get location IDs
        const pickupLocation = await this.getLocationByName(pickupLocationName);
        const dropoffLocation = await this.getLocationByName(dropoffLocationName);

        // Check if same location
        if (pickupLocation.id === dropoffLocation.id) {
            throw new Error('Pickup and dropoff locations cannot be the same');
        }

        // Find pricing
        const pricing = await this.locationPricingRepository.findOne({
            where: {
                pickupLocationId: pickupLocation.id,
                dropoffLocationId: dropoffLocation.id,
                isActive: true,
            },
        });

        if (!pricing) {
            throw new NotFoundException(`No pricing found for route: ${pickupLocationName} to ${dropoffLocationName}`);
        }

        return pricing.price;
    }

    async getAllPricing(): Promise<LocationPricing[]> {
        return this.locationPricingRepository.find({
            where: { isActive: true },
            relations: ['pickupLocation', 'dropoffLocation'],
        });
    }

    async updatePricing(
        pickupLocationName: string,
        dropoffLocationName: string,
        newPrice: number,
    ): Promise<LocationPricing> {
        const pickupLocation = await this.getLocationByName(pickupLocationName);
        const dropoffLocation = await this.getLocationByName(dropoffLocationName);

        let pricing = await this.locationPricingRepository.findOne({
            where: {
                pickupLocationId: pickupLocation.id,
                dropoffLocationId: dropoffLocation.id,
            },
        });

        if (pricing) {
            pricing.price = newPrice;
            return this.locationPricingRepository.save(pricing);
        } else {
            pricing = this.locationPricingRepository.create({
                pickupLocationId: pickupLocation.id,
                dropoffLocationId: dropoffLocation.id,
                price: newPrice,
            });
            return this.locationPricingRepository.save(pricing);
        }
    }

    async seedLocations(): Promise<void> {
        const locations = [
            "ACEGID (Along Engr Faculty)",
            "BMS",
            "CCBR",
            "Container",
            "Engineering Faculty",
            "Engineering Hostel",
            "Event Center",
            "Extension Region",
            "Faculty of Humanities and Social Sciences",
            "Female Hostel First Gate",
            "Guest Hostel",
            "Health Center",
            "Library Region",
            "Lecture Rooms Regions",
            "Manna Palace Cafeteria",
            "Number Bukateria",
            "Prophet Moses Hall Region",
            "Staff Quarters",
            "Tourism Village Region",
            "University Auditorium Region"
        ];

        for (const locationName of locations) {
            const existingLocation = await this.locationRepository.findOne({
                where: { location: locationName }
            });

            if (!existingLocation) {
                const location = this.locationRepository.create({ location: locationName });
                await this.locationRepository.save(location);
            }
        }
    }

    async seedPricing(): Promise<void> {
        const locations = await this.getAllLocations();
        const carTypes: CarType[] = Object.values(CarType);

        // Define regions as per user specification
        const regions = {
            mainSchool: [
                "University Auditorium Region", "Manna Palace Cafeteria", "Lecture Rooms Regions", "Library Region",
                "Container", "Tourism Village Region", "Faculty of Humanities and Social Sciences", "Health Center"
            ],
            healthCenter: [
                "Prophet Moses Hall Region", "Extension Region", "Health Center"
            ],
            secondGate: [
                "CCBR", "Event Center", "ACEGID (Along Engr Faculty)"
            ],
            staffQuarters: [
                "Female Hostel First Gate", "Staff Quarters"
            ],
            engineering: [
                "Engineering Faculty", "Engineering Hostel", "BMS", "Guest Hostel", "ACEGID (Along Engr Faculty)"
            ],
            numbersBukateria: [
                "Number Bukateria", "Female Hostel First Gate"
            ]
        };

        // Helper to get all region keys a location belongs to
        function getRegions(location: string): string[] {
            return Object.entries(regions)
                .filter(([_, locs]) => locs.includes(location))
                .map(([region]) => region);
        }

        // Helper to check if two locations are in two specific regions (in any order)
        function isRegionPair(pickup: string, dropoff: string, regionA: string, regionB: string): boolean {
            const pickupRegions = getRegions(pickup);
            const dropoffRegions = getRegions(dropoff);
            return (
                (pickupRegions.includes(regionA) && dropoffRegions.includes(regionB)) ||
                (pickupRegions.includes(regionB) && dropoffRegions.includes(regionA))
            );
        }

        // Pricing rules as per user
        function getPrice(pickup: string, dropoff: string, carType: CarType): number {
            if (isRegionPair(pickup, dropoff, 'mainSchool', 'healthCenter')) {
                return carType === CarType.KEKE ? 400 : 800;
            }
            if (isRegionPair(pickup, dropoff, 'mainSchool', 'secondGate')) {
                return carType === CarType.KEKE ? 400 : 800;
            }
            if (isRegionPair(pickup, dropoff, 'engineering', 'mainSchool')) {
                return carType === CarType.KEKE ? 600 : 1200;
            }
            if (isRegionPair(pickup, dropoff, 'engineering', 'numbersBukateria')) {
                return carType === CarType.KEKE ? 450 : 1000;
            }
            if (isRegionPair(pickup, dropoff, 'staffQuarters', 'mainSchool')) {
                return carType === CarType.KEKE ? 600 : 1200;
            }
            if (isRegionPair(pickup, dropoff, 'healthCenter', 'engineering')) {
                return carType === CarType.KEKE ? 600 : 1200;
            }
            if (isRegionPair(pickup, dropoff, 'staffQuarters', 'healthCenter')) {
                return carType === CarType.KEKE ? 400 : 1200;
            }

            // Default price if no rule matches
            if (carType === CarType.KEKE) {
                return 400;
            } else {
                return 600;
            }
        }

        for (let i = 0; i < locations.length; i++) {
            for (let j = 0; j < locations.length; j++) {
                if (i !== j) {
                    const pickupLocation = locations[i];
                    const dropoffLocation = locations[j];

                    for (const carType of carTypes) {
                        const existingPricing = await this.locationPricingRepository.findOne({
                            where: {
                                pickupLocationId: pickupLocation.id,
                                dropoffLocationId: dropoffLocation.id,
                                carType,
                            }
                        });
                        if (!existingPricing) {
                            const price = getPrice(pickupLocation.location, dropoffLocation.location, carType);
                            console.log(`Seeding: ${pickupLocation.location} -> ${dropoffLocation.location} [${carType}] = ${price}`);
                            const pricing = this.locationPricingRepository.create({
                                pickupLocationId: pickupLocation.id,
                                dropoffLocationId: dropoffLocation.id,
                                price: price,
                                carType,
                            });
                            await this.locationPricingRepository.save(pricing);
                        }
                    }
                }
            }
        }
    }
} 
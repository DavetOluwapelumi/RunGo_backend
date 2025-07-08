import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../entities/location.entity';
import { LocationPricing } from '../entities/locationPricing.entity';

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

        // Base price for all routes (you can customize this)
        const basePrice = 500; // ₦500 base price

        for (let i = 0; i < locations.length; i++) {
            for (let j = 0; j < locations.length; j++) {
                if (i !== j) { // Don't create pricing for same location
                    const pickupLocation = locations[i];
                    const dropoffLocation = locations[j];

                    // Check if pricing already exists
                    const existingPricing = await this.locationPricingRepository.findOne({
                        where: {
                            pickupLocationId: pickupLocation.id,
                            dropoffLocationId: dropoffLocation.id,
                        }
                    });

                    if (!existingPricing) {
                        // Calculate price based on distance (you can customize this logic)
                        const price = this.calculatePrice(pickupLocation.location, dropoffLocation.location, basePrice);

                        const pricing = this.locationPricingRepository.create({
                            pickupLocationId: pickupLocation.id,
                            dropoffLocationId: dropoffLocation.id,
                            price: price,
                        });

                        await this.locationPricingRepository.save(pricing);
                    }
                }
            }
        }
    }

    private calculatePrice(pickup: string, dropoff: string, basePrice: number): number {
        // Simple pricing logic - you can make this more sophisticated
        // For now, using base price for all routes
        // You can add distance-based pricing, zone-based pricing, etc.

        // Example: Different pricing for different zones
        const engineeringZone = ['Engineering Faculty', 'Engineering Hostel', 'ACEGID (Along Engr Faculty)'];
        const academicZone = ['Library Region', 'Lecture Rooms Regions', 'Faculty of Humanities and Social Sciences'];
        const residentialZone = ['Female Hostel First Gate', 'Guest Hostel', 'Staff Quarters'];
        const commercialZone = ['Manna Palace Cafeteria', 'Number Bukateria', 'Event Center'];

        const pickupZone = this.getZone(pickup);
        const dropoffZone = this.getZone(dropoff);

        // Same zone: lower price
        if (pickupZone === dropoffZone) {
            return basePrice * 0.8; // 20% discount for same zone
        }

        // Adjacent zones: base price
        if (this.areAdjacentZones(pickupZone, dropoffZone)) {
            return basePrice;
        }

        // Far zones: higher price
        return basePrice * 1.2; // 20% premium for far zones
    }

    private getZone(location: string): string {
        const engineeringZone = ['Engineering Faculty', 'Engineering Hostel', 'ACEGID (Along Engr Faculty)'];
        const academicZone = ['Library Region', 'Lecture Rooms Regions', 'Faculty of Humanities and Social Sciences'];
        const residentialZone = ['Female Hostel First Gate', 'Guest Hostel', 'Staff Quarters'];
        const commercialZone = ['Manna Palace Cafeteria', 'Number Bukateria', 'Event Center'];

        if (engineeringZone.includes(location)) return 'engineering';
        if (academicZone.includes(location)) return 'academic';
        if (residentialZone.includes(location)) return 'residential';
        if (commercialZone.includes(location)) return 'commercial';

        return 'other'; // For locations not in specific zones
    }

    private areAdjacentZones(zone1: string, zone2: string): boolean {
        // Define which zones are adjacent
        const adjacentZones = {
            'engineering': ['academic', 'commercial'],
            'academic': ['engineering', 'residential'],
            'residential': ['academic', 'commercial'],
            'commercial': ['engineering', 'residential'],
        };

        return adjacentZones[zone1]?.includes(zone2) || adjacentZones[zone2]?.includes(zone1);
    }
} 
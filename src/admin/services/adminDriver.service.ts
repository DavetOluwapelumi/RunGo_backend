import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DriverService } from 'src/drivers/services/drivers.service';
import Driver from 'src/entities/driver.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDriverDTO } from 'src/drivers/dto/createDriver';

@Injectable()
export class AdminDriverService {
    constructor(
        private readonly driverService: DriverService, // Reuse existing driver service
        @InjectRepository(Driver)
        private readonly driverRepository: Repository<Driver>, // For admin-specific operations
    ) { }

    // Add a driver manually
    public async addDriverManually(payload: CreateDriverDTO): Promise<Driver> {
        console.log('Payload received:', payload);
        const { firstName, lastName, email, phoneNumber, password } = payload;

        // Validate required fields
        if (!firstName || !lastName || !email || !phoneNumber || !password) {
            throw new BadRequestException(
                'Missing required fields: firstName, lastName, email, phoneNumber, or password',
            );
        }

        // Create and save the new driver
        const newDriver = this.driverRepository.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            password,
            isAvailable: true, // Default value
            isVerified: false, // Default value
            completedRides: 0, // Default value
            averageRating: 0, // Default value
        });

        return await this.driverRepository.save(newDriver);
    }

    // View all drivers
    public async getAllDrivers(): Promise<Driver[]> {
        return await this.driverRepository.find();
    }

    // Find driver by identifier
    public async findDriverByIdentifier(identifier: string): Promise<Driver> {
        const driver = await this.driverService.findOneByIdentifier(identifier);
        if (!driver) {
            throw new NotFoundException('Driver not found');
        }
        return driver;
    }

    // Suspend a driver
    public async suspendDriver(identifier: string): Promise<void> {
        await this.driverService.updateDriverAvailability(identifier, false);
    }

    // Unsuspend a driver
    public async unsuspendDriver(identifier: string): Promise<void> {
        await this.driverService.updateDriverAvailability(identifier, true);
    }

    // Delete a driver
    public async deleteDriver(identifier: string): Promise<void> {
        const driver = await this.driverService.findOneByIdentifier(identifier);
        if (!driver) {
            throw new NotFoundException('Driver not found');
        }
        await this.driverRepository.remove(driver);
    }

    // Update driver details
    public async updateDriverDetails(identifier: string, updateData: Partial<Driver>): Promise<Driver> {
        const driver = await this.driverService.findOneByIdentifier(identifier);
        if (!driver) {
            throw new NotFoundException('Driver not found');
        }
        Object.assign(driver, updateData);
        return await this.driverRepository.save(driver);
    }

    // View driver stats (e.g., completed rides, ratings)
    public async viewDriverStats(identifier: string): Promise<any> {
        const driver = await this.driverService.findOneByIdentifier(identifier);
        if (!driver) {
            throw new NotFoundException('Driver not found');
        }
        // Example stats (replace with actual logic)
        return {
            completedRides: driver.completedRides || 0,
            averageRating: driver.averageRating || 0,
        };
    }
}


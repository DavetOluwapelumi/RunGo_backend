import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Driver from '../../entities/driver.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DriverProfileService {
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>;

    async getProfile(user: any) {
        // user should have email or identifier
        const driver = await this.driverRepository.findOneBy({ email: user.userEmail });
        if (!driver) {
            throw new NotFoundException('Driver not found');
        }
        // Optionally omit sensitive fields
        const { password, ...profile } = driver;
        return profile;
    }

    async updateProfile(user: any, updateDto: any) {
        const driver = await this.driverRepository.findOneBy({ email: user.userEmail });
        if (!driver) {
            throw new NotFoundException('Driver not found');
        }
        // Only allow updating certain fields
        const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'carIdentifier'];
        for (const key of allowedFields) {
            if (updateDto[key] !== undefined) {
                driver[key] = updateDto[key];
            }
        }
        await this.driverRepository.save(driver);
        const { password, ...profile } = driver;
        return profile;
    }
}

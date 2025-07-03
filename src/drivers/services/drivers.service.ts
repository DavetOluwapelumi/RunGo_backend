import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Driver from '../../entities/driver.entity';
import { Repository } from 'typeorm';
import { CreateDriverDTO } from '../dto/createDriver';
import { ApiResponse } from 'src/adapters/apiResponse';

@Injectable()
export class DriverService {
  @InjectRepository(Driver)
  private readonly driverRepository: Repository<Driver>;

  public async findOneByEmail(email: string): Promise<Driver> {
    return await this.driverRepository.findOneBy({ email });
  }

  public async findOneByIdentifier(identifier: string): Promise<Driver> {
    return await this.driverRepository.findOneBy({ identifier });
  }

  public async create(payload: CreateDriverDTO): Promise<Driver> {
    const { email, password, firstName, lastName, phoneNumber } = payload;
    const newDriver = this.driverRepository.create();

    newDriver.email = email;
    newDriver.password = password;
    newDriver.firstName = firstName;
    newDriver.lastName = lastName;
    newDriver.phoneNumber = phoneNumber;

    return await this.driverRepository.save(newDriver);
  }

  public async updateDriverAvailability(
    identifier: string,
    isAvailable: boolean,
  ): Promise<void> {
    await this.driverRepository.update({ identifier }, { isAvailable });
  }

  // New method to find an available driver
  public async findAvailableDriver(): Promise<Driver | null> {
    return await this.driverRepository.findOne({
      where: { isAvailable: true },
    });
  }
  // Return all available drivers
  async findAllAvailableDrivers() {
    const availableDrivers = await this.driverRepository.findBy({
      isAvailable: true,
    });

    // Add more details for frontend
    const driversWithDetails = availableDrivers.map(driver => ({
      identifier: driver.identifier,
      firstName: driver.firstName,
      lastName: driver.lastName,
      phoneNumber: driver.phoneNumber,
      averageRating: driver.averageRating,
      completedRides: driver.completedRides,
      carIdentifier: driver.carIdentifier,
      isAvailable: driver.isAvailable
    }));

    return new ApiResponse(
      'Available drivers retrieved successfully',
      driversWithDetails,
    );
  }

  // Update driver's current location
  public async updateDriverLocation(identifier: string, latitude: number, longitude: number): Promise<void> {
    await this.driverRepository.update({ identifier }, { currentLatitude: latitude, currentLongitude: longitude });
  }

  // Get driver's current location
  public async getDriverLocation(identifier: string): Promise<{ currentLatitude: number | null, currentLongitude: number | null } | null> {
    const driver = await this.driverRepository.findOneBy({ identifier });
    if (!driver) return null;
    return {
      currentLatitude: driver.currentLatitude,
      currentLongitude: driver.currentLongitude
    };
  }
}

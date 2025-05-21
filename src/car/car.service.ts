import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Car from '../entities/car.entity';
import Booking from '../entities/booking.entity';
import Driver from 'src/entities/driver.entity';
import { CreateCarDto } from './dto/registerCar';

@Injectable()
export class CarService {
    constructor(
        @InjectRepository(Car)
        private readonly carRepository: Repository<Car>,
        @InjectRepository(Driver)
        private readonly driverRepository: Repository<Driver>,

    ) { }

    // Register a new car
    public async registerCar(data: CreateCarDto, driverId: string): Promise<Car> {
        const driver = await this.driverRepository.findOneBy({ identifier: driverId });
        if (!driver) {
            throw new NotFoundException('Driver not found');
        }

        const car = this.carRepository.create({ ...data, driver });
        return await this.carRepository.save(car);
    }

    // Verify a car
    public async verifyCar(identifier: string): Promise<Car> {
        const car = await this.carRepository.findOneBy({ identifier });
        if (!car) {
            throw new NotFoundException('Car not found');
        }

        car.isVerified = true;
        return await this.carRepository.save(car);
    }

    // Update car availability
    public async updateCarAvailability(identifier: string, status: string): Promise<Car> {
        const car = await this.carRepository.findOneBy({ identifier });
        if (!car) {
            throw new NotFoundException('Car not found');
        }

        car.availabilityStatus = status;
        return await this.carRepository.save(car);
    }

    // Assign a car to a driver
    public async assignCarToDriver(carId: string, driverId: string): Promise<Car> {
        const car = await this.carRepository.findOneBy({ identifier: carId });
        if (!car) {
            throw new NotFoundException('Car not found');
        }

        const driver = await this.driverRepository.findOne({
            where: { identifier: driverId },
            relations: ['car'], // Include the car relation
        });

        if (!driver) {
            throw new NotFoundException('Driver not found');
        }

        if (driver.car) {
            throw new BadRequestException('Driver already has a car assigned');
        }

        car.driver = driver;
        return await this.carRepository.save(car);
    }

    // Get car history
    public async getCarHistory(identifier: string): Promise<Car> {
        const car = await this.carRepository.findOne({
            where: { identifier },
            relations: ['driver'], // Include driver details
        });

        if (!car) {
            throw new NotFoundException('Car not found');
        }

        return car;
    }
}

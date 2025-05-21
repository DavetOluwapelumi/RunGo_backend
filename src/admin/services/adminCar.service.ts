import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Car from '../../entities/car.entity';

@Injectable()
export class AdminCarService {
    constructor(
        @InjectRepository(Car)
        private readonly carRepository: Repository<Car>,
    ) { }

    async getAllCars() {
        return this.carRepository.find({ relations: ['driver'] });
    }

    async verifyCar(id: string) {
        const car = await this.carRepository.findOneBy({ identifier: id });
        if (!car) throw new NotFoundException('Car not found');
        car.isVerified = true;
        return this.carRepository.save(car);
    }

    async updateCarStatus(id: string, status: string) {
        const car = await this.carRepository.findOneBy({ identifier: id });
        if (!car) throw new NotFoundException('Car not found');
        car.availabilityStatus = status;
        return this.carRepository.save(car);
    }

    async deleteCar(id: string) {
        const car = await this.carRepository.findOneBy({ identifier: id });
        if (!car) throw new NotFoundException('Car not found');
        await this.carRepository.remove(car);
        return { message: 'Car deleted successfully' };
    }
}
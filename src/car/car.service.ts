import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Car from '../entities/car.entity';
import Booking from '../entities/booking.entity';
import Driver from 'src/entities/driver.entity';

@Injectable()
export class CarService {
    constructor(
        @InjectRepository(Car)
        private readonly carRepository: Repository<Car>,
        @InjectRepository(Driver)
        private readonly driverRepository: Repository<Driver>,
    ) { }

}

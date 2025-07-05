import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarService } from './car.service';
import { CarController } from './car.controller';
import Car from '../entities/car.entity';
import Driver from '../entities/driver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Car, Driver])],
  providers: [CarService],
  exports: [CarService],
  controllers: [CarController],
})
export class CarModule { }

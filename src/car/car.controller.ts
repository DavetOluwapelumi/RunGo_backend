import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { CarService } from './car.service';
import Car from '../entities/car.entity';
import { CreateCarDto } from './dto/registerCar';
import { UpdateCarAvailabilityDto } from './dto/updateCarAvailability';
import { UpdateCarTypeDto } from './dto/updateCarType.dto';

@Controller({ version: '1', path: 'cars' })
export class CarController {
  constructor(private readonly carService: CarService) { }

  @Post(':driverId/register')
  public async registerCar(
    @Param('driverId') driverId: string,
    @Body() data: CreateCarDto,
  ): Promise<{ message: string; data: Car }> {
    console.log('Received body:', data);
    return {
      message: 'Car registered successfully',
      data: await this.carService.registerCar(data, driverId)
    };
  }

  @Patch(':identifier/verify')
  public async verifyCar(@Param('identifier') identifier: string): Promise<{ message: string; data: Car }> {
    return {
      message: 'Car verified successfully',
      data: await this.carService.verifyCar(identifier),
    }
  }

  @Patch(':identifier/availability')
  public async updateCarAvailability(
    @Param('identifier') identifier: string,
    @Body('status') status: string,
  ): Promise<{ message: string; data: Car }> {
    return {
      message: 'Car Availablity successfully updated to true',
      data: await this.carService.verifyCar(identifier),
    }
  }

  @Patch(':carId/assign/:driverId')
  public async assignCarToDriver(
    @Param('carId') carId: string,
    @Param('driverId') driverId: string,
  ): Promise<Car> {
    return await this.carService.assignCarToDriver(carId, driverId);
  }

  @Get(':identifier/history')
  public async getCarHistory(@Param('identifier') identifier: string): Promise<Car> {
    return await this.carService.getCarHistory(identifier);
  }

  @Patch(':identifier/type')
  public async updateCarType(
    @Param('identifier') identifier: string,
    @Body() body: UpdateCarTypeDto,
  ): Promise<{ message: string; data: Car }> {
    return {
      message: 'Car type updated successfully',
      data: await this.carService.updateCarType(identifier, body.carType),
    };
  }
}
import { Controller, Get, Patch, Param, Body, Delete } from '@nestjs/common';
import { AdminCarService } from '../services/adminCar.service';
import { UpdateCarAvailabilityDto } from '../../car/dto/updateCarAvailability';
import Car from '../../entities/car.entity';

@Controller({ version: '1', path: 'admin/cars' })
export class AdminCarController {
    constructor(private readonly adminCarService: AdminCarService) { }

    @Get("getAll")
    async getAllCars() {
        return this.adminCarService.getAllCars();
    }

    @Patch(':id/verify')
    async verifyCar(@Param('id') id: string): Promise<{ message: string; data: Car }> {
        return {
            message: 'Car verified successfully',
            data: await this.adminCarService.verifyCar(id),
        }
    }

    @Patch(':id/status')
    async updateCarStatus(@Param('id') id: string, @Body() dto: UpdateCarAvailabilityDto) {
        return this.adminCarService.updateCarStatus(id, dto.status);
    }

    @Delete(':id')
    async deleteCar(@Param('id') id: string) {
        return this.adminCarService.deleteCar(id);
    }
}

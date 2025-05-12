import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { AdminDriverService } from '../services/adminDriver.service';
import Driver from 'src/entities/driver.entity';
import { ApiResponse } from 'src/adapters/apiResponse';
import { CreateDriverDTO } from 'src/drivers/dto/createDriver';
import { UpdateDriverDTO } from 'src/drivers/dto/updatedDriver';


@Controller({ version: '1', path: 'admin/drivers' })
export class AdminDriverController {
    constructor(private readonly adminDriverService: AdminDriverService) { }

    @Post("newDriver")
    public async addDriverManually(@Body() payload: CreateDriverDTO): Promise<ApiResponse<Driver>> {
        console.log('addDriverManually method triggered');
        console.log('Request body:', payload);
        const driver = await this.adminDriverService.addDriverManually(payload);
        return new ApiResponse('Driver added successfully', driver);
    }

    @Get("viewallDrivers")
    public async getAllDrivers(): Promise<ApiResponse<Driver[]>> {
        const drivers = await this.adminDriverService.getAllDrivers();
        console.log('Drivers fetched from database:', drivers);
        return new ApiResponse('Drivers fetched successfully', drivers);
    }

    @Get(':identifier')
    public async findDriverByIdentifier(@Param('identifier') identifier: string): Promise<ApiResponse<Driver>> {
        const driver = await this.adminDriverService.findDriverByIdentifier(identifier);
        return new ApiResponse('Driver fetched successfully', driver);
    }

    @Patch(':identifier/suspend')
    public async suspendDriver(@Param('identifier') identifier: string): Promise<ApiResponse<Driver>> {
        await this.adminDriverService.suspendDriver(identifier);
        return new ApiResponse('Driver suspended successfully', null);
    }

    @Patch(':identifier/unsuspend')
    public async unsuspendDriver(@Param('identifier') identifier: string): Promise<ApiResponse<Driver>> {
        await this.adminDriverService.unsuspendDriver(identifier);
        return new ApiResponse('Driver unsuspended successfully', null);
    }

    @Delete(':identifier')
    public async deleteDriver(@Param('identifier') identifier: string): Promise<ApiResponse<Driver>> {
        await this.adminDriverService.deleteDriver(identifier);
        return new ApiResponse('Driver deleted successfully', null);
    }

    @Patch(':identifier')
    public async updateDriverDetails(
        @Param('identifier') identifier: string,
        @Body() updateData: UpdateDriverDTO,
    ): Promise<ApiResponse<Driver>> {
        const driver = await this.adminDriverService.updateDriverDetails(identifier, updateData);
        return new ApiResponse('Driver details updated successfully', driver);
    }

    @Get(':identifier/stats')
    public async viewDriverStats(@Param('identifier') identifier: string): Promise<ApiResponse<Driver>> {
        const stats = await this.adminDriverService.viewDriverStats(identifier);
        return new ApiResponse('Driver stats fetched successfully', stats);
    }
}
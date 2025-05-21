import { IsString, IsNotEmpty, IsNumber, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCarDto {
    @IsString()
    @IsNotEmpty()
    carName: string;

    @IsString()
    @IsNotEmpty()
    carModel: string;

    @IsString()
    @IsNotEmpty()
    carPlateNumber: string;

    @IsString()
    @IsNotEmpty()
    carColor: string;

    // @IsNotEmpty()
    // isVerified: boolean;

    @Type(() => Number)
    @IsNumber()
    capacity: number;

    @IsString()
    @IsNotEmpty()
    @IsIn(['bus', 'car', 'tricycle'])
    carType: string;

    @IsString()
    @IsIn(['active', 'inactive', 'under_maintenance'])
    availabilityStatus: string;

    @IsString()
    @IsOptional()
    insuranceDocument?: string;

    @IsString()
    @IsOptional()
    registrationDocument?: string;
}
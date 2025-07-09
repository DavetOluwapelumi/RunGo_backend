import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateRideRequestDTO {
    @IsOptional() // Make optional since it comes from JWT
    @IsString()
    userIdentifier?: string;

    @IsNotEmpty()
    @IsString()
    driverIdentifier: string;

    @IsNotEmpty()
    @IsString()
    pickupLocation: string;

    @IsNotEmpty()
    @IsString()
    destination: string;

    @IsNumber()
    estimatedAmount: number;
}
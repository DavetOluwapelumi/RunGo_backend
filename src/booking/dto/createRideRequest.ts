import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRideRequestDTO {
    @IsNotEmpty()
    @IsString()
    userIdentifier: string;

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
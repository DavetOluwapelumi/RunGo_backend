import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class RespondToRideRequestDTO {
    @IsNotEmpty()
    @IsString()
    @IsIn(['accept', 'reject'])
    action: 'accept' | 'reject';
} 
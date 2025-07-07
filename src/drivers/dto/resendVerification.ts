import { IsEmail, IsNotEmpty } from 'class-validator';

export class DriverResendVerificationDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;
} 
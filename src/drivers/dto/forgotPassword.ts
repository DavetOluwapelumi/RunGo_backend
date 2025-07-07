import { IsEmail, IsNotEmpty } from 'class-validator';

export class DriverForgotPasswordDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;
} 
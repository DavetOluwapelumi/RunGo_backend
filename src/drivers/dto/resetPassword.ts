import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class DriverResetPasswordDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Length(6, 6, { message: 'OTP must be exactly 6 characters' })
    otp: string;

    @IsString()
    @IsNotEmpty()
    newPassword: string;

    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
} 
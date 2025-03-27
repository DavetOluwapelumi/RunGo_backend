import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class CreateDriverDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  phone: string;

  @IsStrongPassword()
  password: string;
}

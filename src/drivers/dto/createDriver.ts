import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class CreateDriverDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  phone: string;

  @IsStrongPassword()
  password: string;
}

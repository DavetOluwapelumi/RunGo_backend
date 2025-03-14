import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class CreateAdminDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsStrongPassword()
  password: string;
}

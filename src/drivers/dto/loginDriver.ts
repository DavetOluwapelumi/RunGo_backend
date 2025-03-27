import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDriverDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

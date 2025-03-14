import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginAdminDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

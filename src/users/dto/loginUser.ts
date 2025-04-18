import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDTO {
  @IsNotEmpty()
  matricNumber: string;

  @IsNotEmpty()
  password: string;
}

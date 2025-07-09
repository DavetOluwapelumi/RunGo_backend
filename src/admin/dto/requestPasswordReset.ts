import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgottenPasswordDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

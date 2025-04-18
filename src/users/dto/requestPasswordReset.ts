import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestPasswordResetDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

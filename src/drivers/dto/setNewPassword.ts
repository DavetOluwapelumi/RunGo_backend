import { IsStrongPassword } from 'class-validator';

export class SetNewPasswordDTO {
  @IsStrongPassword()
  newPassword: string;

  @IsStrongPassword()
  confirmPassword: string;
}

import {
  IsEmail,
  IsNotEmpty,
  Matches,
  Validate,
  ValidateIf,
} from 'class-validator';

export class LoginUserDTO {
  @IsNotEmpty()
  isStudent: boolean;

  @ValidateIf((o) => o.isStudent)
  @IsNotEmpty()
  @Matches(/^RUN\/[A-Z]{3}\/\d{2}\/\d{5}$/, {
    message: 'Matric number must follow the format RUN/XXX/YY/XXXXX',
  })
  matricNumber: string;

  @ValidateIf((o) => !o.isStudent)
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty()
  password: string;
}

import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateUserDTO {
  @IsNotEmpty()
  isStudent: boolean;

  @ValidateIf((o) => o.isStudent)
  @IsNotEmpty()
  @Matches(/^RUN\/[A-Z]{3}\/\d{2}\/\d{5}$/, {
    message: 'Matric number must follow the format RUN/XXX/YY/XXXXX',
  })
  matricNumber: string;

  @ValidateIf((o) => o.isStudent) // Validate only if the user is a student
  @Matches(/^[a-zA-Z]+[0-9]{5}@run\.edu\.ng$/, {
    message: 'Email must be a valid school email (e.g., name12345@run.edu.ng)',
  })
  @ValidateIf((o) => !o.isStudent) // Validate only if the user is NOT a student
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  phoneNumber: string;

  @IsStrongPassword()
  password: string;
}

import { IsEnum, IsNotEmpty, IsNumber, IsString, IsEmail, isEmail } from 'class-validator';


export class CreatePaymentDTO {
  // @IsNumber()
  // amount: number;

  // @IsNotEmpty()
  // referenceNumber: string;

  // @IsEmail()
  // email: string;

  // @IsString()
  // @IsNotEmpty()
  // userIdentifier: string;

  // @IsNotEmpty()
  // @IsEnum(PaymentMethod)
  // paymentMethod: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  amount: string;

}

import { IsEnum, IsNotEmpty, IsNumber, IsString, IsEmail } from 'class-validator';
import { PaymentMethod } from '../../enums/paymentMethod';

export class CreatePaymentDTO {
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  referenceNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  userIdentifier: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: string;
}

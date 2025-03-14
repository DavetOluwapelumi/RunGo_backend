import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PaymentMethod } from '../../enums/paymentMethod';

export class CreatePaymentDTO {
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  referenceNumber: string;

  @IsString()
  @IsNotEmpty()
  userIdentifier: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: string;
}

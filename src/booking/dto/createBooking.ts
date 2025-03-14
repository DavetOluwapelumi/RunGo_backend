import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PaymentMethod } from '../../enums/paymentMethod';

export class CreateBookingDTO {
  @IsNotEmpty()
  @IsString()
  pickupLocation: string;

  @IsNotEmpty()
  @IsString()
  destination: string;

  @IsNotEmpty()
  @IsString()
  userIdentifier: string;

  @IsNotEmpty()
  @IsString()
  driverIdentifier: string;

  @IsNumber()
  amountPaid: number;

  @IsNotEmpty()
  paymentReferenceNumber: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: string;
}

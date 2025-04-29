import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { PaymentMethod } from '../../enums/paymentMethod';

export class UpdateBookingDTO {
  @IsString()
  pickupLocation?: string;

  @IsString()
  destination?: string;

  @IsString()
  userIdentifier?: string;

  @IsString()
  driverIdentifier?: string;

  @IsNumber()
  amountPaid?: number;

  @IsString()
  paymentReferenceNumber?: string;

  @IsEnum(PaymentMethod)
  paymentMethod?: string;

  @IsString()
  status?: string; // For updating the booking status (e.g., "completed", "canceled")
}
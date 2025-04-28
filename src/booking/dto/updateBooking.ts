import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { PaymentMethod } from '../../enums/paymentMethod';

export class UpdateBookingDTO {
  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  userIdentifier?: string;

  @IsOptional()
  @IsString()
  driverIdentifier?: string;

  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @IsOptional()
  @IsString()
  paymentReferenceNumber?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  status?: string; // For updating the booking status (e.g., "completed", "canceled")
}
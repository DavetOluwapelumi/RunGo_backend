import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Booking from '../entities/booking.entity';
import { Repository } from 'typeorm';
import { CreateBookingDTO } from './dto/createBooking';
import { PaymentService } from '../payment/payment.service';
import { CreatePaymentDTO } from '../payment/dto/createPayment';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @Inject(PaymentService)
    private readonly paymentService: PaymentService,
  ) {}

  public async createBooking(request: CreateBookingDTO) {
    try {
      const {
        userIdentifier,
        driverIdentifier,
        destination,
        pickupLocation,
        paymentReferenceNumber,
        amountPaid,
        paymentMethod,
      } = request;

      const paymentDto: CreatePaymentDTO = {
        amount: amountPaid,
        userIdentifier,
        referenceNumber: paymentReferenceNumber,
        paymentMethod,
      };

      const { identifier: paymentIdentifier } = await this.paymentService
        .createPayment(paymentDto)
        .catch((error) => {
          throw error;
        });

      const booking = this.bookingRepository.create();
      booking.destination = destination;
      booking.pickupLocation = pickupLocation;
      booking.userIdentifier = userIdentifier;
      booking.driverIdentifier = driverIdentifier;
      booking.paymentIdentifier = paymentIdentifier;

      // const payment
    } catch (error) {}
  }
}

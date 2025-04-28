import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Booking from '../../entities/booking.entity';
import { Repository } from 'typeorm';
import { CreateBookingDTO } from '../dto/createBooking';
import { PaymentService } from '../../payment/payment.service';
import { CreatePaymentDTO } from '../../payment/dto/createPayment';
import { DriverService } from 'src/drivers/services/drivers.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @Inject(PaymentService)
    private readonly paymentService: PaymentService,
    private readonly driverService: DriverService,
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

      const availableDriver = await this.driverService.findAvailableDriver();
      if (!availableDriver) {
        throw new NotFoundException('No available drivers at the moment.');
      }

      await this.driverService.updateDriverAvailability(availableDriver.identifier, false);

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
      booking.driverIdentifier = availableDriver.identifier;
      booking.paymentIdentifier = paymentIdentifier;
      const savedBooking = await this.bookingRepository.save(booking);

      return savedBooking;
    } catch (error) {
      throw error;
    }
  }

  public async findAllBookings(): Promise<Booking[]> {
    return await this.bookingRepository.find();
  }

  public async findBookingByIdentifier(identifier: string): Promise<Booking | null> {
    return await this.bookingRepository.findOne({ where: { identifier } });
  }

  public async deleteBooking(identifier: string): Promise<void> {
    const booking = await this.findBookingByIdentifier(identifier);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    await this.bookingRepository.remove(booking);
  }

  public async updateBooking(identifier: string, request: Partial<Booking>): Promise<Booking> {
    const booking = await this.findBookingByIdentifier(identifier);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    Object.assign(booking, request); // Merge the updates into the existing booking
    return await this.bookingRepository.save(booking);
  }
}
import { Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Booking from '../../entities/booking.entity';
import { Repository } from 'typeorm';
import { CreateBookingDTO } from '../dto/createBooking';
import { PaymentService } from '../../payment/payment.service';
import { CreatePaymentDTO } from '../../payment/dto/createPayment';
import { DriverService } from '../../drivers/services/drivers.service';
import { UserService } from '../../users/services/users.service'

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @Inject(PaymentService)
    private readonly paymentService: PaymentService,
    private readonly driverService: DriverService,
    private readonly userService: UserService, // Inject UserService
  ) { }

  async createBooking(request: CreateBookingDTO) {
    const {
      userIdentifier,
      driverIdentifier,
      destination,
      pickupLocation,
      paymentReferenceNumber,
      amountPaid,
      paymentMethod,
    } = request;

    // Check if the user exists
    const user = await this.userService.findOneByIdentifier(userIdentifier);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the driver exists
    const driver = await this.driverService.findOneByIdentifier(driverIdentifier);
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Find an available driver
    const availableDriver = await this.driverService.findAvailableDriver();
    if (!availableDriver) {
      throw new UnprocessableEntityException('No available drivers at the moment.');
    }

    try {
      // Update driver availability
      await this.driverService.updateDriverAvailability(availableDriver.identifier, false);

      // Create payment
      const paymentDto: CreatePaymentDTO = {
        amount: amountPaid,
        userIdentifier,
        referenceNumber: paymentReferenceNumber,
        paymentMethod,
      };

      const { identifier: paymentIdentifier } = await this.paymentService.createPayment(paymentDto);

      // Create booking
      const booking = this.bookingRepository.create({
        destination,
        pickupLocation,
        userIdentifier,
        driverIdentifier: availableDriver.identifier,
        paymentIdentifier,
        pickupTime: new Date(),
      });

      const savedBooking = await this.bookingRepository.save(booking);

      return savedBooking;
    } catch (error) {
      // Rollback driver availability if booking creation fails
      await this.driverService.updateDriverAvailability(availableDriver.identifier, true);
      throw error;
    }
  }

  public async findAllBookings(userId: string): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { userIdentifier: userId },
    });
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

  public async endTrip(bookingIdentifier: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { identifier: bookingIdentifier } });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    booking.dropoffTime = new Date(); // Set dropoffTime to the current timestamp
    return await this.bookingRepository.save(booking);
  }
}
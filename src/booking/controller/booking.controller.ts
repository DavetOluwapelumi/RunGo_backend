import {
  Controller,
  Inject,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { BookingService } from '../service/booking.service';
import { CreateBookingDTO } from '../dto/createBooking';
import { UpdateBookingDTO } from '../dto/updateBooking';

@Controller({ version: '1', path: 'booking' })
export class BookingController {
  constructor(
    @Inject(BookingService)
    private readonly bookingService: BookingService,
  ) {}

// Create a new booking
  @HttpCode(201)
  @Post("createBooking")
  async createBooking(@Body() request: CreateBookingDTO) {
    const booking = await this.bookingService.createBooking(request);
    return { message: 'Booking created successfully', booking };
  }
// Retrieve all bookings
  @HttpCode(200)
  @Get('Retrieve-booking')
  async findAllBooking(@Param('userId') userId: string) {
    return await this.bookingService.findAllBookings(userId);
  }

// Retrieve a specific booking by identifier
  @HttpCode(200)
  @Get('Retrieve-specific/:identifier')
  async findOneBooking(@Param('identifier') identifier: string) {
    const booking = await this.bookingService.findBookingByIdentifier(identifier);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }
// Update a specific booking by identifier
  @HttpCode(200)
  @Patch('Update-specific/:identifier')
  async updateOneBooking(
    @Param('identifier') identifier: string,
    @Body() request: UpdateBookingDTO,
  ) {
    const updatedBooking = await this.bookingService.updateBooking(identifier, request);
    return { message: 'Booking updated successfully', updatedBooking };
  }

  @HttpCode(200)
  @Delete('Delete-specific/:identifier')
  async deleteOneBooking(@Param('identifier') identifier: string) {
    await this.bookingService.deleteBooking(identifier);
    return { message: 'Booking deleted successfully' };
  }

  @HttpCode(200)
@Patch('endTrip/:identifier')
async endTrip(@Param('identifier') identifier: string) {
  const booking = await this.bookingService.endTrip(identifier);
  return { message: 'Trip ended successfully', booking };
}
}

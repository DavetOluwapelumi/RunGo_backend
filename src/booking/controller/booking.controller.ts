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

@Controller({ version: '1', path: 'booking' })
export class BookingController {
  constructor(
    @Inject(BookingService)
    private readonly bookingService: BookingService,
  ) {}

  @HttpCode(201)
  @Post()
  async createBooking(@Body() request: CreateBookingDTO) {
    const booking = await this.bookingService.createBooking(request);
    return { message: 'Booking created successfully', booking };
  }

  @HttpCode(200)
  @Get()
  async findAllBooking() {
    return await this.bookingService.findAllBookings();
  }

  @Get()
  async findBooking() {}

  // Retrieve a specific booking by identifier
  @HttpCode(200)
  @Get('/:identifier')
  async findOneBooking(@Param('identifier') identifier: string) {
    const booking = await this.bookingService.findBookingByIdentifier(identifier);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  @Patch(':/identifier')
  async updateOneBooking() {}

  @HttpCode(200)
  @Delete('/:identifier')
  async deleteOneBooking(@Param('identifier') identifier: string) {
    await this.bookingService.deleteBooking(identifier);
    return { message: 'Booking deleted successfully' };
  }
}

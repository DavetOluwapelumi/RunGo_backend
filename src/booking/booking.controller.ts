import { Controller, Inject, Post, Get, Delete, Patch } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller({ version: '1', path: 'booking' })
export class BookingController {
  constructor(
    @Inject(BookingService)
    private readonly bookingService: BookingService,
  ) {}

  @Post()
  async createBooking() {}

  @Get()
  async findAllBooking() {}

  @Get()
  async findBooking() {}

  @Get('/:identifier')
  async findOneBooking() {}

  @Patch(':/identifier')
  async updateOneBooking() {}

  @Delete()
  async deleteOneBooking() {}
}

import {
  Controller,
  Inject,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { BookingService } from '../service/booking.service';
import { CreateBookingDTO } from '../dto/createBooking';
import { UpdateBookingDTO } from '../dto/updateBooking';

import { CreatePaymentDTO } from '../../payment/dto/createPayment';
import { CreateRideRequestDTO } from '../dto/createRideRequest';
import { RespondToRideRequestDTO } from '../dto/respondToRideRequest';
import { PaginationDTO } from '../dto/pagination.dto';
import { DriverService } from '../../drivers/services/drivers.service';
import { RideRequestService } from '../service/rideRequest.service';


@Controller({ version: '1', path: 'booking' })
export class BookingController {
  constructor(
    @Inject(BookingService)
    private readonly bookingService: BookingService,
    private readonly driverService: DriverService,
    private readonly rideRequestService: RideRequestService,
  ) { }

  // Create a new booking
  @HttpCode(201)
  @Post('createBooking')
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
    const booking =
      await this.bookingService.findBookingByIdentifier(identifier);
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
    const updatedBooking = await this.bookingService.updateBooking(
      identifier,
      request,
    );
    return { message: 'Booking updated successfully', updatedBooking };
  }
  // src/booking/controller/booking.controller.ts

  // 1. Create ride request (no payment)
  @Post('request-ride')
  async requestRide(@Body() request: CreateRideRequestDTO) {
    const rideRequest = await this.bookingService.createRideRequest(request);
    return {
      message: 'Ride request sent to driver',
      rideRequest,
      nextStep: 'Wait for driver response'
    };
  }

  // 2. Driver responds to ride request
  @Post('respond-to-ride/:requestId')
  async respondToRide(
    @Param('requestId') requestId: string,
    @Body() response: RespondToRideRequestDTO
  ) {
    console.log(`🔍 Controller received requestId: ${requestId}`);
    console.log(`🔍 Controller received response body:`, response);
    console.log(`🔍 Controller received action: ${response.action}`);

    const result = await this.bookingService.handleRideResponse(requestId, response.action);

    if (response.action === 'accept') {
      return {
        ...result,
        nextStep: 'User should proceed to payment',
        paymentEndpoint: `/v1/booking/process-payment/${requestId}`
      };
    }

    return result;
  }

  // 3. Process payment after acceptance
  @Post('process-payment/:requestId')
  async processPayment(
    @Param('requestId') requestId: string,
    @Body() paymentDetails: CreatePaymentDTO
  ) {
    const booking = await this.bookingService.processPayment(requestId, paymentDetails);
    return {
      message: 'Payment successful! Booking confirmed',
      booking,
      nextStep: 'Ride is now active'
    };
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

  // Get available drivers for selection
  @Get('available-drivers')
  async getAvailableDrivers() {
    return this.driverService.findAllAvailableDrivers();
  }

  // Get ride request status
  @Get('ride-request/:requestId')
  async getRideRequestStatus(@Param('requestId') requestId: string) {
    const rideRequest = await this.rideRequestService.findByIdentifier(requestId);
    if (!rideRequest) {
      throw new NotFoundException('Ride request not found');
    }
    return rideRequest;
  }

  // Get user's ride requests
  @Get('user-requests/:userIdentifier')
  async getUserRideRequests(
    @Param('userIdentifier') userIdentifier: string,
    @Query() pagination: PaginationDTO
  ) {
    return await this.rideRequestService.getRequestsForUser(userIdentifier, pagination.page, pagination.limit);
  }

  // Get driver's pending requests
  @Get('driver-requests/:driverIdentifier')
  async getDriverPendingRequests(
    @Param('driverIdentifier') driverIdentifier: string,
    @Query() pagination: PaginationDTO
  ) {
    return await this.rideRequestService.getPendingRequestsForDriver(driverIdentifier, pagination.page, pagination.limit);
  }

  // Get current location of the driver for a booking/ride
  @Get('driver-location/:driverId')
  async getDriverCurrentLocation(@Param('driverId') driverId: string) {
    const location = await this.driverService.getDriverLocation(driverId);
    if (!location) {
      throw new NotFoundException('Driver not found');
    }
    return location;
  }
}

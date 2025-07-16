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
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingService } from '../service/booking.service';
import { CreateBookingDTO } from '../dto/createBooking';
import { UpdateBookingDTO } from '../dto/updateBooking';

import { CreatePaymentDTO } from '../../payment/dto/createPayment';
import { CreateRideRequestDTO } from '../dto/createRideRequest';
import { RespondToRideRequestDTO } from '../dto/respondToRideRequest';
import { PaginationDTO } from '../dto/pagination.dto';
import { DriverService } from '../../drivers/services/drivers.service';
import { RideRequestService } from '../service/rideRequest.service';
import { JwtPayload } from '../../interfaces/jwt';


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
  @UseGuards(AuthGuard('jwt'))
  async requestRide(
    @Body() request: CreateRideRequestDTO,
    @Request() req
  ) {
    // Extract userIdentifier from JWT - use userId, not identifier
    const userIdentifier = req.user.userId;

    console.log(' JWT user object:', req.user);
    console.log(' JWT userIdentifier (userId):', userIdentifier);
    console.log('🔍 Request body:', request);

    // Create the request data with userIdentifier from JWT
    const rideRequestData = {
      userIdentifier,
      driverIdentifier: request.driverIdentifier,
      pickupLocation: request.pickupLocation,
      destination: request.destination,
      estimatedAmount: request.estimatedAmount
    };

    console.log(' Final ride request data:', rideRequestData);

    const rideRequest = await this.bookingService.createRideRequest(rideRequestData);
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

  @Patch('start-ride/:identifier')
  async acknowledgeStartRide(
    @Param('identifier') identifier: string,
    @Body('role') role: 'user' | 'driver'
  ) {
    try {
      console.log('Start ride called with identifier:', identifier);
      // Fetch booking
      const booking = await this.bookingService.findBookingByIdentifier(identifier);
      console.log('Booking found:', booking);
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }
      // Update acknowledgement
      if (role === 'user') {
        booking.userStartAcknowledged = true;
      } else if (role === 'driver') {
        booking.driverStartAcknowledged = true;
      } else {
        throw new NotFoundException('Invalid role');
      }
      // If both have acknowledged, update status to 'started'
      if (booking.userStartAcknowledged && booking.driverStartAcknowledged) {
        booking.status = 'started';
      }
      const updatedBooking = await this.bookingService.updateBooking(identifier, booking);
      return {
        started: updatedBooking.userStartAcknowledged && updatedBooking.driverStartAcknowledged,
        booking: updatedBooking,
      };
    } catch (error) {
      console.error('Error in acknowledgeStartRide:', error);
      return { error: (error as any).message || error.toString(), stack: (error as any).stack };
    }
  }

  @Patch('cancel-ride/:rideIdentifier')
  async cancelRide(
    @Param('rideIdentifier') rideIdentifier: string,
    @Body('role') role: 'user' | 'admin',
    @Body('userIdentifier') userIdentifier: string
  ) {
    try {
      const booking = await this.bookingService.findBookingByIdentifier(rideIdentifier);
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }
      if (booking.status === 'cancelled') {
        return { message: 'Ride already cancelled', booking };
      }
      if (booking.status === 'completed' || booking.status === 'ended' || booking.dropoffTime) {
        return { message: 'Cannot cancel a completed ride', booking };
      }
      // Only the user who booked or an admin can cancel
      if (role === 'user' && booking.userIdentifier !== userIdentifier) {
        throw new NotFoundException('You are not authorized to cancel this ride');
      }
      booking.status = 'cancelled';
      booking.lastUpdatedAt = new Date();
      booking.cancelledBy = role;
      booking.cancelledAt = new Date();
      const updatedBooking = await this.bookingService.updateBooking(rideIdentifier, booking);
      return { message: 'Ride cancelled successfully', booking: updatedBooking };
    } catch (error) {
      console.error('Error in cancelRide:', error);
      return { error: (error as any).message || error.toString(), stack: (error as any).stack };
    }
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

  // Validate wallet balance before booking
  @Get('validate-wallet-balance')
  @UseGuards(AuthGuard('jwt'))
  async validateWalletBalance(
    @Query('rideFare') rideFare: number,
    @Request() req
  ) {
    const userIdentifier = req.user.userId; // Use userId, not identifier
    const validation = await this.bookingService.validateWalletBalance(userIdentifier, rideFare);
    return {
      message: validation.message,
      ...validation
    };
  }

  @Get('user-upcoming-rides/:userIdentifier')
  async getUserUpcomingRides(@Param('userIdentifier') userIdentifier: string) {
    try {
      // Fetch bookings with status 'accepted' (only valid status for upcoming rides)
      const upcomingStatuses = ['accepted', 'started'];
      const bookings = await this.bookingService.findUpcomingBookingsForUser(userIdentifier, upcomingStatuses);
      // Exclude cancelled rides
      const filteredBookings = bookings.filter(b => b.status !== 'cancelled');
      // For each booking, fetch driver details
      const ridesWithDriver = await Promise.all(
        filteredBookings.map(async (booking) => {
          const driver = await this.driverService.findOneByIdentifier(booking.driverIdentifier);
          return {
            ...booking,
            price: booking.amountPaid, // Add price field for frontend
            driver: driver
              ? {
                firstName: driver.firstName,
                lastName: driver.lastName,
                phoneNumber: driver.phoneNumber,
                identifier: driver.identifier,
              }
              : null,
          };
        })
      );
      return { rides: ridesWithDriver };
    } catch (error) {
      console.error('Error in getUserUpcomingRides:', error);
      return { error: (error as any).message || error.toString(), stack: (error as any).stack };
    }
  }

  @Get('driver-bookings/:driverIdentifier')
  async getDriverBookings(@Param('driverIdentifier') driverIdentifier: string) {
    const bookings = await this.bookingService.findBookingsByDriver(driverIdentifier);
    return { bookings };
  }
}

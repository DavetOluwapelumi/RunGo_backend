import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DriverService } from 'src/drivers/services/drivers.service';
import { RideRequestService } from 'src/booking/service/rideRequest.service';
import { BookingService } from 'src/booking/service/booking.service';

@WebSocketGateway()
export class DriverGatewayGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly driverService: DriverService,
    private readonly rideRequestService: RideRequestService,
    private readonly bookingService: BookingService,
  ) { }

  // Handle client connection
  async handleConnection(client: Socket) {
    const driverId = client.handshake.query.driverId as string;
    console.log(` Driver ${driverId} connecting... Socket ID: ${client.id}`);

    if (driverId) {
      try {
        await this.driverService.updateDriverAvailability(driverId, true);
        console.log(`✅ Driver ${driverId} marked as AVAILABLE`);

        // Join driver to their own room for targeted messages
        client.join(driverId);
        console.log(`�� Driver ${driverId} joined room: ${driverId}`);
      } catch (error) {
        console.error(`❌ Failed to update driver ${driverId} availability:`, error instanceof Error ? error.message : String(error));
      }
    } else {
      console.warn(`⚠️  Driver connected without driverId. Socket ID: ${client.id}`);
    }
  }

  // Handle client disconnection
  async handleDisconnect(client: Socket) {
    const driverId = client.handshake.query.driverId as string;
    console.log(`�� Driver ${driverId} disconnecting... Socket ID: ${client.id}`);

    if (driverId) {
      try {
        await this.driverService.updateDriverAvailability(driverId, false);
        console.log(`✅ Driver ${driverId} marked as UNAVAILABLE`);

        // Leave the room
        client.leave(driverId);
      } catch (error) {
        console.error(`❌ Failed to update driver ${driverId} availability:`, error instanceof Error ? error.message : String(error));
      }
    } else {
      console.warn(`⚠️  Driver disconnected without driverId. Socket ID: ${client.id}`);
    }
  }

  // Handle general messages
  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): string {
    console.log(`Message received from client ${client.id}:`, payload);
    this.server.emit('message', { clientId: client.id, payload });
    return 'Message received!';
  }

  // Handle ride request from user to driver
  @SubscribeMessage('ride_request')
  async handleRideRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    const { driverId, rideRequest } = payload;
    console.log(`🚕 Ride request for driver ${driverId}:`, rideRequest);

    try {
      // Save the ride request to database
      const savedRequest = await this.rideRequestService.createRideRequest(rideRequest);

      // Send ride request to specific driver
      this.server.to(driverId).emit('new_ride_request', {
        ...savedRequest,
        requestId: savedRequest.identifier
      });

      console.log(`📨 Ride request sent to driver ${driverId}`);

      // Start timer for driver response (30 seconds)
      setTimeout(async () => {
        const request = await this.rideRequestService.findByIdentifier(savedRequest.identifier);
        if (request && request.status === 'pending') {
          // Auto-expire if driver hasn't responded
          await this.rideRequestService.updateStatus(savedRequest.identifier, 'expired');
          this.server.to(driverId).emit('ride_request_expired', { requestId: savedRequest.identifier });
          console.log(`⏰ Ride request ${savedRequest.identifier} expired`);
        }
      }, 30000); // 30 seconds

    } catch (error) {
      console.error(`❌ Failed to process ride request:`, error);
      client.emit('ride_request_error', { message: 'Failed to send ride request' });
    }
  }

  // Handle driver response to ride request
  @SubscribeMessage('ride_response')
  async handleRideResponse(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    const { rideRequestId, response, driverId } = payload;
    console.log(`�� Driver ${driverId} responded to ride request ${rideRequestId}: ${response}`);

    try {
      // Update ride request status
      await this.rideRequestService.updateStatus(rideRequestId, response);

      if (response === 'accepted') {
        // Notify user that driver accepted
        this.server.emit('ride_accepted', {
          rideRequestId,
          driverId,
          message: 'Driver accepted your ride request! Please proceed to payment.'
        });
        console.log(`✅ Ride request ${rideRequestId} accepted by driver ${driverId}`);
      } else {
        // Notify user that driver rejected
        this.server.emit('ride_rejected', {
          rideRequestId,
          driverId,
          message: 'Driver rejected your ride request. Please select another driver.'
        });
        console.log(`❌ Ride request ${rideRequestId} rejected by driver ${driverId}`);
      }

    } catch (error) {
      console.error(`❌ Failed to process ride response:`, error);
      client.emit('ride_response_error', { message: 'Failed to process response' });
    }
  }

  // Handle payment confirmation
  @SubscribeMessage('payment_confirmed')
  async handlePaymentConfirmed(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    const { rideRequestId, paymentDetails } = payload;
    console.log(`💰 Payment confirmed for ride request ${rideRequestId}`);

    try {
      // Create the actual booking
      const booking = await this.bookingService.createBookingFromRideRequest(rideRequestId, paymentDetails);

      // Notify driver that booking is confirmed
      this.server.emit('booking_confirmed', {
        rideRequestId,
        bookingId: booking.identifier,
        message: 'Payment successful! Your ride is confirmed.'
      });

      console.log(`✅ Booking created from ride request ${rideRequestId}`);

    } catch (error) {
      console.error(`❌ Failed to create booking:`, error);
      client.emit('booking_error', { message: 'Failed to confirm booking' });
    }
  }

  // Handle real-time driver location updates
  @SubscribeMessage('driver_location_update')
  async handleDriverLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    const { driverId, latitude, longitude, rideId } = payload;
    // Update driver's location in DB
    await this.driverService.updateDriverLocation(driverId, latitude, longitude);
    // Broadcast to the ride room (or user room) for tracking
    if (rideId) {
      this.server.to(rideId).emit('driver_location_update', { driverId, latitude, longitude });
    } else {
      // Fallback: broadcast to driver room
      this.server.to(driverId).emit('driver_location_update', { driverId, latitude, longitude });
    }
  }
}
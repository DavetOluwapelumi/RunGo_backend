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

@WebSocketGateway()
export class DriverGatewayGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly driverService: DriverService) {}

  // Handle client connection
  async handleConnection(client: Socket) {
    const driverId = client.handshake.query.driverId as string; // Assume driverId is passed in the query params
    if (driverId) {
      await this.driverService.updateDriverAvailability(driverId, true); // Mark driver as available
    }
  }

  // Handle client disconnection
  async handleDisconnect(client: Socket) {
    const driverId = client.handshake.query.driverId as string; // Assume driverId is passed in query params
    if (driverId) {
      await this.driverService.updateDriverAvailability(driverId, false); // Mark driver as unavailable
    }
  }

  // Handle custom event (e.g., 'message')
  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): string {
    console.log(`Message received from client ${client.id}:`, payload);
    // You can broadcast the message to other clients or process it
    this.server.emit('message', { clientId: client.id, payload });
    return 'Message received!';
  }
}

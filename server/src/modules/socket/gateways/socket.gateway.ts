import { WebSocketGateway, OnGatewayConnection, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway(82,{
  cors: {origin: '*'}
})
export class SocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Socket;

  handleConnection(socket: Socket): void {
    console.log('Socket connected');
  }

  leadUpdated(): void {
    this.server.emit('leadUpdated');
  }

  handleDisconnect(socket: Socket): void {
    console.log('Socket disconnected');
  }
 
}
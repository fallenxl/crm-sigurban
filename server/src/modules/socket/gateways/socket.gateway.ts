import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway(8282, {
  cors: { origin: '*' },
})
export class SocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Socket;

  handleConnection(): void {
    console.log('Socket connected');
  }

  leadUpdated(usersNotifications: string[] = []): void {
    this.server.emit('leadUpdated', usersNotifications);
  }
}

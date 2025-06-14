import { Module } from '@nestjs/common';
import { SocketGateway } from './gateways/socket.gateway';

@Module({
  imports: [],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}

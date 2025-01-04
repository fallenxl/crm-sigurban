import { Module } from '@nestjs/common';
import { LotsService } from './services/lots.service';
import { LotsController } from './controllers/lots.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Lots, LotsSchema } from './schemas/lots.schemas';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Lots.name, schema: LotsSchema },
  ]),
NotificationModule],
  controllers: [LotsController],
  providers: [LotsService],
  exports: [LotsService],
})
export class LotsModule {}

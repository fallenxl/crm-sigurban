import { Global, Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './schema/notification.schema';
import { NotificationService } from './services/notification.service';
import { UsersModule } from '../users/users.module';
import { NotificationController } from './controller/notification.controller';

@Module({
    imports: [MongooseModule.forFeature([
        {
            name: Notification.name,
            schema: NotificationSchema,
        }
    ]), forwardRef(() => UsersModule)],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}

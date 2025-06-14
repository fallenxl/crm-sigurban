import { forwardRef, Module } from '@nestjs/common';
import { LeadService } from './services/lead.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Lead, LeadSchema } from './schemas/lead.schemas';
import { UsersModule } from '../users/users.module';
import { LeadController } from './controllers';
import { CampaignModule } from '../campaign/campaign.module';
import { NotificationModule } from '../notification/notification.module';
import { BankModule } from '../bank/bank.module';
import { LotsModule } from '../lots/lots.module';
import { SocketModule } from '../socket/socket.module';
import { CheckPermissionsService } from './services/check-permissions.service';
import { StateService } from './services/state.service';
import { ProjectModule } from '../project/project.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Lead.name,
        schema: LeadSchema,
      },
    ]),
    UsersModule,
    SocketModule,
    CampaignModule,
    NotificationModule,
    BankModule,
    LotsModule,
    ProjectModule,
    SettingsModule,
  forwardRef(() => SettingsModule)
  ],
  providers: [LeadService, CheckPermissionsService, StateService],
  controllers: [LeadController],
  exports: [LeadService],
})
export class LeadModule {}

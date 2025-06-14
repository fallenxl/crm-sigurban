import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignModule } from './campaign/campaign.module';
import { LeadModule } from './lead/lead.module';
import { config } from 'dotenv';
import { BankModule } from './bank/bank.module';
import { NotificationModule } from './notification/notification.module';
import { ProjectModule } from './project/project.module';
import { LotsModule } from './lots/lots.module';
import { SocketModule } from './socket/socket.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RequirementsModule } from './requirements/requirements.module';
import { SettingsModule } from './settings/settings.module';
import { DahsboardModule } from './dahsboard/dahsboard.module';
config();


@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..','..', 'avatars'),
      serveRoot: '/api/avatar',
      
    }),
    UsersModule,
    AuthModule,
    CampaignModule,
    LeadModule,
    BankModule,
    NotificationModule,
    ProjectModule,
    LotsModule,
    SocketModule,
    RequirementsModule,
    SettingsModule,
    DahsboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

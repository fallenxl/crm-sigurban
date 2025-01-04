import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignModule } from './campaign/campaign.module';
import { LeadModule } from './lead/lead.module';
import { config } from 'dotenv'
import { BankModule } from './bank/bank.module';
import { NotificationModule } from './notification/notification.module';
import { ProjectModule } from './project/project.module';
import { LotsModule } from './lots/lots.module';
import { SocketModule } from './socket/socket.module';
config();

const MONGO_URI = process.env.NODE_ENV === 'production' ? process.env.MONGO_URI_PROD : process.env.MONGO_URI_DEV

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME,
      auth:{
        username: process.env.MONGO_USER,
        password:  process.env.MONGO_PASSWORD
      }

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

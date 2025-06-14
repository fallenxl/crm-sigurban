import { Module } from '@nestjs/common';
import { DahsboardService } from './services/dahsboard.service';
import { DahsboardController } from './controllers/dahsboard.controller';
import { LeadModule } from '../lead/lead.module';
import { UsersModule } from '../users/users.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [LeadModule, UsersModule, SettingsModule],
  controllers: [DahsboardController],
  providers: [DahsboardService],
})
export class DahsboardModule {}

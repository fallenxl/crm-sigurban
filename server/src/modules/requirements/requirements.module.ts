import { Module } from '@nestjs/common';
import { RequirementsService } from './services/requirements.service';
import { RequirementsController } from './controllers/requirements.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Requirements, RequirementsSchema } from './schema/requirements.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Requirements.name, schema: RequirementsSchema }]), UsersModule],
  controllers: [RequirementsController],
  providers: [RequirementsService],
})
export class RequirementsModule {}

import { Module } from '@nestjs/common';
import { BankService } from './services';
import { BankController } from './controllers';
import { MongooseModule } from '@nestjs/mongoose';
import { Bank, BankSchema } from './schemas';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bank.name, schema: BankSchema }]),
    UsersModule,
  ],
  providers: [BankService],
  controllers: [BankController],
  exports: [BankService],
})
export class BankModule {}

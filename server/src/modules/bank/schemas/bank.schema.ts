import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { FinancialPlans } from '../interfaces';

@Schema({ timestamps: true })
export class Bank {
  _id: string;

  @Prop({ required: true, unique: true })
  name: string;


  @Prop({ trim: true })
  description?: string;

  @Prop({  default: [] })
  financingPrograms?: FinancialPlans[];
}

export const BankSchema = SchemaFactory.createForClass(Bank);

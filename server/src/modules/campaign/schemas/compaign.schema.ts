import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { CampaignStatus } from '../interfaces';

@Schema({ timestamps: true })
export class Campaign {
  _id: string;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    trim: true,
  })
  description?: string;

  @Prop({
   type: Boolean,
   default: true,
  })
  status?: boolean;

  @Prop({
  })
  startDate?: Date;

  @Prop({
  })
  endDate?: Date;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

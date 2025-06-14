import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Lots {
  _id?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    trim: true,
  })
  projectID: string;

  @Prop({
    type: String,
    trim: true,
  })
  block?: string;

  @Prop({
    type: Number,
    required: true,
    trim: true,
  })
  lot: number;

  @Prop({
    type: Number,
    trim: true,
  })
  area: number;

  @Prop({
    type: Number,
    required: true,
    trim: true,
  })
  price: number;

  @Prop({
    type: String,
    trim: true,
    default: 'Disponible',
  })
  status: string;

  @Prop({
    type: String,
    trim: true,
  })
  svgPath?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId || null,
    ref: 'Lead',
    default: null,
  })
  reservedBy?: string;

  @Prop({
    type: Date,
    trim: true,
  })
  reservationDate: Date;
}

export const LotsSchema = SchemaFactory.createForClass(Lots);
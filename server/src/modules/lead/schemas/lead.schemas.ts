import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import {
  LeadStatus,
  LeadStatusEnum,
  LeadStatustype,
  LeadTimeline,
} from '../interfaces';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Lead {
  _id: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    nullable: true,
    isRequired: false,
  })
  advisorID?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
  })
  campaignID: string;

  @Prop({ trim: true, default: '' })
  avatar?: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  email?: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ trim: true, required: true, unique: true })
  dni: string;

  @Prop({ trim: true, default: '' })
  address?: string;

  @Prop({ trim: true, default: '' })
  country?: string;

  @Prop({ trim: true, default: '' })
  department?: string;

  @Prop({ trim: true, default: '' })
  source?: string;

  @Prop({ type: {}, default: LeadStatusEnum.TO_CALL })
  status?: LeadStatus = LeadStatustype.TO_CALL;

  @Prop({ required: true, default: [] })
  timeline?: LeadTimeline[];

  @Prop({ trim: true, default: '' })
  interestedIn?: string;

  @Prop({ trim: true, default: '' })
  comment?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  })
  assignedBy?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bank',
    default: null,
  })
  bankID?: string;

  @Prop({
    trim: true,
  })
  financingProgram?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  })
  bankManagerID?: string;

  @Prop({
    type: Array<mongoose.Schema.Types.ObjectId>,
    ref: 'Bank',
    default: [],
  })
  rejectedBanks?: string[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  })
  managerID?: string;

  @Prop({ default: null })
  dateToCall?: string;

  @Prop({ default: '' })
  paymentMethod?: string;

  @Prop({ default: '' })
  workTime?: string;

  @Prop({ default: '' })
  workPosition?: string;

  @Prop({ default: '' })
  workAddress?: string;

  @Prop({ default: '' })
  salary?: string;

  @Prop({
    type: {
      projectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
      lotID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lot',
      },
      houseModel:{
        type: Object
      }
    },
    default: null,
  })
  projectDetails?: {
    projectID: string;
    lotID: string;
    houseModel?: {
      model: string;
      area: number;
      price: number;
      priceWithDiscount: number;
    };
  };
}
export const LeadSchema = SchemaFactory.createForClass(Lead);

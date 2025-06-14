import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import {
  LeadStatus,
  LeadStatusEnum,
  LeadStatustype,
  LeadTimeline,
} from '../interfaces';
import mongoose from 'mongoose';



@Schema()
class UserComment {
  _id?: string;
  @Prop({ trim: true })
  comment: string;

  @Prop({ trim: true })
  date: Date;

  @Prop({ trim: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userID: string;
}

@Schema({ timestamps: true })
export class Lead {
  _id: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    nullable: true,
    required: false,
  })
  advisorID?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    nullable: true,
    required: false,
    default: null,
  })
  campaignID?: string;

  @Prop({ trim: true, default: '' })
  avatar?: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  email?: string;

  @Prop({ required: true })
  phone: string;
  @Prop({ required: false })
  birthdate: string;


  @Prop({ trim: true, default: '' })
  dni?: string;

  @Prop({ trim: true, default: '' })
  passport?: string;

  @Prop({ trim: true, default: '' })
  residenceNumber?: string;

  @Prop({ trim: true, default: '' })
  address?: string;

  @Prop({ trim: true, default: '' })
  country?: string;

  @Prop({ trim: true, default: '' })
  department?: string;

  @Prop({ trim: true, default: '' })
  municipality?: string;

  @Prop({ trim: true, default: '' })
  source?: string;

  @Prop({ type: {}, default: null })
  lastStatus?: LeadStatus;

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

  @Prop(

    { trim: true, default: '' }
  )
  genre?: string;
  
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

  @Prop({ default: [], type: [UserComment] })
  comments?: UserComment[];


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
      houseModel: {
        type: Object,
      },
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

  @Prop({ type: Object, default: [] })
  documents?: string[];

  @Prop({ type: Date, default: null })
  lastStatusUpdate?: Date;



  createdAt: Date;

  updatedAt: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

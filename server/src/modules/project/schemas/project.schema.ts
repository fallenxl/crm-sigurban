import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { lotStatus } from '../interfaces/project.interfaces';
import mongoose from 'mongoose';

interface Models {
  model: string;
  area: number;
  price: number;
  priceWithDiscount: number;
}

@Schema({ timestamps: true })
export class Project {
  _id: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name: string;

    @Prop({
        type: String,
        trim: true,
    })
    address: string;

    @Prop({
        type: String,
        trim: true,
    })
    description: string;

    @Prop({
        default: [],
    })

  models: Models[];

}

export const ProjectSchema = SchemaFactory.createForClass(Project);
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Requirements {
  _id: string;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, type: [String]})
  requirements: string[];

}

export const RequirementsSchema = SchemaFactory.createForClass(Requirements);

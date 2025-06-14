import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

// Define el esquema Goal basado en la interfaz IGoal
@Schema()
export class Goal {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  target: number;

  @Prop({ required: true })
  achieved: number;

  @Prop({default: []})
  newLeads: string[];

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);

@Schema({ timestamps: false })
export class Settings {
  _id: string;

  @Prop({ required: true, default: 60 })
  bureauPrequalificationDays: number;

  @Prop({ required: true, default: 30 })
  bankPrequalificationDays: number;

  // Metas generales
  @Prop({ type: [GoalSchema], default: [] })
  generalGoals: Goal[];

  // Metas individuales por asesor
  @Prop({ type: [GoalSchema], default: [] })
  individualGoalsAdvisor: Goal[];
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);

SettingsSchema.pre('save', async function (next) {
  const settingsCount = await this.model('Settings').countDocuments();
  if (settingsCount > 1) {
    throw new Error('Settings already exist');
  }
  next();
});

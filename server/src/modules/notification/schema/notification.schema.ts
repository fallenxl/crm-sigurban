import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({ timestamps: true })
export class Notification {
    _id: string;

    @Prop({ required: true })
    title: string;

    @Prop({ trim: true })
    message?: string;

    @Prop({ default: false })
    read?: boolean;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    userID: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Lead' })
    leadID?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
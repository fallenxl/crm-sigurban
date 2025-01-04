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
        type: String,
        required: true,
        trim: true,
    })
    lot: string;
    
    @Prop({
        type: Number,
        trim: true,
    })
    area:  number;

    @Prop({
        type: String,
        required: true,
        trim: true,
    })
    price: number;

    @Prop({
        type: String,
        required: true,
        trim: true,
        default: 'Disponible',
    })
    status: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        default: null,
    })
    reservedBy: string;

    @Prop({
        type: Date,
        trim: true,
    })
    reservationDate: Date;
}

export const LotsSchema = SchemaFactory.createForClass(Lots);
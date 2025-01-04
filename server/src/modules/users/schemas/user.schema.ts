import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Roles } from '../../../constants';


@Schema({ timestamps: true })
export class User {
  _id: string;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    transform: (value: string) => value.toLowerCase(),
  })
  email: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    required: true,
    enum: Object.values(Roles),
  })
  role: Roles;

  @Prop({
    required: true,
  })
  phone: string;

    @Prop({})
    city?: string;
    @Prop({})
    department?: string;
  @Prop({
    required: true,
    trim: true,
  })
  position: string;

  @Prop({
    required: true,
  })
  genre: string;

  @Prop({
    trim: true,
  })
  address?: string;

  @Prop({
    default: true,
  })
  status?: boolean;

  @Prop()
  avatar?: string;

  @Prop({
    default: 0,
  })
  lastLead?: Date;

  @Prop({
    default: Date.now(),
  })
  createdAt?: Date;

  @Prop({
    default: Date.now(),
  })
  updatedAt?: Date;

  @Prop({
    type: Object,
    default: {
      autoAssign: false,
    },
  })
  settings? : {
    autoAssign: boolean;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  this.avatar = `https://api.dicebear.com/5.x/initials/svg?seed=${this.name.split(' ')[0]}`;
  next();
});



UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  userId: string;

  @Prop({ default: '' })
  nickname: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: 20 })
  credits: number;

  @Prop({ default: 'free', enum: ['free', 'basic', 'pro', 'enterprise'] })
  plan: string;

  @Prop({ default: null })
  planExpireAt: Date;

  @Prop({ default: 'user', enum: ['user', 'admin', 'superadmin'] })
  role: string;

  @Prop({ default: 'active', enum: ['active', 'disabled'] })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

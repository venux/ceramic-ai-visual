import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SceneDocument = Scene & Document;

@Schema({ timestamps: true })
export class Scene {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['白底', '木桌', '茶席', '展厅', '生活', '节日'] })
  category: string;

  @Prop({ default: '' })
  thumbnail: string;

  @Prop({ default: '' })
  prompt: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const SceneSchema = SchemaFactory.createForClass(Scene);
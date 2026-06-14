import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: ['product_image', 'remove_bg', 'detail_page'] })
  type: string;

  @Prop({ type: [String], default: [] })
  inputImages: string[];

  @Prop({ default: null })
  sceneId: string;

  @Prop({ default: 'pending', enum: ['pending', 'processing', 'completed', 'failed'] })
  status: string;

  @Prop({ type: [String], default: [] })
  resultImages: string[];

  @Prop({ default: null })
  completedAt: Date;

  @Prop({ default: null })
  errorMsg: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
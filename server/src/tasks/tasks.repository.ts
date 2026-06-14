import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/base/base.repository';
import { Task, TaskDocument } from './task.schema';

@Injectable()
export class TasksRepository extends BaseRepository<TaskDocument> {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {
    super(taskModel);
  }

  async findByUser(userId: string): Promise<TaskDocument[]> {
    return this.taskModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
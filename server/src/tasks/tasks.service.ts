import { Injectable, NotFoundException } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { TaskDocument } from './task.schema';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async create(data: Partial<TaskDocument>): Promise<TaskDocument> {
    return this.tasksRepository.create(data);
  }

  async getByUser(userId: string): Promise<TaskDocument[]> {
    return this.tasksRepository.findByUser(userId);
  }

  async getById(taskId: string, userId: string): Promise<TaskDocument> {
    const task = await this.tasksRepository.findById(taskId);
    if (!task || task.userId !== userId) {
      throw new NotFoundException('任务不存在');
    }
    return task;
  }

  async updateStatus(
    taskId: string,
    status: string,
    data?: { resultImages?: string[]; errorMsg?: string },
  ): Promise<TaskDocument> {
    const update: any = { status };
    if (status === 'completed') {
      update.completedAt = new Date();
    }
    if (data?.resultImages) {
      update.resultImages = data.resultImages;
    }
    if (data?.errorMsg) {
      update.errorMsg = data.errorMsg;
    }
    const task = await this.tasksRepository.update(taskId, update);
    if (!task) {
      throw new NotFoundException('任务不存在');
    }
    return task;
  }
}
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';
import { Task, TaskDocument } from '../tasks/task.schema';
import { Scene, SceneDocument } from '../scenes/scene.schema';
import {
  ListUsersDto,
  UpdateUserDto,
  ListTasksDto,
  CreateSceneDto,
  UpdateSceneDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Scene.name) private readonly sceneModel: Model<SceneDocument>,
  ) {}

  // ==================== 用户管理 ====================

  async listUsers(dto: ListUsersDto) {
    const { page = 1, limit = 20, search, role, status, plan } = dto;
    const filter: FilterQuery<UserDocument> = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (plan) filter.plan = plan;
    if (search) {
      filter.$or = [
        { userId: { $regex: search, $options: 'i' } },
        { nickname: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .exec();
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async disableUser(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: { status: 'disabled' } }, { new: true })
      .exec();
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  // ==================== 统计 ====================

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      todayNewUsers,
      totalTasks,
      completedTasks,
      failedTasks,
      pendingTasks,
    ] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.userModel.countDocuments({ createdAt: { $gte: today } }).exec(),
      this.taskModel.countDocuments().exec(),
      this.taskModel.countDocuments({ status: 'completed' }).exec(),
      this.taskModel.countDocuments({ status: 'failed' }).exec(),
      this.taskModel.countDocuments({ status: { $in: ['pending', 'processing'] } }).exec(),
    ]);

    // 统计生成图片总数（每个completed任务的resultImages长度之和）
    const imageResult = await this.taskModel.aggregate([
      { $match: { status: 'completed' } },
      { $project: { count: { $size: { $ifNull: ['$resultImages', []] } } } },
      { $group: { _id: null, total: { $sum: '$count' } } },
    ]).exec();
    const totalGeneratedImages = imageResult.length > 0 ? imageResult[0].total : 0;

    // 按套餐统计用户数
    const planStats = await this.userModel.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } },
    ]).exec();

    return {
      totalUsers,
      todayNewUsers,
      totalTasks,
      completedTasks,
      failedTasks,
      pendingTasks,
      totalGeneratedImages,
      planStats,
    };
  }

  // ==================== 任务管理 ====================

  async listTasks(dto: ListTasksDto) {
    const { page = 1, limit = 20, userId, status, type } = dto;
    const filter: FilterQuery<TaskDocument> = {};

    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (type) filter.type = type;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.taskModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.taskModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTaskById(id: string): Promise<TaskDocument> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) throw new NotFoundException('任务不存在');
    return task;
  }

  // ==================== 场景管理 ====================

  async createScene(dto: CreateSceneDto): Promise<SceneDocument> {
    const scene = new this.sceneModel(dto);
    return scene.save();
  }

  async updateScene(id: string, dto: UpdateSceneDto): Promise<SceneDocument> {
    const scene = await this.sceneModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .exec();
    if (!scene) throw new NotFoundException('场景不存在');
    return scene;
  }

  async deleteScene(id: string): Promise<void> {
    const result = await this.sceneModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('场景不存在');
  }
}

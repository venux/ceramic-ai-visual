import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { UsersRepository } from './users.repository';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findOrCreate(userId: string): Promise<UserDocument> {
    return this.usersRepository.findOrCreate(userId);
  }

  async findByUserId(userId: string): Promise<UserDocument> {
    const user = await this.usersRepository.findByUserId(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async deductCredit(userId: string, amount = 1): Promise<UserDocument> {
    const user = await this.findByUserId(userId);
    if (user.credits < amount) {
      throw new Error('免费额度不足');
    }
    user.credits -= amount;
    return user.save();
  }

  async getCredit(userId: string): Promise<number> {
    const user = await this.findByUserId(userId);
    return user.credits;
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    filter?: FilterQuery<UserDocument>;
    sort?: Record<string, 1 | -1>;
  }): Promise<{ items: UserDocument[]; total: number }> {
    const { page = 1, limit = 20, filter = {}, sort = { createdAt: -1 } } = options || {};
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.userModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }
}

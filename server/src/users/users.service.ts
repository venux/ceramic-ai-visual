import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

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
}
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/base/base.repository';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersRepository extends BaseRepository<UserDocument> {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super(userModel);
  }

  async findByUserId(userId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ userId }).exec();
  }

  async findOrCreate(userId: string, data?: Partial<User>): Promise<UserDocument> {
    let user = await this.findByUserId(userId);
    if (!user) {
      user = await this.create({ userId, ...data });
    }
    return user;
  }
}
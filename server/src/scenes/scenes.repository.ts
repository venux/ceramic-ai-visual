import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/base/base.repository';
import { Scene, SceneDocument } from './scene.schema';

@Injectable()
export class ScenesRepository extends BaseRepository<SceneDocument> {
  constructor(@InjectModel(Scene.name) private sceneModel: Model<SceneDocument>) {
    super(sceneModel);
  }

  async findActive(): Promise<SceneDocument[]> {
    return this.sceneModel.find({ isActive: true }).exec();
  }

  async findByCategory(category: string): Promise<SceneDocument[]> {
    return this.sceneModel.find({ category, isActive: true }).exec();
  }
}
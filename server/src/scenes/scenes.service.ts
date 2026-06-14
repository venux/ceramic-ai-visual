import { Injectable } from '@nestjs/common';
import { ScenesRepository } from './scenes.repository';
import { SceneDocument } from './scene.schema';

@Injectable()
export class ScenesService {
  constructor(private readonly scenesRepository: ScenesRepository) {}

  async listActive(): Promise<SceneDocument[]> {
    return this.scenesRepository.findActive();
  }

  async getByCategory(category: string): Promise<SceneDocument[]> {
    return this.scenesRepository.findByCategory(category);
  }
}
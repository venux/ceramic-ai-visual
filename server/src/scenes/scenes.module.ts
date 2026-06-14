import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Scene, SceneSchema, SceneDocument } from './scene.schema';
import { ScenesRepository } from './scenes.repository';
import { ScenesService } from './scenes.service';
import { ScenesController } from './scenes.controller';
import { seedScenes } from './scenes.seed';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Scene.name, schema: SceneSchema }]),
    AuthModule,
  ],
  controllers: [ScenesController],
  providers: [ScenesRepository, ScenesService],
  exports: [ScenesService],
})
export class ScenesModule implements OnModuleInit {
  constructor(@InjectModel(Scene.name) private sceneModel: Model<SceneDocument>) {}

  async onModuleInit() {
    await seedScenes(this.sceneModel);
  }
}
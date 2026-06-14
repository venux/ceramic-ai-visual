import { Module } from '@nestjs/common';
import { ComfyUIService } from './comfyui.service';
import { ComfyUIController } from './comfyui.controller';

@Module({
  controllers: [ComfyUIController],
  providers: [ComfyUIService],
  exports: [ComfyUIService],
})
export class ComfyUIModule {}

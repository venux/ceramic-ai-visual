import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ScenesService } from './scenes.service';
import { BaseResponseDto } from '../common/base/base-response.dto';
import { SceneDocument } from './scene.schema';

@Controller('scenes')
@UseGuards(JwtAuthGuard)
export class ScenesController {
  constructor(private readonly scenesService: ScenesService) {}

  @Get()
  async listActive(): Promise<BaseResponseDto<SceneDocument[]>> {
    const scenes = await this.scenesService.listActive();
    return BaseResponseDto.success(scenes);
  }

  @Get(':category')
  async getByCategory(
    @Param('category') category: string,
  ): Promise<BaseResponseDto<SceneDocument[]>> {
    const scenes = await this.scenesService.getByCategory(category);
    return BaseResponseDto.success(scenes);
  }
}
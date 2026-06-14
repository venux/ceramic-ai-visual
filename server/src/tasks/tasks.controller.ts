import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TasksService } from './tasks.service';
import { BaseResponseDto } from '../common/base/base-response.dto';
import { TaskDocument } from './task.schema';
import { IsString, IsArray, IsOptional } from 'class-validator';

class CreateTaskDto {
  @IsString()
  type: 'product_image' | 'remove_bg' | 'detail_page';

  @IsArray()
  @IsString({ each: true })
  inputImages: string[];

  @IsString()
  @IsOptional()
  sceneId?: string;
}

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateTaskDto,
  ): Promise<BaseResponseDto<TaskDocument>> {
    const task = await this.tasksService.create({
      userId,
      type: dto.type,
      inputImages: dto.inputImages,
      sceneId: dto.sceneId,
      status: 'pending',
    });
    return BaseResponseDto.success(task, '任务已创建');
  }

  @Get()
  async getByUser(
    @CurrentUser('userId') userId: string,
  ): Promise<BaseResponseDto<TaskDocument[]>> {
    const tasks = await this.tasksService.getByUser(userId);
    return BaseResponseDto.success(tasks);
  }

  @Get(':id')
  async getById(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ): Promise<BaseResponseDto<TaskDocument>> {
    const task = await this.tasksService.getById(id, userId);
    return BaseResponseDto.success(task);
  }
}
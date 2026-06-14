import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Sse,
  MessageEvent,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { Observable, Subscriber } from 'rxjs';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BaseResponseDto } from '../common/base/base-response.dto';
import { ComfyUIService } from './comfyui.service';
import {
  GenerateRequestDto,
  RemoveBackgroundDto,
  GenerateDetailPageDto,
  CreateTaskResponseDto,
  TaskProgressEvent,
} from './dto/generate.dto';

@Controller('comfyui')
@UseGuards(JwtAuthGuard)
export class ComfyUIController {
  private readonly logger = new Logger(ComfyUIController.name);

  constructor(private readonly comfyuiService: ComfyUIService) {}

  /**
   * POST /api/comfyui/generate
   * 创建产品图生成任务，返回 taskId
   */
  @Post('generate')
  async generate(
    @CurrentUser('userId') userId: string,
    @Body() dto: GenerateRequestDto,
  ): Promise<BaseResponseDto<CreateTaskResponseDto>> {
    this.logger.log(`用户 ${userId} 发起生成请求，${dto.items.length} 个商品`);

    // 取第一个 item 作为示例，批量时可扩展为多任务
    const item = dto.items[0];
    const taskId = await this.comfyuiService.generateProductImages(
      item.imagePath,
      item.sceneId,
      item.platforms,
    );

    return BaseResponseDto.success(
      new CreateTaskResponseDto(taskId),
      '生成任务已创建',
    );
  }

  /**
   * POST /api/comfyui/remove-bg
   * 创建抠图任务，返回 taskId
   */
  @Post('remove-bg')
  async removeBackground(
    @CurrentUser('userId') userId: string,
    @Body() dto: RemoveBackgroundDto,
  ): Promise<BaseResponseDto<CreateTaskResponseDto>> {
    this.logger.log(`用户 ${userId} 发起抠图请求`);

    const taskId = await this.comfyuiService.removeBackground(dto.imagePath);

    return BaseResponseDto.success(
      new CreateTaskResponseDto(taskId),
      '抠图任务已创建',
    );
  }

  /**
   * POST /api/comfyui/detail-page
   * 创建详情页生成任务，返回 taskId
   */
  @Post('detail-page')
  async generateDetailPage(
    @CurrentUser('userId') userId: string,
    @Body() dto: GenerateDetailPageDto,
  ): Promise<BaseResponseDto<CreateTaskResponseDto>> {
    this.logger.log(`用户 ${userId} 发起详情页生成请求: ${dto.productName}`);

    const taskId = await this.comfyuiService.generateDetailPage(
      dto.productName,
      dto.sellingPoints,
      dto.images,
    );

    return BaseResponseDto.success(
      new CreateTaskResponseDto(taskId),
      '详情页生成任务已创建',
    );
  }

  /**
   * GET /api/comfyui/progress/:taskId
   * SSE 流式推送任务进度
   */
  @Get('progress/:taskId')
  @Sse()
  progress(@Param('taskId') taskId: string): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber: Subscriber<MessageEvent>) => {
      const unsubscribe = this.comfyuiService.subscribeTask(taskId, (event: TaskProgressEvent) => {
        subscriber.next({ data: event } as MessageEvent);

        // 终态自动关闭 SSE
        if (event.stage === 'completed' || event.stage === 'failed') {
          setTimeout(() => subscriber.complete(), 500);
        }
      });

      return () => unsubscribe();
    });
  }
}

import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

/** 平台类型 */
export type Platform = 'taobao' | 'jd' | 'pinduoduo' | 'douyin' | 'xiaohongshu';

/** 单个生成请求 */
export class GenerateProductImageDto {
  @IsString()
  imagePath: string;

  @IsString()
  sceneId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  platforms: Platform[];
}

/** 批量生成请求 */
export class GenerateRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenerateProductImageDto)
  items: GenerateProductImageDto[];
}

/** 抠图请求 */
export class RemoveBackgroundDto {
  @IsString()
  imagePath: string;
}

/** 详情页生成请求 */
export class GenerateDetailPageDto {
  @IsString()
  productName: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  sellingPoints: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

/** 任务进度事件（SSE推送） */
export class TaskProgressEvent {
  taskId: string;
  stage: 'queued' | 'processing' | 'compositing' | 'uploading' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  resultUrls?: string[];
  error?: string;

  constructor(partial: Partial<TaskProgressEvent>) {
    Object.assign(this, partial);
  }
}

/** 任务创建响应 */
export class CreateTaskResponseDto {
  taskId: string;

  constructor(taskId: string) {
    this.taskId = taskId;
  }
}

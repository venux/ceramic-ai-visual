import { Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { Document } from 'mongoose';
import { BaseService } from './base.service';
import { BaseResponseDto } from './base-response.dto';

export abstract class BaseController<T extends Document> {
  constructor(protected readonly service: BaseService<T>) {}

  @Post()
  async create(@Body() data: Partial<T>): Promise<BaseResponseDto<T>> {
    const result = await this.service.create(data);
    return BaseResponseDto.success(result);
  }

  @Get()
  async findAll(@Query() filter?: any): Promise<BaseResponseDto<T[]>> {
    const result = await this.service.findAll(filter);
    return BaseResponseDto.success(result);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<BaseResponseDto<T>> {
    const result = await this.service.findById(id);
    if (!result) {
      return BaseResponseDto.error('资源不存在', 404);
    }
    return BaseResponseDto.success(result);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<T>,
  ): Promise<BaseResponseDto<T>> {
    const result = await this.service.update(id, data as any);
    if (!result) {
      return BaseResponseDto.error('资源不存在', 404);
    }
    return BaseResponseDto.success(result);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<BaseResponseDto<null>> {
    await this.service.delete(id);
    return BaseResponseDto.success(null, '删除成功');
  }
}
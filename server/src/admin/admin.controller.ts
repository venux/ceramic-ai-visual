import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminGuard } from './guards/admin.guard';
import { AdminService } from './admin.service';
import { BaseResponseDto } from '../common/base/base-response.dto';
import {
  ListUsersDto,
  UpdateUserDto,
  ListTasksDto,
  CreateSceneDto,
  UpdateSceneDto,
} from './dto/admin.dto';

@Controller('admin')
@UseGuards(AdminGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== 用户管理 ====================

  @Get('users')
  async listUsers(@Query() dto: ListUsersDto) {
    const result = await this.adminService.listUsers(dto);
    return BaseResponseDto.success(result);
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    const user = await this.adminService.getUserById(id);
    return BaseResponseDto.success(user);
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.adminService.updateUser(id, dto);
    return BaseResponseDto.success(user);
  }

  @Delete('users/:id')
  async disableUser(@Param('id') id: string) {
    const user = await this.adminService.disableUser(id);
    return BaseResponseDto.success(user, '用户已禁用');
  }

  // ==================== 统计 ====================

  @Get('stats')
  async getStats() {
    const stats = await this.adminService.getStats();
    return BaseResponseDto.success(stats);
  }

  // ==================== 任务管理 ====================

  @Get('tasks')
  async listTasks(@Query() dto: ListTasksDto) {
    const result = await this.adminService.listTasks(dto);
    return BaseResponseDto.success(result);
  }

  @Get('tasks/:id')
  async getTaskById(@Param('id') id: string) {
    const task = await this.adminService.getTaskById(id);
    return BaseResponseDto.success(task);
  }

  // ==================== 场景管理 ====================

  @Post('scenes')
  async createScene(@Body() dto: CreateSceneDto) {
    const scene = await this.adminService.createScene(dto);
    return BaseResponseDto.success(scene);
  }

  @Put('scenes/:id')
  async updateScene(@Param('id') id: string, @Body() dto: UpdateSceneDto) {
    const scene = await this.adminService.updateScene(id, dto);
    return BaseResponseDto.success(scene);
  }

  @Delete('scenes/:id')
  async deleteScene(@Param('id') id: string) {
    await this.adminService.deleteScene(id);
    return BaseResponseDto.success(null, '场景已删除');
  }
}

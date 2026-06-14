import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { BaseResponseDto } from '../common/base/base-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser('userId') userId: string): Promise<BaseResponseDto<UserResponseDto>> {
    const user = await this.usersService.findOrCreate(userId);
    const dto = plainToInstance(UserResponseDto, user.toObject(), {
      excludeExtraneousValues: true,
    });
    return BaseResponseDto.success(dto);
  }

  @Get('credits')
  async getCredits(@CurrentUser('userId') userId: string): Promise<BaseResponseDto<{ credits: number }>> {
    const credits = await this.usersService.getCredit(userId);
    return BaseResponseDto.success({ credits });
  }
}
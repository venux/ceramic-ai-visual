import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListUsersDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['user', 'admin', 'superadmin'])
  role?: string;

  @IsOptional()
  @IsEnum(['active', 'disabled'])
  status?: string;

  @IsOptional()
  @IsEnum(['free', 'basic', 'pro', 'enterprise'])
  plan?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsNumber()
  credits?: number;

  @IsOptional()
  @IsEnum(['free', 'basic', 'pro', 'enterprise'])
  plan?: string;

  @IsOptional()
  planExpireAt?: Date;

  @IsOptional()
  @IsEnum(['active', 'disabled'])
  status?: string;

  @IsOptional()
  @IsEnum(['user', 'admin', 'superadmin'])
  role?: string;

  @IsOptional()
  @IsString()
  nickname?: string;
}

export class ListTasksDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'failed'])
  status?: string;

  @IsOptional()
  @IsEnum(['product_image', 'remove_bg', 'detail_page'])
  type?: string;
}

export class CreateSceneDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  isActive?: boolean;
}

export class UpdateSceneDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  isActive?: boolean;
}

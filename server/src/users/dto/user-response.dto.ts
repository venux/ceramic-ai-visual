import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  userId: string;

  @Expose()
  nickname: string;

  @Expose()
  avatar: string;

  @Expose()
  credits: number;

  @Expose()
  plan: string;

  @Expose()
  planExpireAt: Date;

  @Expose()
  createdAt: Date;
}
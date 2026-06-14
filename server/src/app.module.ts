import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from './config/config.module';
import { configuration } from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ScenesModule } from './scenes/scenes.module';
import { TasksModule } from './tasks/tasks.module';
import { StorageModule } from './storage/storage.module';
import { ComfyUIModule } from './comfyui/comfyui.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRoot(configuration().mongo_uri),
    BullModule.forRoot({
      redis: {
        host: configuration().redis_host,
        port: configuration().redis_port,
      },
    }),
    AuthModule,
    UsersModule,
    ScenesModule,
    TasksModule,
    StorageModule,
    ComfyUIModule,
    AdminModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaService } from './prisma/prisma.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/datasets/category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env.development.local',
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 20 }],
    }),
    UsersModule,
    AuthModule,
    CategoryModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

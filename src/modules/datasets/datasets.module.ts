import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import { DatasetsController } from './datasets.controller';
import { DatasetsService } from './datasets.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
    MulterModule.register({
      storage: undefined, // kita set per-route biar fleksibel
    }),
  ],
  controllers: [DatasetsController],
  providers: [DatasetsService, PrismaService],
})
export class DatasetsModule {}

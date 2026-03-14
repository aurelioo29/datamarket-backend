import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  UploadedFiles,
  UseInterceptors,
  Res,
  ForbiddenException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Response } from 'express';

import { DatasetsService } from './datasets.service';
import { QueryDatasetDto } from './dto/query-dataset.dto';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';

import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

function safeFilename(file: Express.Multer.File) {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${unique}${extname(file.originalname)}`;
}

@ApiTags('Datasets')
@Controller('datasets')
export class DatasetsController {
  constructor(private readonly service: DatasetsService) {}

  // PUBLIC: list
  @Get()
  @ApiOperation({ summary: 'List datasets (public)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'categorySlug', required: false })
  @ApiQuery({ name: 'domain', required: false })
  @ApiQuery({ name: 'featured', required: false, description: 'true/false' })
  findAll(@Query() query: QueryDatasetDto) {
    return this.service.findAll(query);
  }

  // PUBLIC: detail
  @Get(':slug')
  @ApiOperation({ summary: 'Detail dataset (public)' })
  @ApiParam({ name: 'slug' })
  findOne(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  // ADMIN: create + upload file dataset + thumbnail
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('Admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create dataset (Admin) + upload file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'datasetFile', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'datasetFile')
              return cb(null, 'storage/datasets');
            return cb(null, 'storage/thumbnails');
          },
          filename: (req, file, cb) => cb(null, safeFilename(file)),
        }),
        fileFilter: (req, file, cb) => {
          if (file.fieldname === 'datasetFile') {
            const ok = ['.csv', '.xlsx', '.xls'].includes(
              extname(file.originalname).toLowerCase(),
            );
            return ok
              ? cb(null, true)
              : cb(new Error('Dataset file must be CSV/XLSX'), false);
          }
          if (file.fieldname === 'thumbnail') {
            const ok = ['.png', '.jpg', '.jpeg', '.webp'].includes(
              extname(file.originalname).toLowerCase(),
            );
            return ok
              ? cb(null, true)
              : cb(new Error('Thumbnail must be image'), false);
          }
          cb(null, false);
        },
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB contoh
      },
    ),
  )
  @ApiBody({
    description: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        slug: { type: 'string' },
        title: { type: 'string' },
        short_desc: { type: 'string' },
        description: { type: 'string' },
        domain: { type: 'string' },
        price: { type: 'number' },
        currency: { type: 'string' },
        categoryId: { type: 'number' },
        tags: { type: 'string' },
        is_active: { type: 'boolean' },
        is_featured: { type: 'boolean' },
        sample_url: { type: 'string' },
        datasetFile: { type: 'string', format: 'binary' },
        thumbnail: { type: 'string', format: 'binary' },
      },
      required: [
        'slug',
        'title',
        'short_desc',
        'price',
        'categoryId',
        'datasetFile',
      ],
    },
  })
  create(
    @Body() dto: CreateDatasetDto,
    @UploadedFiles()
    files: {
      datasetFile?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    const datasetFile = files.datasetFile?.[0];
    if (!datasetFile) throw new ForbiddenException('datasetFile is required');

    const thumb = files.thumbnail?.[0];

    return this.service.create(dto, {
      file_path: datasetFile.path.replace(/\\/g, '/'),
      thumbnail: thumb ? thumb.path.replace(/\\/g, '/') : null,
    });
  }

  // ADMIN: update
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('Admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update dataset (Admin)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDatasetDto) {
    return this.service.update(id, dto);
  }

  // ADMIN: delete (soft)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('Admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete dataset (Admin) - soft delete' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.softDelete(id);
  }

  // CUSTOMER: download (must have PAID purchase)
  @Get(':slug/download')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Download dataset (Customer) - must be PAID' })
  async download(
    @Param('slug') slug: string,
    @GetUser('sub') userId: number,
    @Res() res: Response,
  ) {
    const file = await this.service.getDownloadFile(slug, userId);

    // stream file
    return res.download(join(process.cwd(), file.file_path));
  }
}

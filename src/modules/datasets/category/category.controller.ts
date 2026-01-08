import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@Controller('categories')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  // ================== CREATE CATEGORY (ADMIN ONLY) ==================
  @UseGuards(JwtAuthGuard)
  @Roles('Admin')
  @Post()
  @ApiOperation({
    summary: 'Buat kategori dataset',
    description: 'Hanya Admin yang bisa membuat kategori baru untuk dataset.',
  })
  @ApiCreatedResponse({
    description: 'Kategori berhasil dibuat',
  })
  @ApiBadRequestResponse({
    description: 'Data tidak valid / slug atau name sudah dipakai',
  })
  @ApiUnauthorizedResponse({ description: 'Token tidak dikirim / tidak valid' })
  @ApiForbiddenResponse({ description: 'Bukan admin' })
  @ApiBody({ type: CreateCategoryDto })
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  // ================== PUBLIC LIST ==================
  @Get()
  @ApiOperation({
    summary: 'List semua kategori aktif',
    description:
      'Endpoint publik. Mengembalikan daftar kategori yang bisa dipakai user.',
  })
  @ApiOkResponse({
    description: 'Daftar kategori ditemukan',
  })
  findAll() {
    return this.service.findAll();
  }

  // ================== GET ONE BY ID ==================
  @Get(':id')
  @ApiOperation({
    summary: 'Ambil detail kategori berdasarkan ID',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Kategori ditemukan' })
  @ApiNotFoundResponse({ description: 'Kategori tidak ditemukan' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  // ================== UPDATE (ADMIN ONLY) ==================
  @UseGuards(JwtAuthGuard)
  @Roles('Admin')
  @Patch(':id')
  @ApiOperation({
    summary: 'Edit kategori dataset',
    description: 'Hanya Admin yang boleh mengubah kategori',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Kategori berhasil diperbarui' })
  @ApiNotFoundResponse({ description: 'Kategori tidak ditemukan' })
  @ApiForbiddenResponse({ description: 'Bukan admin' })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid' })
  @ApiBody({ type: UpdateCategoryDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  // ================== DELETE (ADMIN ONLY) ==================
  @UseGuards(JwtAuthGuard)
  @Roles('Admin')
  @Delete(':id')
  @ApiOperation({
    summary: 'Hapus kategori dataset',
    description: 'Admin only.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Kategori berhasil dihapus' })
  @ApiNotFoundResponse({ description: 'Kategori tidak ditemukan' })
  @ApiForbiddenResponse({ description: 'Bukan admin' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

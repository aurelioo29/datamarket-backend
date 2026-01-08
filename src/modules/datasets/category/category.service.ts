import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.name, { lower: true });

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
      },
    });
  }

  findAll() {
    return this.prisma.category.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findById(id: number) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Kategori tidak ditemukan');
    return cat;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}

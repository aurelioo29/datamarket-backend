import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';
import { QueryDatasetDto } from './dto/query-dataset.dto';
import { PurchaseStatus } from '@prisma/client';

@Injectable()
export class DatasetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(q: QueryDatasetDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 10;
    const skip = (page - 1) * limit;

    const featured = q.featured ? q.featured === 'true' : undefined;

    const where: any = {
      is_active: true,
      ...(typeof featured === 'boolean' ? { is_featured: featured } : {}),
      ...(q.domain ? { domain: q.domain } : {}),
      ...(q.categorySlug ? { category: { slug: q.categorySlug } } : {}),
      ...(q.q
        ? {
            OR: [
              { title: { contains: q.q, mode: 'insensitive' } },
              { short_desc: { contains: q.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.dataset.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ is_featured: 'desc' }, { created_at: 'desc' }],
        include: { category: true },
      }),
      this.prisma.dataset.count({ where }),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  async findBySlug(slug: string) {
    const dataset = await this.prisma.dataset.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!dataset || !dataset.is_active)
      throw new NotFoundException('Dataset tidak ditemukan');
    return dataset;
  }

  async create(
    dto: CreateDatasetDto,
    extra: { file_path: string; thumbnail: string | null },
  ) {
    // pastikan category ada
    const cat = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!cat) throw new BadRequestException('Category tidak ditemukan');

    return this.prisma.dataset.create({
      data: {
        ...dto,
        currency: dto.currency ?? 'IDR',
        file_path: extra.file_path,
        thumbnail: extra.thumbnail ?? undefined,
      },
      include: { category: true },
    });
  }

  async update(id: number, dto: UpdateDatasetDto) {
    const existing = await this.prisma.dataset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Dataset tidak ditemukan');

    if (dto.categoryId) {
      const cat = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!cat) throw new BadRequestException('Category tidak ditemukan');
    }

    return this.prisma.dataset.update({
      where: { id },
      data: dto as any,
      include: { category: true },
    });
  }

  async softDelete(id: number) {
    const existing = await this.prisma.dataset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Dataset tidak ditemukan');

    return this.prisma.dataset.update({
      where: { id },
      data: { is_active: false },
    });
  }

  async getDownloadFile(slug: string, userId: number) {
    const dataset = await this.prisma.dataset.findUnique({ where: { slug } });
    if (!dataset || !dataset.is_active)
      throw new NotFoundException('Dataset tidak ditemukan');

    // cek purchase PAID
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        userId,
        datasetId: dataset.id,
        status: PurchaseStatus.PAID,
      },
    });

    if (!purchase) {
      throw new ForbiddenException('Anda belum membeli dataset ini');
    }

    // tracking download
    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        download_count: { increment: 1 },
        last_download_at: new Date(),
      },
    });

    return { file_path: dataset.file_path };
  }
}

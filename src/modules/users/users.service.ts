import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  findByEmailOrUsername(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });
  }

  async createUser(data: {
    email: string;
    username: string;
    password: string;
  }) {
    const hash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hash,
        role: 'Customer',
      },
    });
  }

  async updatePassword(userId: number, newPassword: string) {
    const hash = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });
  }

  async updateProfile(
    userId: number,
    data: { fullname?: string; photo?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async updateRefreshToken(userId: number, refreshToken: string | null) {
    const hash = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    return this.prisma.user.update({
      where: { id: userId },
      data: { refresh_token: hash },
    });
  }

  setVerified(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { is_verified: true },
    });
  }

  async findAllPaginated(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return { items, total, totalPages };
  }
}

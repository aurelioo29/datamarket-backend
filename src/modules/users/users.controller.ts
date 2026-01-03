import { Controller, Get, Patch, Body, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Users')
@ApiBearerAuth('access-token') // nama scheme harus sama dengan yang kamu set di DocumentBuilder
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users/me
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Ambil profil user yang sedang login',
    description:
      'Mengambil data user berdasarkan payload JWT (field `sub` berisi userId).',
  })
  @ApiOkResponse({
    description: 'Berhasil mengambil data profil user.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  async getMe(@GetUser('sub') userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) return null;

    const { password, refresh_token, ...rest } = user;
    return rest;
  }

  // PATCH /api/users/profile
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiOperation({
    summary: 'Update profil user',
    description:
      'Mengubah fullname dan/atau photo untuk user yang sedang login. Field yang tidak dikirim tidak akan diubah.',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({
    description: 'Profil berhasil diperbarui.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  async updateProfile(
    @GetUser('sub') userId: number,
    @Body() dto: UpdateProfileDto,
  ) {
    const updated = await this.usersService.updateProfile(userId, dto);
    const { password, refresh_token, ...rest } = updated;

    return {
      message: 'Profil berhasil diperbarui',
      user: rest,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Ambil daftar semua user (khusus Admin)',
    description:
      'Mengambil daftar user dengan pagination. Hanya bisa diakses oleh user dengan role Admin.',
  })
  @ApiOkResponse({
    description: 'Berhasil mengambil daftar user.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token tidak valid atau tidak dikirim.',
  })
  @ApiForbiddenResponse({
    description: 'User tidak memiliki akses (bukan Admin).',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Nomor halaman (mulai dari 1). Default: 1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Jumlah item per halaman. Default: 10',
  })
  async getAllUsers(@Query() pagination: PaginationDto) {
    const { page, limit } = pagination;

    const data = await this.usersService.findAllPaginated(page, limit);
    return {
      message: 'Berhasil mengambil daftar user',
      page,
      limit,
      ...data,
    };
  }
}

import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

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
}

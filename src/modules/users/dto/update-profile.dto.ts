import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Saputra Ilham',
    description: 'Nama lengkap user. Jika tidak dikirim, nilai lama tidak berubah.',
  })
  @IsOptional()
  @IsString()
  fullname?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/avatars/user-123.png',
    description: 'URL foto profil user. Bisa berupa URL public atau path file yang kamu simpan.',
  })
  @IsOptional()
  @IsString()
  photo?: string;
}

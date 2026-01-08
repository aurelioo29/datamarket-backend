import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    example: 'Teknologi, Kesehatan, Pendidikan',
    description: 'Nama kategori yang diperbarui.',
  })
  @IsOptional()
  @IsString()
  name?: string;
}

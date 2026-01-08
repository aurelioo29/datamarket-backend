import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Teknologi, Kesehatan, Pendidikan',
    description: 'Nama kategori yang akan ditambahkan.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

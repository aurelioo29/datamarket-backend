import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Bisa berupa email atau username yang terdaftar.',
  })
  @IsString()
  identifier: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Password akun yang sesuai dengan identifier di atas.',
  })
  @IsString()
  password: string;
}

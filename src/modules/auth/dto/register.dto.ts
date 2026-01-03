import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email utama yang akan digunakan untuk login & verifikasi.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'aurelio29',
    description: 'Username unik untuk user. Tidak boleh sama dengan user lain.',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Minimal 6 karakter, sebaiknya kombinasi huruf & angka.',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Harus sama dengan field password untuk konfirmasi.',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  confirmPassword: string;
}

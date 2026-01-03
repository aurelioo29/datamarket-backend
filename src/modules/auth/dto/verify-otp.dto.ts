import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiPropertyOptional({
    example: 'user@example.com',
    description:
      'Email user yang diverifikasi. Optional jika menggunakan username.',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'aurelio29',
    description:
      'Username user yang diverifikasi. Optional jika menggunakan email.',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    example: '12345',
    description: 'Kode OTP 5 digit yang dikirim ke user.',
  })
  @IsString()
  code: string; 
}

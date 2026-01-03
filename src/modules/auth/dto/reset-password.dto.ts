import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Identifier user yang mau reset password (email / username).',
  })
  @IsString()
  identifier: string;

  @ApiProperty({
    example: '12345',
    description: 'Kode OTP yang dikirim ke email / channel yang digunakan.',
  })
  @IsString()
  code: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'Password baru user.',
  })
  @IsString()
  newPassword: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'Konfirmasi password baru, harus sama dengan newPassword.',
  })
  @IsString()
  confirmNewPassword: string;
}

import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description:
      'Identifier user. Bisa berupa email atau username, tergantung implementasi.',
  })
  @IsString()
  identifier: string;
}

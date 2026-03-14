import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateDatasetDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsString()
  short_desc: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  currency?: string = 'IDR';

  @IsInt()
  @Min(1)
  categoryId: number;

  @IsOptional()
  @IsString()
  tags?: string; // sementara text/JSON string

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsString()
  sample_url?: string;
}

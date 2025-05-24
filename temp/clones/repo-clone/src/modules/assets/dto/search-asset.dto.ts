import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchAssetDto {
  @ApiProperty({ example: 'pop song', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: 'G', required: false })
  @IsString()
  @IsOptional()
  layer?: string;

  @ApiProperty({ example: 'POP', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'TSW', required: false })
  @IsString()
  @IsOptional()
  subcategory?: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiProperty({ example: 10, required: false })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}
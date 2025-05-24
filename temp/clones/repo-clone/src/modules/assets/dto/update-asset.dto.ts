import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TrainingDataDto, RightsDto } from './create-asset.dto';

export class UpdateAssetDto {
  @ApiProperty({ example: 'G', required: false })
  @IsString()
  @IsOptional()
  layer?: string;

  @ApiProperty({ example: 'ROCK', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'CLASSIC_ROCK', required: false })
  @IsString()
  @IsOptional()
  subcategory?: string;

  @ApiProperty({ example: 'ReViz', required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ example: ['rock', 'classic'], required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ example: 'A classic rock song', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: TrainingDataDto, required: false })
  @IsOptional()
  trainingData?: TrainingDataDto;

  @ApiProperty({ type: RightsDto, required: false })
  @IsOptional()
  rights?: RightsDto;

  @ApiProperty({ example: ['asset_id_1', 'asset_id_2'], required: false })
  @IsArray()
  @IsOptional()
  components?: string[];
}
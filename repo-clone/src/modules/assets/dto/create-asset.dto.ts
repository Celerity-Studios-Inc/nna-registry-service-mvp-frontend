import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TrainingDataDto {
  @ApiProperty({ example: ['prompt1', 'prompt2'] })
  @IsArray()
  @IsOptional()
  prompts?: string[];

  @ApiProperty({ example: ['image1.jpg', 'image2.jpg'] })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiProperty({ example: ['video1.mp4', 'video2.mp4'] })
  @IsArray()
  @IsOptional()
  videos?: string[];
}

export class RightsDto {
  @ApiProperty({ example: 'ReViz' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ example: '50/50' })
  @IsString()
  @IsOptional()
  rights_split?: string;
}

export class CreateAssetDto {
  @ApiProperty({ example: 'G' })
  @IsString()
  @IsNotEmpty()
  layer: string;

  @ApiProperty({ example: 'POP' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'TSW' })
  @IsString()
  @IsNotEmpty()
  subcategory: string;

  @ApiProperty({ example: 'ReViz' })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({ example: ['pop', 'taylor swift'] })
  @IsString()
  @IsOptional()
  tags?: string;

  @ApiProperty({ example: 'A pop song by Taylor Swift' })
  @IsString()
  @IsNotEmpty()
  description: string;

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

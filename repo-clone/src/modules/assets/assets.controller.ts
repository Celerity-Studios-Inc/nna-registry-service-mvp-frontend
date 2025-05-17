import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Put,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { SearchAssetDto } from './dto/search-asset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('assets')
@Controller('assets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @ApiOperation({ summary: 'Register a new asset' })
  @ApiResponse({ status: 201, description: 'Asset registered successfully' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        layer: { type: 'string' },
        category: { type: 'string' },
        subcategory: { type: 'string' },
        source: { type: 'string' },
        tags: { type: 'string' },
        description: { type: 'string' },
        trainingData: { type: 'object' },
        rights: { type: 'object' },
        components: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createAssetDto: CreateAssetDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const asset = await this.assetsService.createAsset(
      createAssetDto,
      file,
      req.user.email,
    );
    return {
      success: true,
      data: asset,
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  @ApiOperation({ summary: 'Batch register assets via CSV' })
  @ApiResponse({ status: 201, description: 'Assets registered successfully' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        csvData: {
          type: 'string',
          description: 'JSON stringified array of asset data',
        },
      },
    },
  })
  @Post('batch')
  @UseInterceptors(FilesInterceptor('files'))
  async batchCreate(
    @Body('csvData') csvData: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    const parsedCsvData = JSON.parse(csvData);
    const assets = await this.assetsService.batchCreateAssets(
      parsedCsvData,
      files,
      req.user.email,
    );
    return {
      success: true,
      data: assets,
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  @ApiOperation({ summary: 'Search assets' })
  @ApiResponse({ status: 200, description: 'Assets retrieved successfully' })
  @Get()
  async search(@Query() searchAssetDto: SearchAssetDto) {
    const result = await this.assetsService.searchAssets(searchAssetDto);
    return {
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @ApiOperation({ summary: 'Get asset by name' })
  @ApiResponse({ status: 200, description: 'Asset retrieved successfully' })
  @Get(':name')
  async findByName(@Param('name') name: string) {
    const asset = await this.assetsService.findByName(name);
    return {
      success: true,
      data: asset,
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  @ApiOperation({ summary: 'Update an asset' })
  @ApiResponse({ status: 200, description: 'Asset updated successfully' })
  @Put(':name')
  async update(
    @Param('name') name: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    const asset = await this.assetsService.updateAsset(name, updateAssetDto);
    return {
      success: true,
      data: asset,
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  @ApiOperation({ summary: 'Delete an asset (admin only)' })
  @ApiResponse({ status: 200, description: 'Asset deleted successfully' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':name')
  async delete(@Param('name') name: string) {
    await this.assetsService.deleteAsset(name);
    return {
      success: true,
      data: { message: `Asset ${name} deleted successfully` },
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  @ApiOperation({ summary: 'Curate an asset (admin only)' })
  @ApiResponse({ status: 200, description: 'Asset curated successfully' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post('curate/:name')
  async curate(@Param('name') name: string) {
    const asset = await this.assetsService.curateAsset(name);
    return {
      success: true,
      data: asset,
      metadata: { timestamp: new Date().toISOString() },
    };
  }
}

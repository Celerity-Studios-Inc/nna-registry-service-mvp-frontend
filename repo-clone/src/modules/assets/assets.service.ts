import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Asset } from '../../models/asset.schema';
import { StorageService } from '../storage/storage.service';
import { TaxonomyService } from '../taxonomy/taxonomy.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { SearchAssetDto } from './dto/search-asset.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AssetsService {
  constructor(
    @InjectModel(Asset.name) private assetModel: Model<Asset>,
    private storageService: StorageService,
    private taxonomyService: TaxonomyService,
    private configService: ConfigService,
  ) {}

  async createAsset(
    createAssetDto: CreateAssetDto,
    file: Express.Multer.File,
    userEmail: string,
  ): Promise<Asset> {
    const {
      layer,
      category,
      subcategory,
      source,
      tags,
      description,
      trainingData,
      rights,
      components = [],
    } = createAssetDto;

    // Validate taxonomy
    await this.taxonomyService.validateTaxonomy(layer, category, subcategory);

    const [nnaCategory, nnaSubcategory] = this.taxonomyService.getNnaCodes(
      layer,
      category,
      subcategory,
    );
    const [friendlyCategory, friendlySubcategory] =
      this.taxonomyService.getHumanFriendlyCodes(layer, category, subcategory);

    const count = await this.assetModel.countDocuments({
      layer,
      category,
      subcategory,
    });
    const sequential = (count + 1).toString().padStart(3, '0');

    const fileExtension = file.originalname.split('.').at(-1);

    // Generate HFN and NNA (NNA is placeholder for MVP)
    let name = `${layer}.${friendlyCategory}.${friendlySubcategory}.${sequential}`;
    const nna_address = `${layer}.${nnaCategory}.${nnaSubcategory}.${sequential}`;

    if (layer === 'C' && components.length) {
      name = `${name}:${components.join(':')}`;
    }

    // Upload file to GCP Storage
    const gcpStorageUrl = await this.storageService.uploadFile(
      file.buffer,
      file.mimetype,
      `${name}.${fileExtension}`,
      layer,
      friendlyCategory,
      friendlySubcategory,
    );

    // Create asset
    const asset = new this.assetModel({
      layer,
      category,
      subcategory,
      name,
      nna_address,
      gcpStorageUrl,
      source,
      tags: !!tags ? JSON.parse(tags as unknown as string) : [],
      description,
      trainingData,
      rights,
      components,
      registeredBy: userEmail,
    });

    return asset.save();
  }

  async batchCreateAssets(
    csvData: any[],
    files: Express.Multer.File[],
    userEmail: string,
  ): Promise<Asset[]> {
    const assets: Asset[] = [];
    const fileMap = new Map(files.map((file) => [file.originalname, file]));

    try {
      for (const row of csvData) {
        const {
          layer,
          category,
          subcategory,
          source,
          tags,
          description,
          filename,
        } = row;

        if (
          !layer ||
          !category ||
          !subcategory ||
          !source ||
          !description ||
          !filename
        ) {
          throw new HttpException(
            'Missing required fields in CSV',
            HttpStatus.BAD_REQUEST,
          );
        }

        const file = fileMap.get(filename);
        if (!file) {
          throw new HttpException(
            `File ${filename} not found in uploaded files`,
            HttpStatus.BAD_REQUEST,
          );
        }

        const asset = await this.createAsset(
          {
            layer,
            category,
            subcategory,
            source,
            tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
            description,
            trainingData: row.trainingData
              ? JSON.parse(row.trainingData)
              : undefined,
            rights: row.rights ? JSON.parse(row.rights) : undefined,
            components: row.components
              ? row.components.split(',').map((id: string) => id.trim())
              : undefined,
          },
          file,
          userEmail,
        );

        assets.push(asset);
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HttpException(
          'Invalid CSV data format',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }

    return assets;
  }

  async findByName(name: string): Promise<Asset> {
    const asset = await this.assetModel.findOne({ name });
    if (!asset) {
      throw new HttpException(`Asset not found: ${name}`, HttpStatus.NOT_FOUND);
    }
    return asset;
  }

  async searchAssets(searchAssetDto: SearchAssetDto): Promise<{
    items: Asset[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      layer,
      category,
      subcategory,
      page = 1,
      limit = 10,
    } = searchAssetDto;

    const filter: any = {};
    if (layer) filter.layer = layer;
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (search) filter.$text = { $search: search };

    const totalAssets = await this.assetModel.countDocuments(filter);
    const assets = await this.assetModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      items: assets,
      total: totalAssets,
      page,
      limit,
      totalPages: Math.ceil(totalAssets / limit),
    };
  }

  async updateAsset(
    name: string,
    updateAssetDto: UpdateAssetDto,
  ): Promise<Asset> {
    const asset = await this.findByName(name);

    if (
      updateAssetDto.layer ||
      updateAssetDto.category ||
      updateAssetDto.subcategory
    ) {
      const layer = updateAssetDto.layer || asset.layer;
      const category = updateAssetDto.category || asset.category;
      const subcategory = updateAssetDto.subcategory || asset.subcategory;

      await this.taxonomyService.validateTaxonomy(layer, category, subcategory);

      // Only update name and nna_address if taxonomy changes
      if (
        layer !== asset.layer ||
        category !== asset.category ||
        subcategory !== asset.subcategory
      ) {
        const count = await this.assetModel.countDocuments({
          layer,
          category,
          subcategory,
        });
        const sequential = (count + 1).toString().padStart(3, '0');
        asset.name = `${layer}-${category}-${subcategory}-${sequential}`;
        asset.nna_address = `${layer}.${category}.${subcategory}.${sequential}`; // Placeholder
      }
    }

    // Update other fields
    if (updateAssetDto.source) asset.source = updateAssetDto.source;
    if (updateAssetDto.tags) asset.tags = updateAssetDto.tags;
    if (updateAssetDto.description)
      asset.description = updateAssetDto.description;
    if (updateAssetDto.trainingData) {
      asset.trainingData = {
        prompts: updateAssetDto.trainingData.prompts || [],
        images: updateAssetDto.trainingData.images || [],
        videos: updateAssetDto.trainingData.videos || [],
      };
    }
    if (updateAssetDto.rights) {
      asset.rights = {
        source: updateAssetDto.rights.source || '',
        rights_split: updateAssetDto.rights.rights_split || '',
      };
    }
    if (updateAssetDto.components) asset.components = updateAssetDto.components;

    return asset.save();
  }

  async deleteAsset(name: string): Promise<void> {
    const asset = await this.findByName(name);
    await this.storageService.deleteFile(asset.gcpStorageUrl);
    await asset.deleteOne();
  }

  async curateAsset(name: string): Promise<Asset> {
    const asset = await this.findByName(name);
    // For MVP, curation is a simple validation of HFN, NNA, and description
    if (!asset.name || !asset.nna_address || !asset.description) {
      throw new HttpException(
        'Asset missing required fields for curation',
        HttpStatus.BAD_REQUEST,
      );
    }

    // In a full implementation, this would include more sophisticated curation logic
    // such as validation against content guidelines, quality checks, etc.
    return asset;
  }
}

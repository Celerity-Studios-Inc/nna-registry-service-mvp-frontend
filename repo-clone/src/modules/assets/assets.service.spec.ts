import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AssetsService } from './assets.service';
import { StorageService } from '../storage/storage.service';
import { TaxonomyService } from '../taxonomy/taxonomy.service';
import { Asset } from '../../models/asset.schema';
import { HttpException } from '@nestjs/common';
import { TestConfigModule } from '../../test/test.config';

describe('AssetsService', () => {
  let service: AssetsService;
  let assetModel: any;
  let storageService: any;
  let taxonomyService: any;

  beforeEach(async () => {
    // Create a factory function for asset instances
    const assetFactory = (dto: any) => {
      const instance = {
        ...dto,
        _id: 'mockAssetId',
        save: jest.fn().mockImplementation(function() {
          return Promise.resolve(this);
        }),
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      };
      return instance;
    };
    
    // Create a mock constructor function
    function MockAssetModel(dto: any) {
      const instance = assetFactory(dto);
      return instance;
    }
    
    // Add static methods to the constructor function
    MockAssetModel.find = jest.fn();
    MockAssetModel.findOne = jest.fn();
    MockAssetModel.countDocuments = jest.fn();
    MockAssetModel.create = jest.fn();
    MockAssetModel.exec = jest.fn();
    MockAssetModel.prototype = {
      save: jest.fn().mockImplementation(function() {
        return Promise.resolve(this);
      })
    };
    
    // Create the mock asset model with proper type
    const mockAssetModel = MockAssetModel;
    
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestConfigModule],
      providers: [
        AssetsService,
        {
          provide: getModelToken(Asset.name),
          useValue: mockAssetModel,
        },
        {
          provide: StorageService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
        {
          provide: TaxonomyService,
          useValue: {
            validateTaxonomy: jest.fn(),
            getNnaCodes: jest.fn(),
            getHumanFriendlyCodes: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
    assetModel = module.get(getModelToken(Asset.name));
    storageService = module.get<StorageService>(StorageService);
    taxonomyService = module.get<TaxonomyService>(TaxonomyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAsset', () => {
    it.skip('should successfully create an asset', async () => {
      const mockAsset = {
        _id: 'mockAssetId',
        name: 'G.pop.tsw.001',
        nna_address: 'G.POP.TSW.001',
        layer: 'G',
        category: 'POP',
        subcategory: 'TSW',
        description: 'Test asset',
        source: 'test',
        tags: ['test', 'asset'],
        gcpStorageUrl: 'mock-file-url',
        registeredBy: 'test@example.com',
        components: [],
        rights: undefined,
        trainingData: undefined,
        save: jest.fn().mockResolvedValue({
          _id: 'mockAssetId',
          name: 'G.pop.tsw.001',
          nna_address: 'G.POP.TSW.001',
          layer: 'G',
          category: 'POP',
          subcategory: 'TSW',
          description: 'Test asset',
          source: 'test',
          tags: ['test', 'asset'],
          gcpStorageUrl: 'mock-file-url',
          registeredBy: 'test@example.com',
          components: [],
          rights: undefined,
          trainingData: undefined
        })
      };

      assetModel.countDocuments.mockResolvedValue(0);
      assetModel.prototype.constructor = jest.fn().mockReturnValue(mockAsset);
      assetModel.bind = jest.fn().mockReturnValue(mockAsset);
      assetModel.prototype.save = mockAsset.save;
      assetModel.prototype = Object.assign(assetModel.prototype, mockAsset);
      assetModel.prototype.constructor = jest.fn().mockImplementation(() => mockAsset);
      assetModel.prototype = mockAsset;
      storageService.uploadFile.mockResolvedValue('mock-file-url');
      taxonomyService.validateTaxonomy.mockResolvedValue(true);
      taxonomyService.getNnaCodes.mockReturnValue(['POP', 'TSW']);
      taxonomyService.getHumanFriendlyCodes.mockReturnValue(['pop', 'tsw']);

      const result = await service.createAsset(
        {
          layer: 'G',
          category: 'POP',
          subcategory: 'TSW',
          source: 'test',
          description: 'Test asset',
          tags: JSON.stringify(['test', 'asset']),
        },
        {
          originalname: 'test.jpg',
          buffer: Buffer.from('test'),
          fieldname: 'file',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          size: 4,
        } as Express.Multer.File,
        'test@example.com'
      );

      const essentialProps = ['name', 'nna_address', 'layer', 'category', 'subcategory', 'description', 'source', 'tags', 'gcpStorageUrl', 'registeredBy'];
      const resultObj = Object.fromEntries(
        Object.entries(result).filter(([key]) => essentialProps.includes(key))
      );
      const mockObj = Object.fromEntries(
        Object.entries(mockAsset).filter(([key]) => essentialProps.includes(key))
      );
      expect(resultObj).toEqual(mockObj);
      expect(mockAsset.save).toHaveBeenCalled();
      expect(storageService.uploadFile).toHaveBeenCalled();
      expect(taxonomyService.validateTaxonomy).toHaveBeenCalled();
      expect(taxonomyService.getNnaCodes).toHaveBeenCalled();
      expect(taxonomyService.getHumanFriendlyCodes).toHaveBeenCalled();
    });
  });

  describe('findByName', () => {
    it('should return an asset when found', async () => {
      const mockAsset = {
        name: 'G-POP-TSW-001',
        nna_address: 'G.POP.TSW.001',
      };
      assetModel.findOne.mockResolvedValue(mockAsset);

      const result = await service.findByName('G-POP-TSW-001');
      expect(result).toEqual(mockAsset);
      expect(assetModel.findOne).toHaveBeenCalledWith({ name: 'G-POP-TSW-001' });
    });

    it('should throw an exception when asset not found', async () => {
      assetModel.findOne.mockResolvedValue(null);

      await expect(service.findByName('nonexistent')).rejects.toThrow(HttpException);
      expect(assetModel.findOne).toHaveBeenCalledWith({ name: 'nonexistent' });
    });
  });

  describe('searchAssets', () => {
    it('should return assets with pagination info', async () => {
      const mockAssets = [{ name: 'G-POP-TSW-001' }, { name: 'G-POP-TSW-002' }];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockAssets),
      };
      assetModel.find.mockReturnValue(mockQuery);
      assetModel.countDocuments.mockResolvedValue(2);

      const result = await service.searchAssets({
        layer: 'G',
        category: 'POP',
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        items: mockAssets,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(assetModel.find).toHaveBeenCalledWith({
        layer: 'G',
        category: 'POP',
      });
      expect(assetModel.countDocuments).toHaveBeenCalledWith({
        layer: 'G',
        category: 'POP',
      });
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('AssetsController', () => {
  let controller: AssetsController;
  let service: AssetsService;

  beforeEach(async () => {
    const mockService = {
      createAsset: jest.fn(),
      batchCreateAssets: jest.fn(),
      findByName: jest.fn(),
      searchAssets: jest.fn(),
      updateAsset: jest.fn(),
      deleteAsset: jest.fn(),
      curateAsset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
      providers: [
        {
          provide: AssetsService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AssetsController>(AssetsController);
    service = module.get<AssetsService>(AssetsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an asset', async () => {
      const createAssetDto = {
        layer: 'G',
        category: 'POP',
        subcategory: 'TSW',
        source: 'ReViz',
        description: 'A pop song',
      };
      const file = {} as Express.Multer.File;
      const req = { user: { email: 'user@example.com' } };
      const mockAsset = { ...createAssetDto, name: 'G-POP-TSW-001' };

      jest.spyOn(service, 'createAsset').mockResolvedValue(mockAsset as any);

      const result = await controller.create(createAssetDto as any, file, req);

      expect(service.createAsset).toHaveBeenCalledWith(createAssetDto, file, 'user@example.com');
      expect(result).toEqual({
        success: true,
        data: mockAsset,
        metadata: expect.objectContaining({
          timestamp: expect.any(String),
        }),
      });
    });
  });

  describe('search', () => {
    it.skip('should return search results with pagination', async () => {
      const searchAssetDto = { layer: 'G', page: 1, limit: 10 };
      const mockResult = {
        items: [{ 
          name: 'G-POP-TSW-001',
          layer: 'G',
          category: 'POP',
          subcategory: 'TSW',
          nna_address: 'G.POP.TSW.001',
          gcpStorageUrl: 'https://storage.example.com/test.mp3',
          source: 'Test',
          tags: [],
          description: 'Test asset',
          createdAt: new Date(),
          updatedAt: new Date()
        } as any],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      };

      jest.spyOn(service, 'searchAssets').mockResolvedValue(mockResult);

      const result = await controller.search(searchAssetDto as any);

      expect(service.searchAssets).toHaveBeenCalledWith(searchAssetDto);
      expect(result).toEqual({
        success: true,
        data: mockResult,
        metadata: {
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('findByName', () => {
    it('should return an asset by name', async () => {
      const mockAsset = { name: 'G-POP-TSW-001' };
      
      jest.spyOn(service, 'findByName').mockResolvedValue(mockAsset as any);

      const result = await controller.findByName('G-POP-TSW-001');

      expect(service.findByName).toHaveBeenCalledWith('G-POP-TSW-001');
      expect(result).toEqual({
        success: true,
        data: mockAsset,
        metadata: expect.objectContaining({
          timestamp: expect.any(String),
        }),
      });
    });
  });
});
#!/bin/bash
# Script to test the subcategory normalization fix

cd ../nna-registry-service-mvp-backend || exit 1

# Create basic test file
mkdir -p test
cat > test/taxonomy.service.spec.ts << EOF
import { Test, TestingModule } from '@nestjs/testing';
import { TaxonomyService } from '../src/modules/taxonomy/taxonomy.service';
import { getTaxonomyData } from '../src/common/utils/taxonomy.util';

// Mock the taxonomy data utility
jest.mock('../src/common/utils/taxonomy.util', () => ({
  getTaxonomyData: jest.fn(),
}));

describe('TaxonomyService', () => {
  let service: TaxonomyService;

  // Sample taxonomy data for testing
  const mockTaxonomyData = {
    S: {
      name: 'Stars',
      categories: {
        '001': {
          name: 'POP',
          code: 'POP',
          subcategories: {
            '001': { name: 'Base', code: 'BAS' },
            '002': { name: 'Pop_Diva_Female_Stars', code: 'DIV' },
            '003': { name: 'Pop_Idol_Female_Stars', code: 'IDF' },
            '004': { name: 'Pop_Legend_Female_Stars', code: 'LGF' },
            '005': { name: 'Pop_Legend_Male_Stars', code: 'LGM' },
            '006': { name: 'Pop_Icon_Male_Stars', code: 'ICM' },
            '007': { name: 'Pop_Hipster_Male_Stars', code: 'HPM' },
          },
        },
      },
    },
  };

  beforeEach(async () => {
    // Mock the taxonomy data
    (getTaxonomyData as jest.Mock).mockReturnValue(mockTaxonomyData);

    const module: TestingModule = await Test.createTestingModule({
      providers: [TaxonomyService],
    }).compile();

    service = module.get<TaxonomyService>(TaxonomyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subcategory handling for S.POP', () => {
    it('should correctly handle S.POP.LGF', () => {
      const [categoryCode, subcategoryCode] = service.ensureProperSubcategory('S', 'POP', 'LGF');
      expect(categoryCode).toBe('001');
      expect(subcategoryCode).toBe('004');
    });

    it('should correctly handle S.POP.LGM', () => {
      const [categoryCode, subcategoryCode] = service.ensureProperSubcategory('S', 'POP', 'LGM');
      expect(categoryCode).toBe('001');
      expect(subcategoryCode).toBe('005');
    });

    it('should correctly handle S.POP.DIV', () => {
      const [categoryCode, subcategoryCode] = service.ensureProperSubcategory('S', 'POP', 'DIV');
      expect(categoryCode).toBe('001');
      expect(subcategoryCode).toBe('002');
    });

    it('should correctly handle S.POP.HPM', () => {
      const [categoryCode, subcategoryCode] = service.ensureProperSubcategory('S', 'POP', 'HPM');
      expect(categoryCode).toBe('001');
      expect(subcategoryCode).toBe('007');
    });

    it('should handle case-insensitive subcategories', () => {
      const [categoryCode, subcategoryCode] = service.ensureProperSubcategory('S', 'POP', 'lgf');
      expect(categoryCode).toBe('001');
      expect(subcategoryCode).toBe('004');
    });
  });
});
EOF

# Run the tests
echo "To run the tests, use: npm test"
echo "The test file has been created at: test/taxonomy.service.spec.ts"
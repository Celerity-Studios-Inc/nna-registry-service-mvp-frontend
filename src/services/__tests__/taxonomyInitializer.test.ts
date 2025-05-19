import {
  initializeTaxonomy,
  isTaxonomyInitialized,
  getTaxonomyInitError,
} from '../taxonomyInitializer';
import { taxonomyService } from '../simpleTaxonomyService';
import flattenedTaxonomy, {
  generateWorldLayerLookupTable,
  generateStarLayerLookupTable,
} from '../../utils/taxonomyFlattener';

// Mock the logger
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    taxonomy: jest.fn(),
    api: jest.fn(),
    auth: jest.fn(),
    file: jest.fn(),
    ui: jest.fn(),
    general: jest.fn(),
    addLogEntry: jest.fn(),
  },
  LogLevel: {
    INFO: 'INFO',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG',
    WARN: 'WARN',
  },
  LogCategory: {
    GENERAL: 'GENERAL',
    API: 'API',
    AUTH: 'AUTH',
    TAXONOMY: 'TAXONOMY',
    FILE: 'FILE',
    UI: 'UI',
  },
}));

// Get flattened taxonomy data for testing
const worldTaxonomy = generateWorldLayerLookupTable();
const starTaxonomy = generateStarLayerLookupTable();

// Mock the taxonomy service
jest.mock('../simpleTaxonomyService', () => ({
  taxonomyService: {
    getCategories: jest.fn(),
    getSubcategories: jest.fn(),
    convertHFNtoMFA: jest.fn(),
  },
}));

describe('Taxonomy Initializer', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset module state between tests (this is a hack because we can't directly access private variables)
    // @ts-ignore
    global.__TAXONOMY_INIT_TEST_RESET = true;
    initializeTaxonomy();
    // @ts-ignore
    global.__TAXONOMY_INIT_TEST_RESET = false;
  });

  it('should successfully initialize when taxonomy data is valid', async () => {
    // Mock successful responses using flattened taxonomy data
    (taxonomyService.getCategories as jest.Mock).mockImplementation(layer => {
      if (layer === 'W') {
        return Object.entries(worldTaxonomy.categories).map(([code, data]) => ({
          code: code,
          name: data.name,
          numericCode: data.mfaCode,
        }));
      } else if (layer === 'S') {
        return Object.entries(starTaxonomy.categories).map(([code, data]) => ({
          code: code,
          name: data.name,
          numericCode: data.mfaCode,
        }));
      }
      return [{ code: 'CAT1', name: 'Category 1', numericCode: '001' }];
    });

    (taxonomyService.getSubcategories as jest.Mock).mockImplementation(
      (layer, category) => {
        if (layer === 'W' && category === 'BCH') {
          return Object.entries(worldTaxonomy.subcategories.BCH).map(
            ([code, data]) => ({
              code: code,
              name: data.name,
              numericCode: data.mfaCode,
            })
          );
        } else if (layer === 'S' && category === 'POP') {
          return Object.entries(starTaxonomy.subcategories.POP).map(
            ([code, data]) => ({
              code: code,
              name: data.name,
              numericCode: data.mfaCode,
            })
          );
        }
        return [{ code: 'SUB1', name: 'Subcategory 1', numericCode: '001' }];
      }
    );

    (taxonomyService.convertHFNtoMFA as jest.Mock).mockImplementation(hfn => {
      // Extract parts from the HFN
      const parts = hfn.split('.');
      if (parts.length < 4) return '';

      const [layer, category, subcategory, sequential] = parts;

      // Use the flattened taxonomy data to get proper MFAs
      if (layer === 'W') {
        const layerCode = worldTaxonomy.mfaCode;
        const categoryCode =
          worldTaxonomy.categories[category]?.mfaCode || '000';
        const subcategoryCode =
          worldTaxonomy.subcategories[category]?.[subcategory]?.mfaCode ||
          '000';
        return `${layerCode}.${categoryCode}.${subcategoryCode}.${sequential}`;
      } else if (layer === 'S') {
        const layerCode = starTaxonomy.mfaCode;
        const categoryCode =
          starTaxonomy.categories[category]?.mfaCode || '000';
        const subcategoryCode =
          starTaxonomy.subcategories[category]?.[subcategory]?.mfaCode || '000';
        return `${layerCode}.${categoryCode}.${subcategoryCode}.${sequential}`;
      }

      return '';
    });

    const success = await initializeTaxonomy();

    expect(success).toBe(true);
    expect(isTaxonomyInitialized()).toBe(true);
    expect(getTaxonomyInitError()).toBeNull();
  });

  it('should fail initialization when categories are missing', async () => {
    // Mock empty categories response
    (taxonomyService.getCategories as jest.Mock).mockReturnValue([]);

    (taxonomyService.getSubcategories as jest.Mock).mockImplementation(
      (layer, category) => {
        return [{ code: 'SUB1', name: 'Subcategory 1', numericCode: '001' }];
      }
    );

    // Use the flattened taxonomy data to convert HFN to MFA
    (taxonomyService.convertHFNtoMFA as jest.Mock).mockImplementation(hfn => {
      const parts = hfn.split('.');
      if (parts.length < 4) return '';

      const [layer, category, subcategory, sequential] = parts;

      if (layer === 'W') {
        const layerCode = worldTaxonomy.mfaCode;
        const categoryCode =
          worldTaxonomy.categories[category]?.mfaCode || '000';
        const subcategoryCode =
          worldTaxonomy.subcategories[category]?.[subcategory]?.mfaCode ||
          '000';
        return `${layerCode}.${categoryCode}.${subcategoryCode}.${sequential}`;
      } else if (layer === 'S') {
        const layerCode = starTaxonomy.mfaCode;
        const categoryCode =
          starTaxonomy.categories[category]?.mfaCode || '000';
        const subcategoryCode =
          starTaxonomy.subcategories[category]?.[subcategory]?.mfaCode || '000';
        return `${layerCode}.${categoryCode}.${subcategoryCode}.${sequential}`;
      }

      return '';
    });

    const success = await initializeTaxonomy();

    expect(success).toBe(false);
    expect(isTaxonomyInitialized()).toBe(false);
    expect(getTaxonomyInitError()).not.toBeNull();
  });

  it('should fail initialization when critical mappings are incorrect', async () => {
    (taxonomyService.getCategories as jest.Mock).mockImplementation(layer => {
      return [{ code: 'CAT1', name: 'Category 1', numericCode: '001' }];
    });

    (taxonomyService.getSubcategories as jest.Mock).mockImplementation(
      (layer, category) => {
        return [{ code: 'SUB1', name: 'Subcategory 1', numericCode: '001' }];
      }
    );

    // Return incorrect MFA for critical mapping
    // This is a deliberate error to test validation failure
    (taxonomyService.convertHFNtoMFA as jest.Mock).mockImplementation(hfn => {
      // Deliberately return incorrect values for specific HFNs to test validation
      if (hfn === 'W.BCH.SUN.001') return 'INCORRECT'; // Invalid format

      // For S.POP.HPM.001, return a wrong but valid-looking MFA
      // Instead of the correct mapping from the flattened taxonomy (which would be 2.001.007.001)
      if (hfn === 'S.POP.HPM.001') return '2.004.003.001';

      return '';
    });

    const success = await initializeTaxonomy();

    expect(success).toBe(false);
    expect(isTaxonomyInitialized()).toBe(false);
    expect(getTaxonomyInitError()).not.toBeNull();
  });
});

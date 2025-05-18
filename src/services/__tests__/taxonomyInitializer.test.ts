import { initializeTaxonomy, isTaxonomyInitialized, getTaxonomyInitError } from '../taxonomyInitializer';
import { taxonomyService } from '../simpleTaxonomyService';

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
    addLogEntry: jest.fn()
  },
  LogLevel: {
    INFO: 'INFO',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG',
    WARN: 'WARN'
  },
  LogCategory: {
    GENERAL: 'GENERAL',
    API: 'API',
    AUTH: 'AUTH',
    TAXONOMY: 'TAXONOMY',
    FILE: 'FILE',
    UI: 'UI'
  }
}));

// Mock the taxonomy service
jest.mock('../simpleTaxonomyService', () => ({
  taxonomyService: {
    getCategories: jest.fn(),
    getSubcategories: jest.fn(),
    convertHFNtoMFA: jest.fn()
  }
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
    // Mock successful responses
    (taxonomyService.getCategories as jest.Mock).mockImplementation((layer) => {
      return [{ code: 'CAT1', name: 'Category 1', numericCode: '001' }];
    });
    
    (taxonomyService.getSubcategories as jest.Mock).mockImplementation((layer, category) => {
      return [{ code: 'SUB1', name: 'Subcategory 1', numericCode: '001' }];
    });
    
    (taxonomyService.convertHFNtoMFA as jest.Mock).mockImplementation((hfn) => {
      if (hfn === 'W.BCH.SUN.001') return '5.004.003.001';
      if (hfn === 'S.POP.HPM.001') return '2.001.007.001';
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
    
    (taxonomyService.getSubcategories as jest.Mock).mockImplementation((layer, category) => {
      return [{ code: 'SUB1', name: 'Subcategory 1', numericCode: '001' }];
    });
    
    (taxonomyService.convertHFNtoMFA as jest.Mock).mockImplementation((hfn) => {
      if (hfn === 'W.BCH.SUN.001') return '5.004.003.001';
      if (hfn === 'S.POP.HPM.001') return '2.001.007.001';
      return '';
    });
    
    const success = await initializeTaxonomy();
    
    expect(success).toBe(false);
    expect(isTaxonomyInitialized()).toBe(false);
    expect(getTaxonomyInitError()).not.toBeNull();
  });
  
  it('should fail initialization when critical mappings are incorrect', async () => {
    (taxonomyService.getCategories as jest.Mock).mockImplementation((layer) => {
      return [{ code: 'CAT1', name: 'Category 1', numericCode: '001' }];
    });
    
    (taxonomyService.getSubcategories as jest.Mock).mockImplementation((layer, category) => {
      return [{ code: 'SUB1', name: 'Subcategory 1', numericCode: '001' }];
    });
    
    // Return incorrect MFA for critical mapping
    (taxonomyService.convertHFNtoMFA as jest.Mock).mockImplementation((hfn) => {
      if (hfn === 'W.BCH.SUN.001') return 'INCORRECT';
      if (hfn === 'S.POP.HPM.001') return '2.004.003.001';
      return '';
    });
    
    const success = await initializeTaxonomy();
    
    expect(success).toBe(false);
    expect(isTaxonomyInitialized()).toBe(false);
    expect(getTaxonomyInitError()).not.toBeNull();
  });
});
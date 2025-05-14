import taxonomyData from '../assets/enriched_nna_layer_taxonomy_v1.3.json';
import {
  TaxonomyData,
  LayerInfo,
  Category,
  Subcategory,
  LayerOption,
  CategoryOption,
  SubcategoryOption,
} from '../types/taxonomy.types';

class TaxonomyService {
  private taxonomyData: TaxonomyData;
  private isInitialized: boolean = false;
  private layerCache: Map<string, LayerInfo> = new Map();
  private categoriesCache: Map<string, CategoryOption[]> = new Map();
  private subcategoriesCache: Map<string, SubcategoryOption[]> = new Map();

  constructor() {
    this.taxonomyData = taxonomyData as unknown as TaxonomyData;
    this.initialize();
  }

  /**
   * Initialize the taxonomy service and validate data
   */
  private initialize(): void {
    try {
      // Basic validation to ensure taxonomy data is structured correctly
      if (!this.taxonomyData) {
        throw new Error('Taxonomy data is empty or invalid');
      }

      // Check for required layers (G, S, L, M, W) at minimum
      const requiredLayers = ['G', 'S', 'L', 'M', 'W'];
      for (const layer of requiredLayers) {
        if (!this.taxonomyData[layer]) {
          throw new Error(
            `Required layer ${layer} is missing from taxonomy data`
          );
        }
      }

      this.isInitialized = true;
      console.log('Taxonomy service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize taxonomy service:', error);
      throw error;
    }
  }

  /**
   * Check if the service is initialized
   */
  private checkInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Taxonomy service is not initialized');
    }
  }

  /**
   * Get all available layers
   * @returns Array of layer options
   */
  getLayers(): LayerOption[] {
    this.checkInitialized();

    const layers: LayerOption[] = [];
    for (const layerCode in this.taxonomyData) {
      // Skip any non-layer properties
      const layerData = this.taxonomyData[layerCode];
      if (
        typeof layerData !== 'object' ||
        layerData === null ||
        !('name' in layerData)
      ) {
        continue;
      }

      const layer = this.taxonomyData[layerCode] as LayerInfo;
      layers.push({
        id: layerCode,
        name: layer.name,
        code: layerCode,
      });
    }

    return layers;
  }

  /**
   * Get the layer information by layer code
   * @param layerCode The layer code (e.g., 'G', 'S', 'L')
   * @returns Layer information or null if not found
   */
  getLayer(layerCode: string): LayerInfo | null {
    this.checkInitialized();

    if (this.layerCache.has(layerCode)) {
      return this.layerCache.get(layerCode) || null;
    }

    const layer = this.taxonomyData[layerCode];
    if (
      !layer ||
      typeof layer !== 'object' ||
      !('name' in layer) ||
      !('categories' in layer)
    ) {
      return null;
    }

    this.layerCache.set(layerCode, layer as LayerInfo);
    return layer as LayerInfo;
  }

  /**
   * Get categories for a specific layer
   * @param layerCode The layer code (e.g., 'G', 'S', 'L')
   * @returns Array of category options
   */
  getCategories(layerCode: string): CategoryOption[] {
    this.checkInitialized();

    if (this.categoriesCache.has(layerCode)) {
      return this.categoriesCache.get(layerCode) || [];
    }

    const layer = this.getLayer(layerCode);
    if (!layer || !layer.categories) {
      return [];
    }

    const categories: CategoryOption[] = [];
    for (const categoryCode in layer.categories) {
      const category = layer.categories[categoryCode];

      // Use numeric index + 1 as a fallback numeric code
      const numericCode =
        parseInt(categoryCode, 10) ||
        Object.keys(layer.categories).indexOf(categoryCode) + 1;

      categories.push({
        id: `${layerCode}.${categoryCode}`,
        code: categoryCode,
        name: category.name,
        numericCode,
      });
    }

    this.categoriesCache.set(layerCode, categories);
    return categories;
  }

  /**
   * Get subcategories for a specific category within a layer
   * @param layerCode The layer code (e.g., 'G', 'S', 'L')
   * @param categoryCode The category code (e.g., '001', '002')
   * @returns Array of subcategory options
   */
  getSubcategories(
    layerCode: string,
    categoryCode: string
  ): SubcategoryOption[] {
    this.checkInitialized();

    const cacheKey = `${layerCode}.${categoryCode}`;
    if (this.subcategoriesCache.has(cacheKey)) {
      return this.subcategoriesCache.get(cacheKey) || [];
    }

    const layer = this.getLayer(layerCode);
    if (!layer || !layer.categories || !layer.categories[categoryCode]) {
      return [];
    }

    const category = layer.categories[categoryCode];
    if (!category.subcategories) {
      return [];
    }

    const subcategories: SubcategoryOption[] = [];
    for (const subcategoryCode in category.subcategories) {
      const subcategory = category.subcategories[subcategoryCode];
      // Use numeric index + 1 as a fallback numeric code
      const numericCode =
        parseInt(subcategoryCode, 10) ||
        Object.keys(category.subcategories).indexOf(subcategoryCode) + 1;

      subcategories.push({
        code: subcategory.code || '',
        name: subcategory.name,
        numericCode,
        id: `${layerCode}.${category.code}.${subcategory.code}`,
      });
    }

    this.subcategoriesCache.set(cacheKey, subcategories);
    return subcategories;
  }

  /**
   * Get the full taxonomy data
   * @returns The complete taxonomy data object
   */
  getTaxonomyData(): TaxonomyData {
    this.checkInitialized();
    return this.taxonomyData;
  }

  /**
   * Get a category by its code and layer
   * @param layerCode The layer code
   * @param categoryCode The category code
   * @returns The category object or null if not found
   */
  getCategory(layerCode: string, categoryCode: string): Category | null {
    this.checkInitialized();

    const layer = this.getLayer(layerCode);
    if (!layer || !layer.categories || !layer.categories[categoryCode]) {
      return null;
    }

    return layer.categories[categoryCode];
  }

  /**
   * Get a subcategory by its codes
   * @param layerCode The layer code
   * @param categoryCode The category code
   * @param subcategoryCode The subcategory code
   * @returns The subcategory object or null if not found
   */
  getSubcategory(
    layerCode: string,
    categoryCode: string,
    subcategoryCode: string
  ): Subcategory | null {
    this.checkInitialized();

    const category = this.getCategory(layerCode, categoryCode);
    if (
      !category ||
      !category.subcategories ||
      !category.subcategories[subcategoryCode]
    ) {
      return null;
    }

    const subcategory = category.subcategories[subcategoryCode];
    return {
      ...subcategory,
      id: `${layerCode}.${category.code}.${subcategory.code}`,
    };
  }

  /**
   * Get the numeric code for a category
   * @param layerCode The layer code
   * @param categoryCode The alphabetic category code
   * @returns The numeric code or -1 if not found
   */
  getCategoryNumericCode(layerCode: string, categoryCode: string): number {
    this.checkInitialized();

    const categories = this.getCategories(layerCode);
    const category = categories.find(c => c.code === categoryCode);

    if (!category) {
      return -1;
    }

    return category.numericCode || 0;
  }

  /**
   * Get the numeric code for a subcategory
   * @param layerCode The layer code
   * @param categoryCode The alphabetic category code
   * @param subcategoryCode The alphabetic subcategory code
   * @returns The numeric code or -1 if not found
   */
  getSubcategoryNumericCode(
    layerCode: string,
    categoryCode: string,
    subcategoryCode: string
  ): number {
    this.checkInitialized();

    const subcategories = this.getSubcategories(layerCode, categoryCode);
    const subcategory = subcategories.find(sc => sc.code === subcategoryCode);

    if (!subcategory) {
      return -1;
    }

    return subcategory.numericCode || 0;
  }

  /**
   * Get the alphabetic code for a category using its numeric code
   * @param layerCode The layer code
   * @param numericCode The numeric category code
   * @returns The alphabetic code or empty string if not found
   */
  getCategoryAlphabeticCode(layerCode: string, numericCode: number): string {
    this.checkInitialized();

    const categories = this.getCategories(layerCode);
    const category = categories.find(c => c.numericCode === numericCode);

    if (!category) {
      return '';
    }

    // If the code is numeric, try to generate an alphabetic code from the name
    if (/^\d+$/.test(category.code) && category.name) {
      return this.generateAlphabeticCodeFromName(category.name);
    }

    return category.code;
  }

  /**
   * Get the alphabetic code for a subcategory using its numeric code
   * @param layerCode The layer code
   * @param categoryNumericCode The numeric category code
   * @param subcategoryNumericCode The numeric subcategory code
   * @returns The alphabetic code or empty string if not found
   */
  getSubcategoryAlphabeticCode(
    layerCode: string,
    categoryNumericCode: number,
    subcategoryNumericCode: number
  ): string {
    this.checkInitialized();

    // First, find the category alphabetic code
    const categoryCode = this.getCategoryAlphabeticCode(
      layerCode,
      categoryNumericCode
    );
    if (!categoryCode) {
      return '';
    }

    // Then use it to get the subcategories and find the matching numeric code
    const subcategories = this.getSubcategories(layerCode, categoryCode);
    const subcategory = subcategories.find(
      sc => sc.numericCode === subcategoryNumericCode
    );

    if (!subcategory) {
      return '';
    }

    // If the code is numeric, try to generate an alphabetic code from the name
    if (/^\d+$/.test(subcategory.code) && subcategory.name) {
      return this.generateAlphabeticCodeFromName(subcategory.name);
    }

    return subcategory.code;
  }

  /**
   * Get the category name using its numeric code
   * @param layerCode The layer code
   * @param numericCode The numeric category code
   * @returns The category name or undefined if not found
   */
  getCategoryNameByNumericCode(
    layerCode: string,
    numericCode: number
  ): string | undefined {
    this.checkInitialized();

    const categories = this.getCategories(layerCode);
    const category = categories.find(c => c.numericCode === numericCode);

    return category?.name;
  }

  /**
   * Get the subcategory name using its numeric code
   * @param layerCode The layer code
   * @param categoryNumericCode The numeric category code
   * @param subcategoryNumericCode The numeric subcategory code
   * @returns The subcategory name or undefined if not found
   */
  getSubcategoryNameByNumericCode(
    layerCode: string,
    categoryNumericCode: number,
    subcategoryNumericCode: number
  ): string | undefined {
    this.checkInitialized();

    // First, find the category alphabetic code
    const categoryCode = this.getCategoryAlphabeticCode(
      layerCode,
      categoryNumericCode
    );
    if (!categoryCode) {
      return undefined;
    }

    // Then use it to get the subcategories and find the matching numeric code
    const subcategories = this.getSubcategories(layerCode, categoryCode);
    const subcategory = subcategories.find(
      sc => sc.numericCode === subcategoryNumericCode
    );

    return subcategory?.name;
  }

  /**
   * Generate a 3-letter alphabetic code from a name using various strategies
   * @param name The name to convert to an alphabetic code
   * @returns A 3-letter alphabetic code
   */
  private generateAlphabeticCodeFromName(name: string): string {
    if (!name) return '';

    // Replace underscores and hyphens with spaces for word boundary detection
    const cleanName = name.replace(/[_-]/g, ' ');

    // If name is a single word and 3-5 letters, use it directly
    if (/^[A-Za-z]{3,5}$/.test(cleanName)) {
      return cleanName.substring(0, 3).toUpperCase();
    }

    // For compound words, take first letters of each word (up to 3 words)
    const words = cleanName.split(/\s+/).filter(word => word.length > 0);

    if (words.length >= 3) {
      return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
    }

    if (words.length === 2) {
      // If two words, take first letter of each word plus first letter of second word
      if (words[1].length >= 2) {
        return (words[0][0] + words[1][0] + words[1][1]).toUpperCase();
      } else {
        return (words[0][0] + words[0][1] + words[1][0]).toUpperCase();
      }
    }

    // For a single word, take first 3 letters
    if (words.length === 1 && words[0].length >= 3) {
      return words[0].substring(0, 3).toUpperCase();
    }

    // Fallback - take whatever's available and pad with X
    const available = cleanName.replace(/\s+/g, '');
    return (available + 'XXX').substring(0, 3).toUpperCase();
  }

  /**
   * Get the next available sequential number for a taxonomy path
   * @param layerCode The layer code
   * @param categoryCode The category code
   * @param subcategoryCode The subcategory code
   * @param existingNumbers Optional array of existing numbers to avoid
   * @returns The next available number, starting from 1
   */
  getNextSequentialNumber(
    layerCode: string,
    categoryCode: string,
    subcategoryCode: string,
    existingNumbers?: number[]
  ): number {
    // In a real implementation, this would query the database
    // For now, we'll simulate by using the provided existingNumbers
    // or start from 1 if none are provided

    if (!existingNumbers || existingNumbers.length === 0) {
      return 1;
    }

    // Find the highest existing number and add 1
    return Math.max(...existingNumbers) + 1;
  }

  /**
   * Get the next sequential number for a taxonomy path via API
   * This is a mock implementation for development
   * @param layerCode The layer code
   * @param category The category name
   * @param subcategory The subcategory name
   * @returns Promise that resolves to an object with the sequential number
   */
  async getSequentialNumber(
    layerCode: string,
    category: string,
    subcategory: string
  ): Promise<{ sequential: string }> {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 500));

    // Store sequential counters in a static map to ensure incrementing numbers
    // for the same layer/category/subcategory combination
    if (!this.sequentialCounters) {
      this.sequentialCounters = new Map<string, number>();
    }

    // IMPORTANT: Fix for category code format consistency
    // Ensure we're using alphabetic codes for the canonical path
    // If numeric code is provided for category (like "001"), convert to alphabetic (like "POP")
    let categoryKey = category || "DEFAULT";
    let subcategoryKey = subcategory || "DEFAULT";

    // Check if category is in numeric format (e.g., "001") and convert to alphabetic (e.g., "POP")
    if (categoryKey && /^\d+$/.test(categoryKey)) {
      // For Stars layer with category code 001, use "POP"
      if (layerCode === 'S' && categoryKey === '001') {
        categoryKey = 'POP';
      }
    }

    // Create a key using the taxonomy path
    const taxonomyPath = `${layerCode}.${categoryKey}.${subcategoryKey}`;

    console.log(`Generating sequential number for path: ${taxonomyPath}`);

    // IMPORTANT FIX: Instead of incrementing on every call, we should increment
    // only when a new asset is actually created. For preview purposes, just return
    // the next available number without incrementing.

    // In a real implementation, this would query the API to get the actual next available number

    // Use a common approach for all taxonomy paths
    // No special handling for specific paths needed anymore

    // For all other paths, use a simple incrementing counter
    // but don't increment on every call (only once per component lifecycle)
    const counter = this.sequentialCounters.has(taxonomyPath) ?
                   this.sequentialCounters.get(taxonomyPath)! :
                   this.initializePathCounter(taxonomyPath);

    // Format the counter as a 3-digit string (001, 002, etc.)
    const sequential = String(counter).padStart(3, '0');

    console.log(`Generated sequential number: ${sequential} for path: ${taxonomyPath}`);

    return { sequential };
  }

  // Helper method to initialize a counter for a path (only called once per path)
  private initializePathCounter(taxonomyPath: string): number {
    // Start at a reasonable number (1 for most paths)
    const initialCounter = 1;

    // Store the initial counter
    this.sequentialCounters.set(taxonomyPath, initialCounter);
    return initialCounter;
  }
  
  // A map to store counters for different taxonomy paths
  private sequentialCounters: Map<string, number> = new Map();

  /**
   * Check if a given NNA address already exists
   * @param nnaAddress The NNA address to check
   * @returns Promise that resolves to true if the address exists, false otherwise
   */
  async checkNNAAddressExists(nnaAddress: string): Promise<boolean> {
    // In a real implementation, this would query the backend API
    // For now, we'll simulate with a simple lookup of known addresses

    // Mock set of existing NNA addresses for testing
    const existingAddresses = [
      'G.POP.TSW.001',
      'G.ROK.GUI.001',
      'S.ACT.MOV.001',
      'L.FAS.DRS.001',
      'G.001.001.001',
      'S.001.001.001',
    ];

    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 300));

    return existingAddresses.includes(nnaAddress);
  }

  /**
   * Get the full taxonomy path as a string (e.g., "Songs > Pop > Teen_Pop")
   * @param layerCode The layer code
   * @param categoryCode The category code
   * @param subcategoryCode The subcategory code
   * @returns The formatted path or empty string if layer is not provided
   */
  getTaxonomyPath(
    layerCode?: string,
    categoryCode?: string,
    subcategoryCode?: string
  ): string {
    if (!layerCode) return '';

    console.log(categoryCode, subcategoryCode);

    this.checkInitialized();

    const layer = this.getLayer(layerCode);
    if (!layer) {
      return layerCode;
    }

    let path = layer.name;

    if (categoryCode) {
      const category = this.getCategory(layerCode, categoryCode);
      if (!category) {
        return path;
      }

      path += ` > ${category.name}`;

      if (subcategoryCode) {
        const subcategory = this.getSubcategory(
          layerCode,
          categoryCode,
          subcategoryCode
        );
        if (!subcategory) {
          return path;
        }

        path += ` > ${subcategory.name}`;
      }
    }

    return path;
  }

  /**
   * Register a category code
   * @param layerCode The layer code
   * @param alphabeticCode The alphabetic code
   * @param numericCode The numeric code
   * @param name The category name
   */
  private registerCategoryCode(
    layerCode: string,
    alphabeticCode: string,
    numericCode: number,
    name: string
  ): void {
    // Implementation of registerCategoryCode method
  }
}

// Create a singleton instance
const taxonomyService = new TaxonomyService();

export default taxonomyService;

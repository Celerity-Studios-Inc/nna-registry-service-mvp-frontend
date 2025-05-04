/**
 * NNA Registry Service
 * 
 * This service manages the NNA dual addressing system, maintaining mappings between:
 * - Human-friendly names (with 3-character alphabetic codes: G.POP.BAS.001)
 * - Machine-friendly addresses (with 3-digit numeric codes: G.003.042.001)
 * 
 * The registry ensures that:
 * 1. Each 3-character code maps to a unique 3-digit code (within a layer)
 * 2. No duplicate codes are registered
 * 3. The total number of codes does not exceed 1000 per layer (000-999)
 */

import taxonomyService from './taxonomyService';

interface CodeMapping {
  alphabeticCode: string;  // 3-char code like "POP"
  numericCode: number;     // 3-digit code like 42 (stored as 042)
  name: string;            // Full name like "Pop Music"
}

interface RegistryEntry {
  humanFriendlyName: string;   // G.POP.BAS.001
  machineFriendlyAddress: string; // G.003.042.001
  categoryCode: CodeMapping;
  subcategoryCode: CodeMapping;
  sequentialNumber: number;
}

class NNARegistryService {
  // The registry maps use layerCode as keys (G, S, L, M, W, etc.)
  private categoryRegistry: Map<string, Map<string, CodeMapping>> = new Map();
  private subcategoryRegistry: Map<string, Map<string, CodeMapping>> = new Map();
  private addressRegistry: Map<string, RegistryEntry[]> = new Map();
  
  // Track used numeric codes to ensure uniqueness within a layer
  private usedCategoryCodes: Map<string, Set<number>> = new Map();
  private usedSubcategoryCodes: Map<string, Map<string, Set<number>>> = new Map();
  
  constructor() {
    this.initializeFromTaxonomy();
  }
  
  /**
   * Initialize registry data from the taxonomy service
   */
  private initializeFromTaxonomy(): void {
    const layers = taxonomyService.getLayers();
    
    for (const layer of layers) {
      const layerCode = layer.code;
      
      // Initialize registry maps for this layer
      this.categoryRegistry.set(layerCode, new Map<string, CodeMapping>());
      this.subcategoryRegistry.set(layerCode, new Map<string, CodeMapping>());
      this.addressRegistry.set(layerCode, []);
      this.usedCategoryCodes.set(layerCode, new Set<number>());
      this.usedSubcategoryCodes.set(layerCode, new Map<string, Set<number>>());
      
      // Get categories and register them
      const categories = taxonomyService.getCategories(layerCode);
      for (const category of categories) {
        // Only process if we have a proper code
        if (category.code && category.name) {
          // Get or generate a 3-character alphabetic code
          let alphabeticCode = category.code;
          if (/^\d+$/.test(alphabeticCode) || alphabeticCode.length !== 3) {
            // If the code is numeric or not exactly 3 chars, generate a new one
            alphabeticCode = this.generateAlphabeticCode(category.name, layerCode);
          }
          
          // Ensure alphabetic code is exactly 3 characters
          alphabeticCode = this.ensureThreeCharacters(alphabeticCode);
          
          // Register the category code mapping
          this.registerCategoryCode(
            layerCode,
            alphabeticCode,
            category.numericCode,
            category.name
          );
          
          // Get subcategories and register them
          const subcategories = taxonomyService.getSubcategories(layerCode, category.code);
          
          // Initialize subcategory code registry for this category
          if (!this.usedSubcategoryCodes.get(layerCode)!.has(alphabeticCode)) {
            this.usedSubcategoryCodes.get(layerCode)!.set(alphabeticCode, new Set<number>());
          }
          
          for (const subcategory of subcategories) {
            if (subcategory.code && subcategory.name) {
              // Get or generate a 3-character alphabetic code
              let subAlphabeticCode = subcategory.code;
              if (/^\d+$/.test(subAlphabeticCode) || subAlphabeticCode.length !== 3) {
                subAlphabeticCode = this.generateAlphabeticCode(
                  subcategory.name,
                  layerCode,
                  alphabeticCode
                );
              }
              
              // Ensure alphabetic code is exactly 3 characters
              subAlphabeticCode = this.ensureThreeCharacters(subAlphabeticCode);
              
              // Register the subcategory code mapping
              this.registerSubcategoryCode(
                layerCode,
                alphabeticCode,
                subAlphabeticCode,
                subcategory.numericCode,
                subcategory.name
              );
            }
          }
        }
      }
    }
    
    console.log('NNA Registry Service initialized successfully');
  }
  
  /**
   * Ensures a code is exactly 3 uppercase characters
   */
  private ensureThreeCharacters(code: string): string {
    if (!code) return 'XXX';
    
    // Convert to uppercase
    code = code.toUpperCase();
    
    // Trim to 3 chars if longer
    if (code.length > 3) {
      return code.substring(0, 3);
    }
    
    // Pad with X if shorter
    while (code.length < 3) {
      code += 'X';
    }
    
    return code;
  }
  
  /**
   * Generate a 3-character alphabetic code from a name
   * Ensures it doesn't conflict with existing codes
   */
  private generateAlphabeticCode(
    name: string,
    layerCode: string,
    categoryCode?: string
  ): string {
    if (!name) return 'XXX';
    
    // First, try to generate a meaningful code
    let baseCode = this.generateBaseAlphabeticCode(name);
    let alphabeticCode = baseCode;
    
    // Ensure no conflicts for category codes
    if (!categoryCode) {
      let attempt = 1;
      // Check if the code is already in use for this layer
      while (
        this.categoryRegistry.get(layerCode)?.has(alphabeticCode) &&
        attempt < 100 // Safety limit
      ) {
        // Try alternates with numbers
        alphabeticCode = baseCode.substring(0, 2) + attempt.toString();
        if (alphabeticCode.length > 3) {
          alphabeticCode = alphabeticCode.substring(0, 3);
        }
        attempt++;
      }
    }
    // For subcategory codes, ensure no conflicts within this category
    else {
      let attempt = 1;
      // Get registry for this layer/category combination
      const subRegistry = this.subcategoryRegistry.get(layerCode);
      if (subRegistry) {
        // Check if the code is already in use for this category
        const valueArray = Array.from(subRegistry.values());
        while (
          valueArray.some(mapping => {
            // Avoid capturing the loop variable in the function
            const currentAlphaCode = alphabeticCode;
            return mapping.alphabeticCode === currentAlphaCode && 
              categoryCode === this.getCategoryForSubcategory(layerCode, mapping.alphabeticCode);
          }) &&
          attempt < 100 // Safety limit
        ) {
          // Try alternates with numbers
          alphabeticCode = baseCode.substring(0, 2) + attempt.toString();
          if (alphabeticCode.length > 3) {
            alphabeticCode = alphabeticCode.substring(0, 3);
          }
          attempt++;
        }
      }
    }
    
    return this.ensureThreeCharacters(alphabeticCode);
  }
  
  /**
   * Get the category code for a subcategory
   * Helper for conflict resolution
   */
  private getCategoryForSubcategory(layerCode: string, subcategoryCode: string): string | null {
    const entries = this.addressRegistry.get(layerCode) || [];
    for (const entry of entries) {
      if (entry.subcategoryCode.alphabeticCode === subcategoryCode) {
        return entry.categoryCode.alphabeticCode;
      }
    }
    return null;
  }
  
  /**
   * Generate a base 3-character code from a name using various strategies
   */
  private generateBaseAlphabeticCode(name: string): string {
    // Strip non-alphabetic characters and convert to uppercase
    const cleanName = name.replace(/[^A-Za-z ]/g, '').toUpperCase();
    
    // Strategy 1: For single words, use first 3 letters
    if (!/\s/.test(cleanName) && cleanName.length >= 3) {
      return cleanName.substring(0, 3);
    }
    
    // Strategy 2: For multi-word names, use first letter of each word
    const words = cleanName.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 3) {
      return `${words[0][0]}${words[1][0]}${words[2][0]}`;
    }
    
    if (words.length === 2) {
      // If second word has at least 2 chars, use first letter of first word + first 2 of second
      if (words[1].length >= 2) {
        return `${words[0][0]}${words[1][0]}${words[1][1]}`;
      }
      // Otherwise use first 2 of first word + first of second
      return `${words[0][0]}${words[0][1]}${words[1][0]}`;
    }
    
    // Strategy 3: For a single word, if it's longer than 3 chars,
    // use first, middle and last letters
    if (words.length === 1 && words[0].length > 3) {
      const word = words[0];
      const middle = Math.floor(word.length / 2);
      return `${word[0]}${word[middle]}${word[word.length - 1]}`;
    }
    
    // Fallback: Just use what we have and pad with X
    const available = cleanName.replace(/\s+/g, '');
    return (available + 'XXX').substring(0, 3);
  }
  
  /**
   * Register a category code mapping
   * Ensures uniqueness of both alphabetic and numeric codes
   */
  private registerCategoryCode(
    layerCode: string,
    alphabeticCode: string,
    numericCode: number,
    name: string
  ): void {
    // Get registry for this layer
    const registry = this.categoryRegistry.get(layerCode);
    const usedCodes = this.usedCategoryCodes.get(layerCode);
    
    if (!registry || !usedCodes) {
      console.error(`No registry initialized for layer ${layerCode}`);
      return;
    }
    
    // Validate max codes limit (000-999)
    if (usedCodes.size >= 1000) {
      console.error(`Layer ${layerCode} has reached the maximum of 1000 category codes`);
      return;
    }
    
    // Ensure numeric code is within valid range (0-999)
    numericCode = Math.max(0, Math.min(999, numericCode));
    
    // Check if the alphabetic code is already registered
    if (registry.has(alphabeticCode)) {
      console.warn(`Alphabetic code ${alphabeticCode} already registered for layer ${layerCode}`);
      return;
    }
    
    // Check if the numeric code is already in use
    if (usedCodes.has(numericCode)) {
      // Find the next available numeric code
      let newNumericCode = numericCode;
      while (usedCodes.has(newNumericCode) && newNumericCode < 1000) {
        newNumericCode++;
      }
      
      if (newNumericCode >= 1000) {
        // Try from the beginning
        newNumericCode = 0;
        while (usedCodes.has(newNumericCode) && newNumericCode < numericCode) {
          newNumericCode++;
        }
        
        if (newNumericCode >= numericCode) {
          console.error(`No available numeric codes for layer ${layerCode}`);
          return;
        }
      }
      
      console.warn(`Numeric code ${numericCode} already in use for layer ${layerCode}, using ${newNumericCode} instead`);
      numericCode = newNumericCode;
    }
    
    // Add to registry
    const mapping: CodeMapping = {
      alphabeticCode,
      numericCode,
      name
    };
    
    registry.set(alphabeticCode, mapping);
    usedCodes.add(numericCode);
  }
  
  /**
   * Register a subcategory code mapping
   * Ensures uniqueness of both alphabetic and numeric codes within its category
   */
  private registerSubcategoryCode(
    layerCode: string,
    categoryCode: string,
    alphabeticCode: string,
    numericCode: number,
    name: string
  ): void {
    // Get registry for this layer
    const registry = this.subcategoryRegistry.get(layerCode);
    const usedCodesMap = this.usedSubcategoryCodes.get(layerCode);
    
    if (!registry || !usedCodesMap) {
      console.error(`No registry initialized for layer ${layerCode}`);
      return;
    }
    
    // Get used codes for this category
    let usedCodes = usedCodesMap.get(categoryCode);
    if (!usedCodes) {
      usedCodes = new Set<number>();
      usedCodesMap.set(categoryCode, usedCodes);
    }
    
    // Validate max codes limit (000-999)
    if (usedCodes.size >= 1000) {
      console.error(`Category ${categoryCode} in layer ${layerCode} has reached the maximum of 1000 subcategory codes`);
      return;
    }
    
    // Ensure numeric code is within valid range (0-999)
    numericCode = Math.max(0, Math.min(999, numericCode));
    
    // Generate a unique key for this subcategory
    const key = `${categoryCode}.${alphabeticCode}`;
    
    // Check if the alphabetic code is already registered
    if (registry.has(key)) {
      console.warn(`Subcategory code ${key} already registered for layer ${layerCode}`);
      return;
    }
    
    // Check if the numeric code is already in use for this category
    if (usedCodes.has(numericCode)) {
      // Find the next available numeric code
      let newNumericCode = numericCode;
      while (usedCodes.has(newNumericCode) && newNumericCode < 1000) {
        newNumericCode++;
      }
      
      if (newNumericCode >= 1000) {
        // Try from the beginning
        newNumericCode = 0;
        while (usedCodes.has(newNumericCode) && newNumericCode < numericCode) {
          newNumericCode++;
        }
        
        if (newNumericCode >= numericCode) {
          console.error(`No available numeric codes for category ${categoryCode} in layer ${layerCode}`);
          return;
        }
      }
      
      console.warn(`Numeric code ${numericCode} already in use for category ${categoryCode} in layer ${layerCode}, using ${newNumericCode} instead`);
      numericCode = newNumericCode;
    }
    
    // Add to registry
    const mapping: CodeMapping = {
      alphabeticCode,
      numericCode,
      name
    };
    
    registry.set(key, mapping);
    usedCodes.add(numericCode);
  }
  
  /**
   * Register an NNA address in the registry
   */
  private registerAddress(
    layerCode: string,
    categoryMapping: CodeMapping,
    subcategoryMapping: CodeMapping,
    sequentialNumber: number
  ): RegistryEntry {
    // Format the addresses
    const humanFriendlyName = `${layerCode}.${categoryMapping.alphabeticCode}.${subcategoryMapping.alphabeticCode}.${sequentialNumber.toString().padStart(3, '0')}`;
    const machineFriendlyAddress = `${layerCode}.${categoryMapping.numericCode.toString().padStart(3, '0')}.${subcategoryMapping.numericCode.toString().padStart(3, '0')}.${sequentialNumber.toString().padStart(3, '0')}`;
    
    // Create registry entry
    const entry: RegistryEntry = {
      humanFriendlyName,
      machineFriendlyAddress,
      categoryCode: categoryMapping,
      subcategoryCode: subcategoryMapping,
      sequentialNumber
    };
    
    // Add to registry
    const registry = this.addressRegistry.get(layerCode);
    if (registry) {
      registry.push(entry);
    } else {
      this.addressRegistry.set(layerCode, [entry]);
    }
    
    return entry;
  }
  
  /**
   * Generate a human-friendly NNA name from components
   */
  generateHumanFriendlyName(
    layerCode: string,
    categoryName: string,
    subcategoryName: string,
    sequentialNumber: number = 1
  ): string {
    if (!layerCode || !categoryName || !subcategoryName) {
      return '';
    }
    
    // Generate alphabetic codes or get existing ones
    let categoryCode = this.getAlphabeticCodeByName(layerCode, categoryName);
    if (!categoryCode) {
      categoryCode = this.generateAlphabeticCode(categoryName, layerCode);
      
      // Register the new category mapping
      const categoryNumericCode = this.getNextAvailableNumericCode(layerCode);
      this.registerCategoryCode(layerCode, categoryCode, categoryNumericCode, categoryName);
    }
    
    let subcategoryCode = this.getSubcategoryAlphabeticCodeByName(layerCode, categoryCode, subcategoryName);
    if (!subcategoryCode) {
      subcategoryCode = this.generateAlphabeticCode(subcategoryName, layerCode, categoryCode);
      
      // Register the new subcategory mapping
      const subcategoryNumericCode = this.getNextAvailableSubcategoryNumericCode(layerCode, categoryCode);
      this.registerSubcategoryCode(layerCode, categoryCode, subcategoryCode, subcategoryNumericCode, subcategoryName);
    }
    
    // Format as human-friendly name: Layer.CategoryCode.SubcategoryCode.SequentialNumber
    // Ensure sequential number is padded to 3 digits
    const sequentialStr = sequentialNumber.toString().padStart(3, '0');
    
    return `${layerCode}.${categoryCode}.${subcategoryCode}.${sequentialStr}`;
  }
  
  /**
   * Generate a machine-friendly NNA address from components
   */
  generateMachineFriendlyAddress(
    layerCode: string,
    categoryName: string,
    subcategoryName: string,
    sequentialNumber: number = 1
  ): string {
    if (!layerCode || !categoryName || !subcategoryName) {
      return '';
    }
    
    // Find or create category code mappings
    let categoryCode = this.getAlphabeticCodeByName(layerCode, categoryName);
    let categoryNumericCode: number;
    
    if (!categoryCode) {
      categoryCode = this.generateAlphabeticCode(categoryName, layerCode);
      categoryNumericCode = this.getNextAvailableNumericCode(layerCode);
      this.registerCategoryCode(layerCode, categoryCode, categoryNumericCode, categoryName);
    } else {
      categoryNumericCode = this.getNumericCodeByAlphabetic(layerCode, categoryCode);
    }
    
    // Find or create subcategory code mappings
    let subcategoryCode = this.getSubcategoryAlphabeticCodeByName(layerCode, categoryCode, subcategoryName);
    let subcategoryNumericCode: number;
    
    if (!subcategoryCode) {
      subcategoryCode = this.generateAlphabeticCode(subcategoryName, layerCode, categoryCode);
      subcategoryNumericCode = this.getNextAvailableSubcategoryNumericCode(layerCode, categoryCode);
      this.registerSubcategoryCode(layerCode, categoryCode, subcategoryCode, subcategoryNumericCode, subcategoryName);
    } else {
      subcategoryNumericCode = this.getSubcategoryNumericCodeByAlphabetic(layerCode, categoryCode, subcategoryCode);
    }
    
    // Format as machine-friendly address: Layer.CategoryNum.SubcategoryNum.SequentialNumber
    // Ensure codes are padded to 3 digits
    const categoryStr = categoryNumericCode.toString().padStart(3, '0');
    const subcategoryStr = subcategoryNumericCode.toString().padStart(3, '0');
    const sequentialStr = sequentialNumber.toString().padStart(3, '0');
    
    return `${layerCode}.${categoryStr}.${subcategoryStr}.${sequentialStr}`;
  }
  
  /**
   * Get the next available numeric code for a layer
   */
  private getNextAvailableNumericCode(layerCode: string): number {
    const usedCodes = this.usedCategoryCodes.get(layerCode);
    if (!usedCodes) return 1;
    
    // Start from 1 and find first unused code
    for (let i = 1; i < 1000; i++) {
      if (!usedCodes.has(i)) {
        return i;
      }
    }
    
    throw new Error(`No available numeric codes for layer ${layerCode}`);
  }
  
  /**
   * Get the next available numeric code for a subcategory
   */
  private getNextAvailableSubcategoryNumericCode(layerCode: string, categoryCode: string): number {
    const usedCodes = this.usedSubcategoryCodes.get(layerCode)?.get(categoryCode);
    if (!usedCodes) return 1;
    
    // Start from 1 and find first unused code
    for (let i = 1; i < 1000; i++) {
      if (!usedCodes.has(i)) {
        return i;
      }
    }
    
    throw new Error(`No available numeric codes for category ${categoryCode} in layer ${layerCode}`);
  }
  
  /**
   * Get an alphabetic code by name in a layer
   */
  private getAlphabeticCodeByName(layerCode: string, name: string): string | null {
    const registry = this.categoryRegistry.get(layerCode);
    if (!registry) return null;
    
    // Convert to array to avoid TypeScript downlevelIteration error
    const entries = Array.from(registry.entries());
    for (const [code, mapping] of entries) {
      if (mapping.name.toLowerCase() === name.toLowerCase()) {
        return code;
      }
    }
    
    return null;
  }
  
  /**
   * Get a subcategory alphabetic code by name
   */
  private getSubcategoryAlphabeticCodeByName(
    layerCode: string, 
    categoryCode: string, 
    name: string
  ): string | null {
    const registry = this.subcategoryRegistry.get(layerCode);
    if (!registry) return null;
    
    // Convert to array to avoid TypeScript downlevelIteration error
    const entries = Array.from(registry.entries());
    for (const [key, mapping] of entries) {
      const [catCode, subCode] = key.split('.');
      if (catCode === categoryCode && mapping.name.toLowerCase() === name.toLowerCase()) {
        return subCode;
      }
    }
    
    return null;
  }
  
  /**
   * Get a numeric code by alphabetic code
   */
  private getNumericCodeByAlphabetic(layerCode: string, alphabeticCode: string): number {
    const registry = this.categoryRegistry.get(layerCode);
    if (!registry) return -1;
    
    const mapping = registry.get(alphabeticCode);
    return mapping ? mapping.numericCode : -1;
  }
  
  /**
   * Get a subcategory numeric code by alphabetic code
   */
  private getSubcategoryNumericCodeByAlphabetic(
    layerCode: string,
    categoryCode: string,
    alphabeticCode: string
  ): number {
    const registry = this.subcategoryRegistry.get(layerCode);
    if (!registry) return -1;
    
    const key = `${categoryCode}.${alphabeticCode}`;
    const mapping = registry.get(key);
    return mapping ? mapping.numericCode : -1;
  }
  
  /**
   * Convert a human-friendly name to a machine-friendly address
   */
  convertToMachineFriendly(humanFriendlyName: string): string {
    if (!humanFriendlyName) return '';
    
    // Parse the human-friendly name: Layer.CategoryCode.SubcategoryCode.Sequential
    const parts = humanFriendlyName.split('.');
    if (parts.length !== 4) {
      console.error('Invalid human-friendly name format:', humanFriendlyName);
      return '';
    }
    
    const [layerCode, categoryCode, subcategoryCode, sequentialStr] = parts;
    
    // Get numeric codes from the registry
    const categoryNumericCode = this.getNumericCodeByAlphabetic(layerCode, categoryCode);
    const subcategoryNumericCode = this.getSubcategoryNumericCodeByAlphabetic(
      layerCode, 
      categoryCode, 
      subcategoryCode
    );
    
    if (categoryNumericCode === -1 || subcategoryNumericCode === -1) {
      console.error('Failed to find numeric codes for:', humanFriendlyName);
      return '';
    }
    
    // Format as machine-friendly address
    const categoryStr = categoryNumericCode.toString().padStart(3, '0');
    const subcategoryStr = subcategoryNumericCode.toString().padStart(3, '0');
    
    return `${layerCode}.${categoryStr}.${subcategoryStr}.${sequentialStr}`;
  }
  
  /**
   * Convert a machine-friendly address to a human-friendly name
   */
  convertToHumanFriendly(machineFriendlyAddress: string): string {
    if (!machineFriendlyAddress) return '';
    
    // Parse the machine-friendly address: Layer.CategoryNum.SubcategoryNum.Sequential
    const parts = machineFriendlyAddress.split('.');
    if (parts.length !== 4) {
      console.error('Invalid machine-friendly address format:', machineFriendlyAddress);
      return '';
    }
    
    const [layerCode, categoryNumStr, subcategoryNumStr, sequentialStr] = parts;
    const categoryNumericCode = parseInt(categoryNumStr, 10);
    const subcategoryNumericCode = parseInt(subcategoryNumStr, 10);
    
    // Find alphabetic codes from the numeric codes
    let categoryCode: string | null = null;
    const categoryRegistry = this.categoryRegistry.get(layerCode);
    if (categoryRegistry) {
      // Convert to array to avoid TypeScript downlevelIteration error
      const entries = Array.from(categoryRegistry.entries());
      for (const [code, mapping] of entries) {
        if (mapping.numericCode === categoryNumericCode) {
          categoryCode = code;
          break;
        }
      }
    }
    
    if (!categoryCode) {
      console.error('Failed to find category code for:', machineFriendlyAddress);
      return '';
    }
    
    let subcategoryCode: string | null = null;
    const subcategoryRegistry = this.subcategoryRegistry.get(layerCode);
    if (subcategoryRegistry) {
      // Convert to array to avoid TypeScript downlevelIteration error
      const entries = Array.from(subcategoryRegistry.entries());
      for (const [key, mapping] of entries) {
        const [catCode, subCode] = key.split('.');
        if (catCode === categoryCode && mapping.numericCode === subcategoryNumericCode) {
          subcategoryCode = subCode;
          break;
        }
      }
    }
    
    if (!subcategoryCode) {
      console.error('Failed to find subcategory code for:', machineFriendlyAddress);
      return '';
    }
    
    // Format as human-friendly name
    return `${layerCode}.${categoryCode}.${subcategoryCode}.${sequentialStr}`;
  }
  
  /**
   * Get the registered human-friendly name for a specific asset path
   */
  getHumanFriendlyName(
    layerCode: string,
    categoryName: string,
    subcategoryName: string,
    sequentialNumber: number = 1
  ): string {
    // First try to find an existing registration
    const registry = this.addressRegistry.get(layerCode);
    if (registry) {
      for (const entry of registry) {
        if (
          entry.categoryCode.name.toLowerCase() === categoryName.toLowerCase() &&
          entry.subcategoryCode.name.toLowerCase() === subcategoryName.toLowerCase() &&
          entry.sequentialNumber === sequentialNumber
        ) {
          return entry.humanFriendlyName;
        }
      }
    }
    
    // If not found, generate a new one
    return this.generateHumanFriendlyName(
      layerCode,
      categoryName,
      subcategoryName,
      sequentialNumber
    );
  }
  
  /**
   * Get the registered machine-friendly address for a specific asset path
   */
  getMachineFriendlyAddress(
    layerCode: string,
    categoryName: string,
    subcategoryName: string,
    sequentialNumber: number = 1
  ): string {
    // First try to find an existing registration
    const registry = this.addressRegistry.get(layerCode);
    if (registry) {
      for (const entry of registry) {
        if (
          entry.categoryCode.name.toLowerCase() === categoryName.toLowerCase() &&
          entry.subcategoryCode.name.toLowerCase() === subcategoryName.toLowerCase() &&
          entry.sequentialNumber === sequentialNumber
        ) {
          return entry.machineFriendlyAddress;
        }
      }
    }
    
    // If not found, generate a new one
    return this.generateMachineFriendlyAddress(
      layerCode,
      categoryName,
      subcategoryName,
      sequentialNumber
    );
  }
  
  /**
   * Get the total number of registered codes for a layer
   */
  getRegisteredCodeCount(layerCode: string): {
    categories: number;
    subcategories: number;
    addresses: number;
  } {
    const categoryCount = this.categoryRegistry.get(layerCode)?.size || 0;
    const subcategoryCount = this.subcategoryRegistry.get(layerCode)?.size || 0;
    const addressCount = this.addressRegistry.get(layerCode)?.length || 0;
    
    return {
      categories: categoryCount,
      subcategories: subcategoryCount,
      addresses: addressCount
    };
  }
  
  /**
   * Validate if a layer has available numeric codes
   */
  hasAvailableNumericCodes(layerCode: string): boolean {
    const usedCodes = this.usedCategoryCodes.get(layerCode);
    if (!usedCodes) return true;
    
    return usedCodes.size < 1000;
  }
  
  /**
   * Get all registered code mappings for a layer
   * For debugging and inspection
   */
  getLayerRegistry(layerCode: string): {
    categories: Map<string, CodeMapping>;
    totalUsedCodes: number;
  } {
    const categories = this.categoryRegistry.get(layerCode) || new Map();
    const usedCodes = this.usedCategoryCodes.get(layerCode)?.size || 0;
    
    return {
      categories,
      totalUsedCodes: usedCodes
    };
  }
}

// Create a singleton instance
const nnaRegistryService = new NNARegistryService();

export default nnaRegistryService;
# NNA Dual Addressing System - Complete Implementation Specification
## Part 2 of 4: Code Implementation & Mapping Systems

---

## 7. Code Mapping Implementation

### 7.1 Core Category Mappings

```typescript
// Bidirectional category mappings for all 15 layers
export const categoryAlphaToNumeric: Record<string, string> = {
  // MVP Layer Categories
  
  // Music Genres (G Layer)
  'POP': '001',    // Pop music
  'ROK': '002',    // Rock music
  'HIP': '003',    // Hip-Hop/Rap
  'ELE': '004',    // Electronic/EDM
  'COU': '005',    // Country
  'JAZ': '006',    // Jazz
  'CLA': '007',    // Classical
  'REG': '008',    // Reggae
  'BLU': '009',    // Blues
  'FOL': '010',    // Folk
  
  // Star Categories (S Layer)
  'POP': '001',    // Pop stars
  'ACT': '002',    // Actors/Actresses
  'COM': '003',    // Comedians
  'INF': '004',    // Influencers
  'ATH': '005',    // Athletes
  'DAN': '006',    // Dancers
  'MOD': '007',    // Models
  
  // Look Categories (L Layer)
  'CAS': '001',    // Casual
  'FOR': '002',    // Formal
  'STR': '003',    // Street
  'VIN': '004',    // Vintage
  'BOH': '005',    // Bohemian
  'MIN': '006',    // Minimalist
  'GOT': '007',    // Gothic
  
  // Moves Categories (M Layer)
  'DAN': '001',    // Dance
  'GYM': '002',    // Gymnastics
  'MAR': '003',    // Martial Arts
  'SPO': '004',    // Sports
  'STU': '005',    // Stunts
  'EXP': '006',    // Expressive
  
  // World Categories (W Layer)
  'NAT': '001',    // Nature
  'URB': '002',    // Urban
  'HIP': '003',    // Hip-Hop/Street
  'FAN': '004',    // Fantasy
  'SCI': '005',    // Sci-Fi
  'HIS': '006',    // Historical
  'ABS': '007',    // Abstract
  
  // Branded Categories (B Layer) - MVP
  'LUX': '001',    // Luxury brands
  'SPT': '002',    // Sports brands
  'TEC': '003',    // Technology brands
  'FAS': '004',    // Fashion brands
  'FOD': '005',    // Food & beverage
  'AUT': '006',    // Automotive
  'ENT': '007',    // Entertainment
  
  // Personalize Categories (P Layer) - MVP
  'FAC': '001',    // Face customization
  'VOI': '002',    // Voice customization
  'DRS': '003',    // Dress/clothing
  'DAN': '004',    // Dance moves
  'STG': '005',    // Stage/background
  'ACC': '006',    // Accessories
  'EMO': '007',    // Emotional expressions
  
  // Training Data Categories (T Layer) - MVP
  'PRO': '001',    // Prompts
  'IMG': '002',    // Images
  'VID': '003',    // Videos
  'AUD': '004',    // Audio
  'SET': '005',    // Dataset collections
  'MOD': '006',    // Model data
  'ANN': '007',    // Annotations
  
  // Composite Categories (C Layer) - MVP
  'MUS': '001',    // Music videos
  'PER': '002',    // Performances
  'AD_': '003',    // Advertisements
  'EDU': '004',    // Educational content
  'SOC': '005',    // Social media content
  'LIV': '006',    // Live streams
  'SHO': '007',    // Short form content
  
  // Rights Categories (R Layer) - MVP
  'LIC': '001',    // Licensing
  'ROY': '002',    // Royalties
  'USG': '003',    // Usage rights
  'TER': '004',    // Territory rights
  'DER': '005',    // Derivative rights
  'COM': '006',    // Commercial rights
  'PER': '007',    // Personal rights
  
  // Future Layer Categories (not in MVP)
  
  // Audio Effects (E Layer) - Future
  'REV': '001',    // Reverb effects
  'ECH': '002',    // Echo effects
  'MOD': '003',    // Modulation effects
  'FIL': '004',    // Filter effects
  'DIS': '005',    // Distortion effects
  'PIT': '006',    // Pitch effects
  'TIM': '007',    // Time effects
  
  // Transitions (N Layer) - Future
  'CUT': '001',    // Cut transitions
  'FAD': '002',    // Fade transitions
  'WIP': '003',    // Wipe transitions
  'DIS': '004',    // Dissolve transitions
  'MOV': '005',    // Movement transitions
  'ROT': '006',    // Rotation transitions
  'SCA': '007',    // Scale transitions
  
  // Augmented Reality (A Layer) - Future
  'FAC': '001',    // Face filters
  'STI': '002',    // Stickers
  'EFF': '003',    // Effects
  'OBJ': '004',    // 3D objects
  'ENV': '005',    // Environment overlays
  'INT': '006',    // Interactive elements
  'TRA': '007',    // Tracking elements
  
  // Filters (F Layer) - Future
  'COL': '001',    // Color grading
  'CIN': '002',    // Cinematic filters
  'VIN': '003',    // Vintage filters
  'BLU': '004',    // Blur effects
  'SHA': '005',    // Sharpening
  'CON': '006',    // Contrast adjustments
  'SAT': '007',    // Saturation effects
  
  // Text (X Layer) - Future
  'LYR': '001',    // Lyrics
  'CAP': '002',    // Captions
  'WAT': '003',    // Watermarks
  'TIT': '004',    // Titles
  'CRE': '005',    // Credits
  'SUB': '006',    // Subtitles
  'ANI': '007',    // Animated text
};

// Reverse mapping for numeric to alphabetic
export const categoryNumericToAlpha: Record<string, string> = Object.fromEntries(
  Object.entries(categoryAlphaToNumeric).map(([alpha, numeric]) => [numeric, alpha])
);
```

### 7.2 Layer Numeric Mappings

```typescript
// Layer numeric mappings for MFA conversion (15 layers total)
export const layerToNumeric: Record<string, string> = {
  // MVP Layers (10)
  'G': '1',  // Song
  'S': '2',  // Star  
  'L': '3',  // Look
  'M': '4',  // Moves
  'W': '5',  // World
  'B': '6',  // Branded
  'P': '7',  // Personalize
  'T': '8',  // Training_Data
  'C': '9',  // Composites
  'R': '10', // Rights
  
  // Future Layers (5)
  'E': '11', // Audio Effects
  'N': '12', // Transitions
  'A': '13', // Augmented Reality
  'F': '14', // Filters
  'X': '15'  // Text
};

export const numericToLayer: Record<string, string> = Object.fromEntries(
  Object.entries(layerToNumeric).map(([layer, numeric]) => [numeric, layer])
);
```

### 7.3 Layer-Specific Subcategory Mappings

```typescript
// Complex subcategory mappings with layer and category context
export const layerSpecificSubcategoryMappings: Record<string, Record<string, Record<string, string>>> = {
  // MVP Layer Subcategories
  
  'S': { // Stars Layer
    'POP': { // Pop Category
      'TSW': '042',  // Taylor Swift
      'HPM': '007',  // Hipster Male
      'HPF': '008',  // Hipster Female
      'EDM': '009',  // EDM Artist
      'RAP': '010',  // Rap Artist
      'IND': '011',  // Indie Artist
    },
    'ACT': { // Actors Category
      'LEA': '001',  // Leading Actor
      'SUP': '002',  // Supporting Actor
      'COM': '003',  // Comedy Actor
      'ACT': '004',  // Action Actor
      'DRA': '005',  // Drama Actor
    }
  },
  
  'W': { // Worlds Layer
    'NAT': { // Nature Category
      'BAS': '001',  // Basic Nature
      'FOR': '002',  // Forest
      'OCE': '003',  // Ocean
      'MOU': '004',  // Mountain
      'DES': '005',  // Desert
      'JUN': '006',  // Jungle
    },
    'HIP': { // Hip-Hop Category
      'BAS': '001',  // Basic Hip-Hop
      'STU': '002',  // Studio
      'STR': '003',  // Street
      'CLU': '004',  // Club
      'GRA': '005',  // Graffiti Wall
      'URB': '006',  // Urban Rooftop
    }
  },
  
  'B': { // Branded Layer (MVP)
    'LUX': { // Luxury Category
      'GUC': '001',  // Gucci
      'LVU': '002',  // Louis Vuitton
      'CHA': '003',  // Chanel
      'PRA': '004',  // Prada
      'HER': '005',  // Hermès
    },
    'SPT': { // Sports Category
      'NIK': '001',  // Nike
      'ADI': '002',  // Adidas
      'PUM': '003',  // Puma
      'UAR': '004',  // Under Armour
      'REE': '005',  // Reebok
    }
  },
  
  'P': { // Personalize Layer (MVP)
    'FAC': { // Face Category
      'SWP': '001',  // Face swap
      'EXP': '002',  // Expression change
      'AGE': '003',  // Age modification
      'STY': '004',  // Style transfer
    },
    'VOI': { // Voice Category
      'CHG': '001',  // Voice change
      'ACC': '002',  // Accent modification
      'TON': '003',  // Tone adjustment
      'SYN': '004',  // Voice synthesis
    }
  },
  
  // Future layer subcategories (examples)
  'E': { // Audio Effects Layer - Future
    'REV': { // Reverb Category
      'HAL': '001',  // Hall reverb
      'ROO': '002',  // Room reverb
      'SPA': '003',  // Space reverb
      'PLA': '004',  // Plate reverb
    }
  },
  
  'X': { // Text Layer - Future
    'LYR': { // Lyrics Category
      'POP': '001',  // Pop lyrics
      'RAP': '002',  // Rap lyrics
      'ROC': '003',  // Rock lyrics
      'COU': '004',  // Country lyrics
    }
  }
};
```

## 8. Address Conversion Functions

### 8.1 Format Detection

```typescript
export function isNNAAddress(assetId: string): boolean {
  const parts = assetId.split('.');
  if (parts.length !== 4) return false;
  
  const [layer, category, subcategory, sequential] = parts;
  
  // Check layer is valid (supports all 15 layers)
  if (layer.length !== 1 || !/^[GSLMWBPTCRENAIFX]$/.test(layer)) return false;
  
  // Check if category and subcategory are 3-digit numbers
  try {
    const categoryNum = parseInt(category);
    const subcategoryNum = parseInt(subcategory);
    const sequentialNum = parseInt(sequential);
    
    return (
      category.length === 3 &&
      subcategory.length === 3 &&
      sequential.length === 3 &&
      categoryNum >= 1 && categoryNum <= 999 &&
      subcategoryNum >= 1 && subcategoryNum <= 999 &&
      sequentialNum >= 1 && sequentialNum <= 999
    );
  } catch {
    return false;
  }
}

export function isHumanFriendlyName(assetId: string): boolean {
  const parts = assetId.split('.');
  if (parts.length !== 4) return false;
  
  const [layer, category, subcategory, sequential] = parts;
  
  // Check layer is valid (supports all 15 layers)
  if (layer.length !== 1 || !/^[GSLMWBPTCRENAIFX]$/.test(layer)) return false;
  
  // Check category and subcategory are 3-letter alphabetic codes
  const isAlphabetic = (code: string) => 
    code.length === 3 && /^[A-Z]{3}$/.test(code);
  
  // Check sequential is 3-digit number
  const isSequential = (seq: string) =>
    seq.length === 3 && /^[0-9]{3}$/.test(seq) && 
    parseInt(seq) >= 1 && parseInt(seq) <= 999;
  
  return isAlphabetic(category) && isAlphabetic(subcategory) && isSequential(sequential);
}
```

### 8.2 Core Conversion Functions

```typescript
export function convertHFNToMFA(hfn: string): string {
  if (!isHumanFriendlyName(hfn)) {
    throw new Error(`Invalid Human-Friendly Name format: ${hfn}`);
  }
  
  const [layer, categoryAlpha, subcategoryAlpha, sequential] = hfn.split('.');
  
  // Check for special cases first
  const specialCaseKey = `${layer}.${categoryAlpha}.${subcategoryAlpha}`;
  if (specialCaseMappings[specialCaseKey]) {
    return `${specialCaseMappings[specialCaseKey].mfa}.${sequential}`;
  }
  
  // Convert layer to numeric
  const layerNumeric = layerToNumeric[layer];
  if (!layerNumeric) {
    throw new Error(`Unknown layer: ${layer}`);
  }
  
  // Convert category to numeric
  const categoryNumeric = categoryAlphaToNumeric[categoryAlpha];
  if (!categoryNumeric) {
    throw new Error(`Unknown category: ${categoryAlpha} for layer: ${layer}`);
  }
  
  // Convert subcategory to numeric with layer/category context
  let subcategoryNumeric: string;
  
  if (layerSpecificSubcategoryMappings[layer]?.[categoryAlpha]?.[subcategoryAlpha]) {
    subcategoryNumeric = layerSpecificSubcategoryMappings[layer][categoryAlpha][subcategoryAlpha];
  } else {
    // Fallback to generic subcategory mapping if exists
    subcategoryNumeric = categoryAlphaToNumeric[subcategoryAlpha];
  }
  
  if (!subcategoryNumeric) {
    throw new Error(`Unknown subcategory: ${subcategoryAlpha} for ${layer}.${categoryAlpha}`);
  }
  
  // Format as 3-digit numbers
  const formattedCategory = categoryNumeric.padStart(3, '0');
  const formattedSubcategory = subcategoryNumeric.padStart(3, '0');
  
  return `${layerNumeric}.${formattedCategory}.${formattedSubcategory}.${sequential}`;
}

export function convertMFAToHFN(mfa: string): string {
  if (!isNNAAddress(mfa)) {
    throw new Error(`Invalid Machine-Friendly Address format: ${mfa}`);
  }
  
  const [layerNumeric, categoryNumeric, subcategoryNumeric, sequential] = mfa.split('.');
  
  // Convert layer from numeric
  const layer = numericToLayer[layerNumeric];
  if (!layer) {
    throw new Error(`Unknown layer numeric: ${layerNumeric}`);
  }
  
  // Convert category from numeric
  const categoryAlpha = categoryNumericToAlpha[categoryNumeric];
  if (!categoryAlpha) {
    throw new Error(`Unknown category numeric: ${categoryNumeric}`);
  }
  
  // Convert subcategory from numeric with context
  let subcategoryAlpha: string | undefined;
  
  // Check layer-specific mappings first
  if (layerSpecificSubcategoryMappings[layer]?.[categoryAlpha]) {
    const subcategoryMap = layerSpecificSubcategoryMappings[layer][categoryAlpha];
    subcategoryAlpha = Object.entries(subcategoryMap)
      .find(([_, num]) => num === subcategoryNumeric)?.[0];
  }
  
  // Fallback to generic mapping
  if (!subcategoryAlpha) {
    subcategoryAlpha = categoryNumericToAlpha[subcategoryNumeric];
  }
  
  if (!subcategoryAlpha) {
    throw new Error(`Unknown subcategory numeric: ${subcategoryNumeric} for ${layer}.${categoryAlpha}`);
  }
  
  return `${layer}.${categoryAlpha}.${subcategoryAlpha}.${sequential}`;
}
```

---

**Continue to Part 3 of 4**: Registry Service & Database Implementation
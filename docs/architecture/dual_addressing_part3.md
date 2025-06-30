# NNA Dual Addressing System - Complete Implementation Specification
## Part 3 of 4: Registry Service & Database Implementation

---

## 9. Registry Service Implementation

### 9.1 Database Schema

```sql
-- Main registry table for all 15 layers
CREATE TABLE nna_registry (
    id SERIAL PRIMARY KEY,
    layer CHAR(1) NOT NULL CHECK (layer IN ('G','S','L','M','W','B','P','T','C','R','E','N','A','F','X')),
    category_alpha CHAR(3) NOT NULL,
    subcategory_alpha CHAR(3) NOT NULL,
    category_numeric SMALLINT NOT NULL,
    subcategory_numeric SMALLINT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    layer_status VARCHAR(20) NOT NULL DEFAULT 'mvp' CHECK (layer_status IN ('mvp', 'future')),
    metadata JSONB,
    
    -- Unique constraints
    UNIQUE(layer, category_alpha, subcategory_alpha),
    UNIQUE(layer, category_numeric, subcategory_numeric),
    
    -- Check constraints
    CONSTRAINT valid_category_alpha CHECK (category_alpha ~ '^[A-Z]{3}$'),
    CONSTRAINT valid_subcategory_alpha CHECK (subcategory_alpha ~ '^[A-Z]{3}$'),
    CONSTRAINT valid_category_numeric CHECK (category_numeric BETWEEN 1 AND 999),
    CONSTRAINT valid_subcategory_numeric CHECK (subcategory_numeric BETWEEN 1 AND 999)
);

-- Indexes for efficient lookups
CREATE INDEX idx_hfn_lookup ON nna_registry(layer, category_alpha, subcategory_alpha);
CREATE INDEX idx_mfa_lookup ON nna_registry(layer, category_numeric, subcategory_numeric);
CREATE INDEX idx_layer_category ON nna_registry(layer, category_alpha);
CREATE INDEX idx_layer_status ON nna_registry(layer_status);
CREATE INDEX idx_status ON nna_registry(status);

-- Asset registry table for tracking individual assets
CREATE TABLE asset_registry (
    id SERIAL PRIMARY KEY,
    nna_address VARCHAR(50) NOT NULL UNIQUE,
    human_friendly_name VARCHAR(50) NOT NULL UNIQUE,
    asset_type VARCHAR(50) NOT NULL,
    layer_status VARCHAR(20) NOT NULL DEFAULT 'mvp',
    file_path TEXT,
    file_size BIGINT,
    mime_type VARCHAR(100),
    checksum VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    metadata JSONB,
    
    -- Check constraints for all 15 layers
    CONSTRAINT valid_nna_address CHECK (
        nna_address ~ '^[1-9]|1[0-5]\.[0-9]{3}\.[0-9]{3}\.[0-9]{3}$'
    ),
    CONSTRAINT valid_hfn CHECK (
        human_friendly_name ~ '^[GSLMWBPTCRENAIFX]\.[A-Z]{3}\.[A-Z]{3}\.[0-9]{3}$'
    )
);

-- Indexes for asset registry
CREATE INDEX idx_asset_nna_address ON asset_registry(nna_address);
CREATE INDEX idx_asset_hfn ON asset_registry(human_friendly_name);
CREATE INDEX idx_asset_type ON asset_registry(asset_type);
CREATE INDEX idx_asset_layer_status ON asset_registry(layer_status);
CREATE INDEX idx_asset_created_by ON asset_registry(created_by);
```

### 9.2 Registry Service Class

```typescript
interface RegistrationResult {
  success: boolean;
  mapping?: {
    layer: string;
    categoryAlpha: string;
    subcategoryAlpha: string;
    categoryNumeric: number;
    subcategoryNumeric: number;
    hfnPattern: string;
    mfaPattern: string;
  };
  error?: string;
  message?: string;
  existing?: any;
}

class NameRegistryService {
  private db: DatabaseConnection;
  private cache: CacheService;
  
  constructor(db: DatabaseConnection, cache: CacheService) {
    this.db = db;
    this.cache = cache;
  }
  
  async registerMapping(
    layer: string,
    categoryAlpha: string,
    subcategoryAlpha: string,
    description: string,
    createdBy: string,
    layerStatus: 'mvp' | 'future' = 'mvp'
  ): Promise<RegistrationResult> {
    
    // Validate inputs
    this.validateRegistrationInputs(layer, categoryAlpha, subcategoryAlpha);
    
    // Check if already registered
    const existing = await this.lookupMapping(layer, categoryAlpha, subcategoryAlpha);
    if (existing) {
      return {
        success: false,
        error: 'ALREADY_REGISTERED',
        message: `Mapping already exists: ${layer}.${categoryAlpha}.${subcategoryAlpha}`,
        existing: existing
      };
    }
    
    // Get next available numeric codes
    const categoryNumeric = await this.getNextCategoryNumber(layer, categoryAlpha);
    const subcategoryNumeric = await this.getNextSubcategoryNumber(
      layer, 
      categoryNumeric, 
      subcategoryAlpha
    );
    
    // Insert into database
    const result = await this.db.query(`
      INSERT INTO nna_registry (
        layer, category_alpha, subcategory_alpha, 
        category_numeric, subcategory_numeric,
        description, created_by, layer_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      layer, categoryAlpha, subcategoryAlpha,
      categoryNumeric, subcategoryNumeric,
      description, createdBy, layerStatus
    ]);
    
    const mapping = result.rows[0];
    
    // Cache the new mapping
    await this.cacheMapping(mapping);
    
    return {
      success: true,
      mapping: {
        layer,
        categoryAlpha,
        subcategoryAlpha,
        categoryNumeric,
        subcategoryNumeric,
        hfnPattern: `${layer}.${categoryAlpha}.${subcategoryAlpha}.*`,
        mfaPattern: `${layerToNumeric[layer]}.${categoryNumeric.toString().padStart(3, '0')}.${subcategoryNumeric.toString().padStart(3, '0')}.*`
      }
    };
  }
  
  async resolveToMFA(hfn: string): Promise<string> {
    // Check cache first
    const cached = await this.cache.get(`hfn_to_mfa:${hfn}`);
    if (cached) return cached;
    
    // Parse HFN
    const [layer, categoryAlpha, subcategoryAlpha, sequential] = hfn.split('.');
    
    // Look up mapping
    const mapping = await this.lookupMapping(layer, categoryAlpha, subcategoryAlpha);
    if (!mapping) {
      throw new Error(`No mapping found for: ${layer}.${categoryAlpha}.${subcategoryAlpha}`);
    }
    
    // Construct MFA
    const layerNumeric = layerToNumeric[layer];
    const mfa = `${layerNumeric}.${mapping.category_numeric.toString().padStart(3, '0')}.${mapping.subcategory_numeric.toString().padStart(3, '0')}.${sequential}`;
    
    // Cache result
    await this.cache.set(`hfn_to_mfa:${hfn}`, mfa, 3600); // 1 hour TTL
    
    return mfa;
  }
  
  async resolveToHFN(mfa: string): Promise<string> {
    // Check cache first
    const cached = await this.cache.get(`mfa_to_hfn:${mfa}`);
    if (cached) return cached;
    
    // Parse MFA
    const [layerNumeric, categoryNumeric, subcategoryNumeric, sequential] = mfa.split('.');
    const layer = numericToLayer[layerNumeric];
    
    // Look up mapping
    const mapping = await this.db.query(`
      SELECT * FROM nna_registry 
      WHERE layer = $1 AND category_numeric = $2 AND subcategory_numeric = $3
    `, [layer, parseInt(categoryNumeric), parseInt(subcategoryNumeric)]);
    
    if (mapping.rows.length === 0) {
      throw new Error(`No mapping found for: ${mfa}`);
    }
    
    const { category_alpha, subcategory_alpha } = mapping.rows[0];
    const hfn = `${layer}.${category_alpha}.${subcategory_alpha}.${sequential}`;
    
    // Cache result
    await this.cache.set(`mfa_to_hfn:${mfa}`, hfn, 3600); // 1 hour TTL
    
    return hfn;
  }
  
  private async lookupMapping(
    layer: string, 
    categoryAlpha: string, 
    subcategoryAlpha: string
  ): Promise<any> {
    const result = await this.db.query(`
      SELECT * FROM nna_registry 
      WHERE layer = $1 AND category_alpha = $2 AND subcategory_alpha = $3
    `, [layer, categoryAlpha, subcategoryAlpha]);
    
    return result.rows[0] || null;
  }
  
  private async getNextCategoryNumber(layer: string, categoryAlpha: string): Promise<number> {
    // Check if category already has a number assigned
    const existing = await this.db.query(`
      SELECT category_numeric FROM nna_registry 
      WHERE layer = $1 AND category_alpha = $2 
      LIMIT 1
    `, [layer, categoryAlpha]);
    
    if (existing.rows.length > 0) {
      return existing.rows[0].category_numeric;
    }
    
    // Get next available number
    const result = await this.db.query(`
      SELECT COALESCE(MAX(category_numeric), 0) + 1 as next_num
      FROM nna_registry 
      WHERE layer = $1
    `, [layer]);
    
    return result.rows[0].next_num;
  }
  
  private async getNextSubcategoryNumber(
    layer: string, 
    categoryNumeric: number, 
    subcategoryAlpha: string
  ): Promise<number> {
    // Check if subcategory already has a number assigned
    const existing = await this.db.query(`
      SELECT subcategory_numeric FROM nna_registry 
      WHERE layer = $1 AND category_numeric = $2 AND subcategory_alpha = $3
      LIMIT 1
    `, [layer, categoryNumeric, subcategoryAlpha]);
    
    if (existing.rows.length > 0) {
      return existing.rows[0].subcategory_numeric;
    }
    
    // Get next available number within this category
    const result = await this.db.query(`
      SELECT COALESCE(MAX(subcategory_numeric), 0) + 1 as next_num
      FROM nna_registry 
      WHERE layer = $1 AND category_numeric = $2
    `, [layer, categoryNumeric]);
    
    return result.rows[0].next_num;
  }
  
  private validateRegistrationInputs(
    layer: string, 
    categoryAlpha: string, 
    subcategoryAlpha: string
  ): void {
    if (!layer || layer.length !== 1 || !/^[GSLMWBPTCRENAIFX]$/.test(layer)) {
      throw new Error(`Invalid layer: ${layer}`);
    }
    
    if (!categoryAlpha || categoryAlpha.length !== 3 || !/^[A-Z]{3}$/.test(categoryAlpha)) {
      throw new Error(`Invalid category: ${categoryAlpha}`);
    }
    
    if (!subcategoryAlpha || subcategoryAlpha.length !== 3 || !/^[A-Z]{3}$/.test(subcategoryAlpha)) {
      throw new Error(`Invalid subcategory: ${subcategoryAlpha}`);
    }
  }
  
  private async cacheMapping(mapping: any): Promise<void> {
    const hfnKey = `${mapping.layer}.${mapping.category_alpha}.${mapping.subcategory_alpha}`;
    const mfaKey = `${layerToNumeric[mapping.layer]}.${mapping.category_numeric.toString().padStart(3, '0')}.${mapping.subcategory_numeric.toString().padStart(3, '0')}`;
    
    await Promise.all([
      this.cache.set(`mapping_hfn:${hfnKey}`, mapping, 7200), // 2 hours
      this.cache.set(`mapping_mfa:${mfaKey}`, mapping, 7200)
    ]);
  }
}
```

## 10. Error Handling and Validation

### 10.1 Error Types

```typescript
export enum AddressError {
  INVALID_FORMAT = 'INVALID_FORMAT',
  UNREGISTERED_CODE = 'UNREGISTERED_CODE',
  CONVERSION_FAILED = 'CONVERSION_FAILED',
  LAYER_NOT_FOUND = 'LAYER_NOT_FOUND',
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  SUBCATEGORY_NOT_FOUND = 'SUBCATEGORY_NOT_FOUND',
  SPECIAL_CASE_ERROR = 'SPECIAL_CASE_ERROR',
  FUTURE_LAYER_DISABLED = 'FUTURE_LAYER_DISABLED'
}

export class AddressValidationError extends Error {
  constructor(
    public code: AddressError,
    public address: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AddressValidationError';
  }
}
```

### 10.2 Comprehensive Validation

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  format: 'HFN' | 'MFA' | 'UNKNOWN';
  layerStatus?: 'mvp' | 'future';
}

export function validateAddress(address: string, allowFutureLayers: boolean = false): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Basic format check
  const parts = address.split('.');
  if (parts.length !== 4) {
    errors.push('Address must have exactly 4 parts separated by dots');
    return { isValid: false, errors, warnings, format: 'UNKNOWN' };
  }
  
  const [layer, category, subcategory, sequential] = parts;
  
  // Layer validation (supports all 15 layers)
  if (!layer || layer.length !== 1 || !/^[GSLMWBPTCRENAIFX]$/.test(layer)) {
    errors.push(`Invalid layer: ${layer}. Must be one of: G, S, L, M, W, B, P, T, C, R, E, N, A, I, F, X`);
  } else {
    // Check if it's a future layer
    const futureLayers = ['E', 'N', 'A', 'F', 'X'];
    const isFutureLayer = futureLayers.includes(layer);
    
    if (isFutureLayer && !allowFutureLayers) {
      warnings.push(`Future layer ${layer} is not yet activated in MVP`);
    }
  }
  
  // Sequential validation
  if (!sequential || sequential.length !== 3 || !/^[0-9]{3}$/.test(sequential)) {
    errors.push(`Invalid sequential: ${sequential}. Must be 3 digits (001-999)`);
  } else {
    const seqNum = parseInt(sequential);
    if (seqNum < 1 || seqNum > 999) {
      errors.push(`Sequential number out of range: ${seqNum}. Must be 001-999`);
    }
  }
  
  // Format-specific validation
  const isHFN = isHumanFriendlyName(address);
  const isMFA = isNNAAddress(address);
  
  if (!isHFN && !isMFA) {
    errors.push('Address is neither valid HFN nor MFA format');
  }
  
  if (isHFN) {
    // HFN-specific validation
    if (!/^[A-Z]{3}$/.test(category)) {
      errors.push(`Invalid HFN category: ${category}. Must be 3 uppercase letters`);
    }
    if (!/^[A-Z]{3}$/.test(subcategory)) {
      errors.push(`Invalid HFN subcategory: ${subcategory}. Must be 3 uppercase letters`);
    }
    
    // Check if codes are registered
    if (!categoryAlphaToNumeric[category]) {
      warnings.push(`Unregistered category code: ${category}`);
    }
  }
  
  if (isMFA) {
    // MFA-specific validation
    if (!/^[0-9]{3}$/.test(category)) {
      errors.push(`Invalid MFA category: ${category}. Must be 3 digits`);
    }
    if (!/^[0-9]{3}$/.test(subcategory)) {
      errors.push(`Invalid MFA subcategory: ${subcategory}. Must be 3 digits`);
    }
    
    // Range validation for MFA
    const catNum = parseInt(category);
    const subNum = parseInt(subcategory);
    if (catNum < 1 || catNum > 999) {
      errors.push(`MFA category out of range: ${catNum}. Must be 001-999`);
    }
    if (subNum < 1 || subNum > 999) {
      errors.push(`MFA subcategory out of range: ${subNum}. Must be 001-999`);
    }
  }
  
  // Determine layer status
  const futureLayers = ['E', 'N', 'A', 'F', 'X'];
  const layerStatus = futureLayers.includes(layer) ? 'future' : 'mvp';
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    format: isHFN ? 'HFN' : isMFA ? 'MFA' : 'UNKNOWN',
    layerStatus
  };
}
```

## 11. Cache Architecture

### 11.1 Multi-Tier Caching Strategy

```typescript
interface CacheConfiguration {
  edge: {
    ttl: 300,              // 5 minutes
    maxSize: '10GB',
    strategy: 'LRU',
    prefetch: {
      enabled: true,
      threshold: 0.8,    // Prefetch at 80% probability
      maxItems: 1000     // Max items to prefetch
    }
  },
  regional: {
    ttl: 3600,            // 1 hour
    maxSize: '100GB',
    strategy: 'LFU',
    sharding: {
      strategy: 'consistent-hashing',
      virtualNodes: 256,
      rebalanceThreshold: 0.2
    }
  },
  global: {
    ttl: 86400,           // 24 hours
    maxSize: '1TB',
    strategy: 'ARC',
    replication: {
      factor: 3,
      consistency: 'quorum'
    }
  }
}

class AddressCacheManager {
  private redis: RedisClient;
  private localCache: LRUCache;
  
  constructor() {
    this.redis = new RedisClient();
    this.localCache = new LRUCache({ max: 10000, ttl: 300000 }); // 5 min local cache
  }
  
  async getMapping(key: string): Promise<string | null> {
    // Check local cache first (fastest)
    const localResult = this.localCache.get(key);
    if (localResult) {
      return localResult;
    }
    
    // Check Redis cache (fast)
    const redisResult = await this.redis.get(`mapping:${key}`);
    if (redisResult) {
      this.localCache.set(key, redisResult);
      return redisResult;
    }
    
    return null;
  }
  
  async setMapping(key: string, value: string, ttl: number = 3600): Promise<void> {
    // Set in both caches
    this.localCache.set(key, value);
    await this.redis.setex(`mapping:${key}`, ttl, value);
  }
  
  async invalidateMapping(key: string): Promise<void> {
    this.localCache.delete(key);
    await this.redis.del(`mapping:${key}`);
  }
  
  async warmCache(layer: string, layerStatus: 'mvp' | 'future'): Promise<void> {
    // Only warm MVP layers in production, future layers in development
    if (layerStatus === 'future' && process.env.NODE_ENV === 'production') {
      return;
    }
    
    // Implement cache warming logic for the specific layer
    const mappings = await this.loadLayerMappings(layer);
    await Promise.all(mappings.map(mapping => 
      this.setMapping(mapping.key, mapping.value, 7200) // 2 hour TTL for warming
    ));
  }
}
```

---

**Continue to Part 4 of 4**: Testing, Deployment & Monitoring
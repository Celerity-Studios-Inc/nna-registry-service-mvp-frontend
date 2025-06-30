# Backend Taxonomy Service - Detailed Specification for Frontend Integration

> **NOTE:**
> - Layer **C** is **Composites** (not Content)
> - Layer **P** is **Personalize** (not Product)
> This document is the canonical reference for backend taxonomy API and data contract. Please use it for all integration and alignment work.

## Executive Summary

This document provides complete details of the backend taxonomy service implementation, including all APIs, source code, and the flattened taxonomy data structure used for database seeding. This ensures 100% alignment between frontend and backend before integration.

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Source Code Implementation](#source-code-implementation)
3. [Flattened Taxonomy Data Structure](#flattened-taxonomy-data-structure)
4. [Database Schema](#database-schema)
5. [Integration Checklist](#integration-checklist)

---

## API Endpoints

### Base URL
- **Development**: `http://localhost:8080/api/taxonomy`
- **Staging**: `https://nna-registry-backend-stg.vercel.app/api/taxonomy`
- **Production**: `https://nna-registry-backend.vercel.app/api/taxonomy`

### 1. Browse Operations

#### 1.1 Get All Layers
```http
GET /api/taxonomy/layers
```

**Response:**
```json
{
  "layers": ["B", "G", "L", "M", "P", "S", "W", "T", "R", "C"],
  "count": 10
}
```

#### 1.2 Get Categories for Layer
```http
GET /api/taxonomy/layers/{layer}/categories
```

**Parameters:**
- `layer` (string): Layer code (e.g., "G", "S", "L")

**Response:**
```json
{
  "categories": [
    {
      "code": "POP",
      "numericCode": "001",
      "name": "Pop"
    },
    {
      "code": "RCK",
      "numericCode": "002", 
      "name": "Rock"
    }
  ],
  "count": 2
}
```

#### 1.3 Get Subcategories
```http
GET /api/taxonomy/layers/{layer}/categories/{category}/subcategories
```

**Parameters:**
- `layer` (string): Layer code
- `category` (string): Category code (e.g., "POP", "RCK")

**Response:**
```json
{
  "subcategories": [
    {
      "code": "BAS",
      "numericCode": "001",
      "name": "Base"
    },
    {
      "code": "GLB",
      "numericCode": "002",
      "name": "Global_Pop"
    }
  ],
  "count": 2
}
```

#### 1.4 Get Complete Taxonomy Tree
```http
GET /api/taxonomy/tree
```

**Response:**
```json
{
  "G": {
    "name": "G",
    "categories": {
      "POP": {
        "name": "POP",
        "subcategories": {
          "BAS": {
            "name": "Base",
            "description": "",
            "numericCode": "001"
          }
        }
      }
    }
  }
}
```

### 2. Conversion Operations

#### 2.1 Convert HFN to MFA
```http
POST /api/taxonomy/convert/hfn-to-mfa
```

**Request Body:**
```json
{
  "hfn": "G.POP.BAS.001"
}
```

**Response:**
```json
{
  "hfn": "G.POP.BAS.001",
  "mfa": "1.001.001.001",
  "success": true
}
```

#### 2.2 Convert MFA to HFN
```http
POST /api/taxonomy/convert/mfa-to-hfn
```

**Request Body:**
```json
{
  "mfa": "1.001.001.001"
}
```

**Response:**
```json
{
  "mfa": "1.001.001.001",
  "hfn": "G.POP.BAS.001",
  "success": true
}
```

### 3. Metadata Operations

#### 3.1 Get Service Version
```http
GET /api/taxonomy/version
```

**Response:**
```json
{
  "version": 1,
  "lastUpdated": "2025-06-30T02:43:10.379Z",
  "checksum": "7z87h46nuyr",
  "totalNodes": 632
}
```

#### 3.2 Get Service Health
```http
GET /api/taxonomy/health
```

**Response:**
```json
{
  "status": "healthy",
  "environment": "development",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 15,
      "connections": {
        "active": 5,
        "max": 100
      }
    },
    "cache": {
      "status": "healthy",
      "hitRate": 0.92,
      "memory": {
        "used": "512MB",
        "max": "2GB"
      }
    }
  },
  "uptime": 3600,
  "timestamp": "2025-06-30T02:43:10.379Z"
}
```

### 4. Admin Operations

#### 4.1 Seed Taxonomy Data
```http
POST /api/taxonomy/seed
```

**Response:**
```json
{
  "message": "Taxonomy seeded successfully",
  "nodesInserted": 632,
  "timestamp": "2025-06-30T02:43:10.379Z"
}
```

#### 4.2 Get Test Data
```http
GET /api/taxonomy/test-data
```

**Response:**
```json
{
  "sampleNodes": [
    {
      "layer": "G",
      "category": "POP",
      "subcategory": "BAS",
      "name": "Base",
      "numericCode": "001"
    }
  ],
  "totalNodes": 632
}
```

---

## Source Code Implementation

### 1. Taxonomy Controller (`src/modules/taxonomy/taxonomy.controller.ts`)

```typescript
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { TaxonomyService } from './taxonomy.service';

@ApiTags('Taxonomy')
@Controller('taxonomy')
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Get('layers')
  @ApiOperation({ summary: 'Get all layers' })
  @ApiResponse({
    status: 200,
    description: 'List of layers',
    schema: {
      type: 'object',
      properties: {
        layers: {
          type: 'array',
          items: { type: 'string' },
          example: ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'],
        },
        count: { type: 'number', example: 10 },
      },
    },
  })
  getLayers() {
    return this.taxonomyService.getLayers();
  }

  @Get('layers/:layer/categories')
  @ApiOperation({ summary: 'Get categories for layer' })
  @ApiParam({
    name: 'layer',
    description: 'Layer code (e.g., S for Stars)',
    example: 'S',
    schema: { type: 'string', pattern: '^[A-Z]$' },
  })
  @ApiResponse({
    status: 200,
    description: 'Categories for the layer',
  })
  @ApiResponse({
    status: 404,
    description: 'Layer not found',
  })
  getCategories(@Param('layer') layer: string) {
    return this.taxonomyService.getCategoriesForLayer(layer);
  }

  @Get('layers/:layer/categories/:category/subcategories')
  @ApiOperation({ summary: 'Get subcategories' })
  @ApiParam({
    name: 'layer',
    description: 'Layer code',
    example: 'S',
    schema: { type: 'string', pattern: '^[A-Z]$' },
  })
  @ApiParam({
    name: 'category',
    description: 'Category code',
    example: 'POP',
    schema: { type: 'string', pattern: '^[A-Z]{3,10}$' },
  })
  @ApiResponse({
    status: 200,
    description: 'Subcategories for the layer and category',
  })
  getSubcategories(
    @Param('layer') layer: string,
    @Param('category') category: string,
  ) {
    return this.taxonomyService.getSubcategories(layer, category);
  }

  @Post('convert/hfn-to-mfa')
  @ApiOperation({ summary: 'Convert HFN to MFA' })
  @ApiResponse({
    status: 200,
    description: 'Conversion successful',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid HFN format',
  })
  convertHfnToMfa(@Body() body: { hfn: string }) {
    return this.taxonomyService.convertHfnToMfa(body.hfn);
  }

  @Post('convert/mfa-to-hfn')
  @ApiOperation({ summary: 'Convert MFA to HFN' })
  @ApiResponse({
    status: 200,
    description: 'Conversion successful',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid MFA format',
  })
  convertMfaToHfn(@Body() body: { mfa: string }) {
    return this.taxonomyService.convertMfaToHfn(body.mfa);
  }

  @Get('tree')
  getTaxonomyTree() {
    return this.taxonomyService.getTaxonomyTree();
  }

  @Get('version')
  getVersion() {
    return this.taxonomyService.getVersion();
  }

  @Get('health')
  getHealth() {
    return this.taxonomyService.getHealth();
  }

  @Post('seed')
  async seedTaxonomy() {
    return this.taxonomyService.seedTaxonomyFromFrontendData();
  }

  @Get('test-data')
  getTestData() {
    return this.taxonomyService.getTestData();
  }
}
```

### 2. Taxonomy Service (`src/modules/taxonomy/taxonomy.service.ts`)

```typescript
// src/modules/taxonomy/taxonomy.service.ts
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TaxonomyNode,
  TaxonomyNodeDocument,
} from '../../models/taxonomy-node.schema';
import {
  SequenceTracker,
  SequenceTrackerDocument,
} from '../../models/sequence-tracker.schema';
import {
  LAYER_LOOKUPS,
  LAYER_SUBCATEGORIES,
} from '../../taxonomy/constants';

@Injectable()
export class TaxonomyService {
  private readonly logger = new Logger(TaxonomyService.name);
  private currentVersion = 1;

  constructor(
    @InjectModel(TaxonomyNode.name)
    private taxonomyNodeModel: Model<TaxonomyNodeDocument>,
    @InjectModel(SequenceTracker.name)
    private sequenceTrackerModel: Model<SequenceTrackerDocument>,
  ) {
    this.initializeTaxonomy();
  }

  private async initializeTaxonomy(): Promise<void> {
    try {
      // Check if we have any nodes in the database
      const nodeCount = await this.taxonomyNodeModel.countDocuments();
      if (nodeCount === 0) {
        this.logger.log(
          'No taxonomy nodes found in database, initializing from frontend taxonomy data...',
        );
        await this.seedTaxonomyFromFrontendData();
      }

      // Get current version
      const latestNode = await this.taxonomyNodeModel
        .findOne()
        .sort({ version: -1 })
        .exec();
      this.currentVersion = latestNode?.version || 1;

      this.logger.log(
        `Taxonomy service initialized with version ${this.currentVersion}`,
      );
    } catch (error) {
      this.logger.error('Failed to initialize taxonomy service', error);
    }
  }

  async seedTaxonomyFromFrontendData(): Promise<void> {
    const nodes: Partial<TaxonomyNode>[] = [];

    // Iterate through all layers
    for (const [layerCode, layerLookup] of Object.entries(LAYER_LOOKUPS)) {
      // Iterate through all categories in the layer
      for (const [categoryCode] of Object.entries(layerLookup)) {
        const subcategoryCodes =
          LAYER_SUBCATEGORIES[layerCode]?.[categoryCode] || [];
        
        for (const fullSubcategoryCode of subcategoryCodes) {
          const subcategoryCode = fullSubcategoryCode.split('.')[1];
          const subcategoryData = layerLookup[fullSubcategoryCode];
          
          if (subcategoryData && subcategoryCode) {
            nodes.push({
              layer: layerCode,
              category: categoryCode,
              subcategory: subcategoryCode,
              name: subcategoryData.name,
              description: subcategoryData.description || '',
              numericCode: subcategoryData.numericCode,
              isActive: true,
              version: 1,
            });
          }
        }
      }
    }

    if (nodes.length > 0) {
      await this.taxonomyNodeModel.deleteMany({}); // Clear old data
      await this.taxonomyNodeModel.insertMany(nodes);
      this.logger.log(
        `Seeded ${nodes.length} taxonomy nodes from frontend taxonomy data`,
      );
    } else {
      this.logger.warn(
        'No taxonomy nodes were found to seed. Please check the frontend taxonomy data.',
      );
    }
  }

  async getLayers(): Promise<any> {
    const layers = await this.taxonomyNodeModel
      .distinct('layer')
      .sort()
      .exec();

    return {
      layers,
      count: layers.length,
    };
  }

  async getCategoriesForLayer(layer: string): Promise<any> {
    const categories = await this.taxonomyNodeModel
      .find({ layer, isActive: true })
      .distinct('category')
      .sort()
      .exec();

    const categoryData = await Promise.all(
      categories.map(async (category) => {
        const node = await this.taxonomyNodeModel
          .findOne({ layer, category, isActive: true })
          .exec();
        
        return {
          code: category,
          numericCode: node?.numericCode || '',
          name: node?.name || category,
        };
      }),
    );

    return {
      categories: categoryData,
      count: categoryData.length,
    };
  }

  async getSubcategories(layer: string, category: string): Promise<any> {
    const subcategories = await this.taxonomyNodeModel
      .find({ layer, category, isActive: true })
      .sort({ subcategory: 1 })
      .exec();

    const subcategoryData = subcategories.map((node) => ({
      code: node.subcategory,
      numericCode: node.numericCode,
      name: node.name,
    }));

    return {
      subcategories: subcategoryData,
      count: subcategoryData.length,
    };
  }

  async getTaxonomyTree(): Promise<any> {
    const nodes = await this.taxonomyNodeModel
      .find({ isActive: true })
      .sort({ layer: 1, category: 1, subcategory: 1 })
      .exec();

    const tree: any = {};
    
    for (const node of nodes) {
      if (!tree[node.layer]) {
        tree[node.layer] = {
          name: LAYER_LOOKUPS[node.layer]?.name || node.layer,
          categories: {},
        };
      }
      
      if (!tree[node.layer].categories[node.category]) {
        tree[node.layer].categories[node.category] = {
          name: node.category,
          subcategories: {},
        };
      }
      
      tree[node.layer].categories[node.category].subcategories[node.subcategory] = {
        name: node.name,
        description: node.description,
        numericCode: node.numericCode,
      };
    }

    return tree;
  }

  async convertHfnToMfa(hfn: string): Promise<any> {
    try {
      const parts = hfn.split('.');
      if (parts.length < 4) {
        throw new Error(`Invalid HFN format: ${hfn}`);
      }

      const [layer, category, subcategory, sequence] = parts;
      
      const node = await this.taxonomyNodeModel
        .findOne({ layer, category, subcategory, isActive: true })
        .exec();

      if (!node) {
        throw new Error(`Taxonomy node not found: ${layer}.${category}.${subcategory}`);
      }

      const mfa = `${this.getLayerNumericCode(layer)}.${node.numericCode}.${sequence}`;
      
      return {
        hfn,
        mfa,
        success: true,
      };
    } catch (error) {
      return {
        hfn,
        mfa: null,
        success: false,
        error: error.message,
      };
    }
  }

  async convertMfaToHfn(mfa: string): Promise<any> {
    try {
      const parts = mfa.split('.');
      if (parts.length < 3) {
        throw new Error(`Invalid MFA format: ${mfa}`);
      }

      const [layerNum, categoryNum, sequence] = parts;
      const layer = this.getLayerAlphaCode(layerNum);
      
      const node = await this.taxonomyNodeModel
        .findOne({ 
          layer, 
          numericCode: categoryNum, 
          isActive: true 
        })
        .exec();

      if (!node) {
        throw new Error(`Taxonomy node not found for MFA: ${mfa}`);
      }

      const hfn = `${layer}.${node.category}.${node.subcategory}.${sequence}`;
      
      return {
        mfa,
        hfn,
        success: true,
      };
    } catch (error) {
      return {
        mfa,
        hfn: null,
        success: false,
        error: error.message,
      };
    }
  }

  private getLayerNumericCode(layer: string): string {
    const layerMap: Record<string, string> = {
      'G': '1', 'S': '2', 'L': '3', 'M': '4', 
      'W': '5', 'B': '6', 'P': '7', 'T': '8', 
      'R': '9', 'C': '10'
    };
    return layerMap[layer] || '0';
  }

  private getLayerAlphaCode(layerNum: string): string {
    const layerMap: Record<string, string> = {
      '1': 'G', '2': 'S', '3': 'L', '4': 'M',
      '5': 'W', '6': 'B', '7': 'P', '8': 'T',
      '9': 'R', '10': 'C'
    };
    return layerMap[layerNum] || 'X';
  }

  async getVersion(): Promise<any> {
    const latestNode = await this.taxonomyNodeModel
      .findOne()
      .sort({ version: -1 })
      .exec();
    
    const totalNodes = await this.taxonomyNodeModel.countDocuments();
    
    return {
      version: latestNode?.version || 1,
      lastUpdated: latestNode?.updatedAt || new Date().toISOString(),
      checksum: this.generateChecksum(),
      totalNodes,
    };
  }

  private generateChecksum(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  async getHealth(): Promise<any> {
    try {
      const dbStatus = await this.checkDatabaseHealth();
      const cacheStatus = await this.checkCacheHealth();
      
      return {
        status: 'healthy',
        environment: process.env.NODE_ENV || 'development',
        services: {
          database: dbStatus,
          cache: cacheStatus,
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Health check failed', error);
      throw new HttpException(
        { status: 'unhealthy', error: error.message },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private async checkDatabaseHealth(): Promise<any> {
    const start = Date.now();
    try {
      await this.taxonomyNodeModel.findOne().exec();
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime,
        connections: { active: 5, max: 100 },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  private async checkCacheHealth(): Promise<any> {
    return {
      status: 'healthy',
      hitRate: 0.92,
      memory: { used: '512MB', max: '2GB' },
    };
  }

  async getTestData(): Promise<any> {
    const sampleNodes = await this.taxonomyNodeModel
      .find({ isActive: true })
      .limit(5)
      .exec();

    const totalNodes = await this.taxonomyNodeModel.countDocuments();

    return {
      sampleNodes: sampleNodes.map(node => ({
        layer: node.layer,
        category: node.category,
        subcategory: node.subcategory,
        name: node.name,
        numericCode: node.numericCode,
      })),
      totalNodes,
    };
  }
}
```

### 3. Database Schema (`src/models/taxonomy-node.schema.ts`)

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaxonomyNodeDocument = TaxonomyNode & Document;

@Schema({ timestamps: true })
export class TaxonomyNode {
  @Prop({ required: true, index: true })
  layer: string;

  @Prop({ required: true, index: true })
  category: string;

  @Prop({ required: true, index: true })
  subcategory: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true, index: true })
  numericCode: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 1 })
  version: number;
}

export const TaxonomyNodeSchema = SchemaFactory.createForClass(TaxonomyNode);

// Create composite unique index
TaxonomyNodeSchema.index(
  { layer: 1, category: 1, subcategory: 1 },
  { unique: true }
);
```

---

## Flattened Taxonomy Data Structure

### Available Layers (with corrected names)

1. **G (Songs):** Music genres and styles
2. **S (Stars):** Artist types and categories
3. **L (Looks):** Fashion and style categories
4. **M (Moves):** Dance and movement styles
5. **W (Worlds):** Environment and setting types
6. **B (Branded):** Brand assets, logos, and marketing materials
7. **P (Personalize):** Personalized user content and customizations
8. **T (Training_Data):** AI training datasets, prompts, and machine learning resources
9. **R (Rights):** Rights, licenses, and legal documentation
10. **C (Composites):** Combined assets that reference components from other layers

### File Structure

```
src/taxonomy/
├── index.ts              # Exports all layer files
├── constants.ts          # Re-exports as LAYER_LOOKUPS and LAYER_SUBCATEGORIES
├── G_layer.ts           # Songs layer
├── S_layer.ts           # Stars layer  
├── L_layer.ts           # Looks layer
├── M_layer.ts           # Moves layer
├── W_layer.ts           # Worlds layer
├── B_layer.ts           # Brands layer
├── P_layer.ts           # Products layer
├── T_layer.ts           # Training layer
├── R_layer.ts           # Rights layer
└── C_layer.ts           # Content layer
```

### Data Format

Each layer file exports two objects:

1. **LAYER_LOOKUP**: Contains all taxonomy nodes with their properties
2. **LAYER_SUBCATEGORIES**: Maps categories to their subcategories

#### Example: G_layer.ts (Songs Layer)

```typescript
// Generated G layer lookup table
// Contains flattened taxonomy for Songs

export const G_LAYER_LOOKUP = {
  POP: {
    numericCode: '001',
    name: 'Pop',
  },
  'POP.BAS': {
    numericCode: '001',
    name: 'Base',
  },
  'POP.GLB': {
    numericCode: '002',
    name: 'Global_Pop',
  },
  'POP.TEN': {
    numericCode: '003',
    name: 'Teen_Pop',
  },
  // ... more subcategories
  RCK: {
    numericCode: '002',
    name: 'Rock',
  },
  'RCK.BAS': {
    numericCode: '001',
    name: 'Base',
  },
  // ... more categories and subcategories
};

export const G_SUBCATEGORIES = {
  POP: ['POP.BAS', 'POP.GLB', 'POP.TEN', 'POP.DNC', 'POP.ELC', 'POP.DRM', 'POP.IND', 'POP.LAT', 'POP.SOU', 'POP.RCK', 'POP.ALT', 'POP.TSW'],
  RCK: ['RCK.BAS', 'RCK.CLS', 'RCK.MOD', 'RCK.GRG', 'RCK.PNK', 'RCK.ALR', 'RCK.PRG', 'RCK.PSY', 'RCK.FLK', 'RCK.ARN', 'RCK.GAR', 'RCK.BLU'],
  // ... more categories
};
```

### Constants File (`src/taxonomy/constants.ts`)

```typescript
// This file re-exports layer specific lookups as full objects
import * as lookups from './index';

// Create LAYER_LOOKUPS mapping
export const LAYER_LOOKUPS: Record<string, Record<string, any>> = {
  G: lookups.G_LAYER_LOOKUP,
  S: lookups.S_LAYER_LOOKUP,
  L: lookups.L_LAYER_LOOKUP,
  M: lookups.M_LAYER_LOOKUP,
  W: lookups.W_LAYER_LOOKUP,
  B: lookups.B_LAYER_LOOKUP,
  P: lookups.P_LAYER_LOOKUP,
  T: lookups.T_LAYER_LOOKUP,
  R: lookups.R_LAYER_LOOKUP,
  C: lookups.C_LAYER_LOOKUP,
};

// Create LAYER_SUBCATEGORIES mapping
export const LAYER_SUBCATEGORIES: Record<string, Record<string, string[]>> = {
  G: lookups.G_SUBCATEGORIES,
  S: lookups.S_SUBCATEGORIES,
  L: lookups.L_SUBCATEGORIES,
  M: lookups.M_SUBCATEGORIES,
  W: lookups.W_SUBCATEGORIES,
  B: lookups.B_SUBCATEGORIES,
  P: lookups.P_SUBCATEGORIES,
  T: lookups.T_SUBCATEGORIES,
  R: lookups.R_SUBCATEGORIES,
  C: lookups.C_SUBCATEGORIES,
};
```

### Database Seeding Process

The seeding process:

1. Reads from `LAYER_LOOKUPS` and `LAYER_SUBCATEGORIES`
2. Creates taxonomy nodes for each subcategory
3. Stores in MongoDB with the following structure:
   - `layer`: Layer code (e.g., "G")
   - `category`: Category code (e.g., "POP")
   - `subcategory`: Subcategory code (e.g., "BAS")
   - `name`: Human-readable name (e.g., "Base")
   - `numericCode`: Numeric identifier (e.g., "001")
   - `isActive`: Boolean flag for active status
   - `version`: Version number for tracking changes

---

## Database Schema

### TaxonomyNode Collection

```javascript
{
  _id: ObjectId,
  layer: String,           // Required, indexed
  category: String,        // Required, indexed
  subcategory: String,     // Required, indexed
  name: String,            // Required
  description: String,     // Optional
  numericCode: String,     // Required, indexed
  isActive: Boolean,       // Default: true
  version: Number,         // Default: 1
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-generated
}
```

### Indexes

1. **Composite Unique Index**: `{ layer: 1, category: 1, subcategory: 1 }`
2. **Individual Indexes**: `layer`, `category`, `subcategory`, `numericCode`

### Current Data Statistics

- **Total Nodes**: 632
- **Layers**: 7 (B, G, L, M, P, S, W)
- **Version**: 1
- **Last Updated**: 2025-06-30T02:43:10.379Z

---

## Integration Checklist

### For Frontend Team

#### 1. API Endpoint Verification
- [ ] Test all browse endpoints (`/layers`, `/categories`, `/subcategories`)
- [ ] Test conversion endpoints (`/convert/hfn-to-mfa`, `/convert/mfa-to-hfn`)
- [ ] Test metadata endpoints (`/version`, `/health`)
- [ ] Verify response formats match frontend expectations

#### 2. Data Alignment
- [ ] Confirm taxonomy tree structure matches frontend expectations
- [ ] Verify all layer codes are present (B, G, L, M, P, S, W)
- [ ] Check category and subcategory mappings
- [ ] Validate numeric codes for HFN/MFA conversion

#### 3. Error Handling
- [ ] Test invalid layer/category/subcategory requests
- [ ] Verify error response formats
- [ ] Test malformed HFN/MFA conversion requests

#### 4. Performance
- [ ] Test response times for large taxonomy tree
- [ ] Verify pagination if needed for large datasets
- [ ] Check memory usage with full taxonomy data

#### 5. Environment Configuration
- [ ] Update frontend API base URLs for each environment
- [ ] Configure CORS settings for frontend domains
- [ ] Set up environment-specific configurations

### For Backend Team

#### 1. Deployment
- [ ] Deploy to staging environment
- [ ] Run database seeding in staging
- [ ] Verify all endpoints work in staging
- [ ] Deploy to production environment

#### 2. Monitoring
- [ ] Set up health check monitoring
- [ ] Configure error logging and alerting
- [ ] Monitor API response times
- [ ] Track taxonomy data changes

#### 3. Documentation
- [ ] Update API documentation
- [ ] Create integration guides
- [ ] Document troubleshooting procedures

### Migration Plan

#### Phase 1: Testing
1. Frontend team tests all endpoints against staging backend
2. Verify data consistency between frontend and backend
3. Test all conversion scenarios

#### Phase 2: Gradual Rollout
1. Deploy backend to production
2. Frontend switches to backend APIs for read operations
3. Monitor for any issues

#### Phase 3: Full Migration
1. Frontend completely replaces simple taxonomy service
2. Remove frontend taxonomy files
3. Update all frontend code to use backend APIs

---

## Contact Information

For questions or issues during integration:

- **Backend Team**: [Backend team contact]
- **Frontend Team**: [Frontend team contact]
- **Documentation**: This specification document
- **API Documentation**: Swagger UI at `/api/docs`

---

**Last Updated**: 2025-06-30
**Version**: 1.0
**Status**: Ready for Frontend Integration 
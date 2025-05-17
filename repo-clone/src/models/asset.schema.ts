// src/models/asset.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Asset extends Document {
  @Prop({ required: true })
  layer: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  subcategory: string;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  nna_address: string;

  @Prop({ required: true })
  gcpStorageUrl: string;

  @Prop({ required: true })
  source: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object })
  trainingData?: {
    prompts: string[];
    images: string[];
    videos: string[];
  };

  @Prop({ type: Object })
  rights?: {
    source: string;
    rights_split: string;
  };

  @Prop({ type: [String], default: [] })
  components?: string[];

  @Prop({ required: true })
  registeredBy: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);

// Add text index for full-text search
AssetSchema.index({ name: 'text', description: 'text', tags: 'text' });
AssetSchema.index({ layer: 1, category: 1, subcategory: 1 });

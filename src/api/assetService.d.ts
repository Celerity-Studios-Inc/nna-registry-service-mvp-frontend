import { AssetUploadResult } from '../types/asset.types';

declare class AssetService {
  createAssetWithFiles(assetData: {
    name: string;
    layer: string;
    category: string;
    subcategory: string;
    description: string;
    tags: string[];
    files: File[];
    metadata: Record<string, any>;
  }): Promise<AssetUploadResult>;
}

declare const assetService: AssetService;
export default assetService;

import React from 'react';

export interface AssetMetadata {
  name?: string;
  description?: string;
  source?: string;
  tags?: string[];
  layerSpecificData?: Record<string, any>;
}

const MetadataForm = () => <div>MetadataForm Placeholder</div>;
export default MetadataForm;

import {
  MusicNote as MusicNoteIcon,
  Star as StarIcon,
  Face as FaceIcon,
  DirectionsRun as MoveIcon,
  Public as WorldIcon,
  LocalOffer as BrandingIcon,
  Person as PersonIcon,
  School as TrainingIcon,
  Layers as CompositeIcon,
  Copyright as RightsIcon,
} from '@mui/icons-material';
import React from 'react';

// Define the layer config with TypeScript type for indexing
interface LayerConfigType {
  [key: string]: {
    icon: React.ReactNode;
    description: string;
    color: string;
    fileTypes: string[];
    examples: string[];
  };
}

/**
 * Configuration for each layer in the NNA system
 * Includes icons, descriptions, colors, and file types
 */
const layerConfig: LayerConfigType = {
  // Songs layer (G)
  G: {
    icon: React.createElement(MusicNoteIcon),
    description:
      'Songs, music compositions, beats, and audio tracks for creative applications',
    color: '#1976d2', // Blue
    fileTypes: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac'],
    examples: [
      'Pop song',
      'Hip-hop beat',
      'Classical composition',
      'Sound effect',
    ],
  },

  // Stars layer (S)
  S: {
    icon: React.createElement(StarIcon),
    description: 'Stars, talent, celebrities, influencers and personalities',
    color: '#e91e63', // Pink
    fileTypes: ['image/jpeg', 'image/png', 'image/svg+xml'],
    examples: ['Celebrity profile', 'Voice talent', 'Influencer content'],
  },

  // Looks layer (L)
  L: {
    icon: React.createElement(FaceIcon),
    description: 'Visual styles, appearances, outfits, and fashion elements',
    color: '#9c27b0', // Purple
    fileTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'application/pdf'],
    examples: ['Character design', 'Costume', 'Visual style guide'],
  },

  // Moves layer (M)
  M: {
    icon: React.createElement(MoveIcon),
    description: 'Animations, movements, gestures, and choreography',
    color: '#ff9800', // Orange
    fileTypes: ['video/mp4', 'application/json', 'model/gltf+json'],
    examples: ['Dance routine', 'Character animation', 'Motion capture data'],
  },

  // Worlds layer (W)
  W: {
    icon: React.createElement(WorldIcon),
    description: '3D environments, scenes, and virtual worlds',
    color: '#4caf50', // Green
    fileTypes: [
      'model/gltf-binary',
      'model/gltf+json',
      'application/octet-stream',
    ],
    examples: ['3D scene', 'Game level', 'Virtual environment'],
  },

  // Branded layer (B)
  B: {
    icon: React.createElement(BrandingIcon),
    description: 'Brand assets, logos, and official marketing materials',
    color: '#f44336', // Red
    fileTypes: ['image/svg+xml', 'application/pdf', 'image/png'],
    examples: ['Logo', 'Brand guide', 'Official artwork'],
  },

  // Personalize layer (P)
  P: {
    icon: React.createElement(PersonIcon),
    description: 'Personalized user content and customizations',
    color: '#00bcd4', // Cyan
    fileTypes: ['application/json', 'image/png', 'text/plain'],
    examples: ['User preferences', 'Custom avatar', 'Personal playlist'],
  },

  // Training Data layer (T)
  T: {
    icon: React.createElement(TrainingIcon),
    description:
      'AI training datasets, prompts, and machine learning resources',
    color: '#673ab7', // Deep Purple
    fileTypes: [
      'application/json',
      'text/plain',
      'image/png',
      'application/zip',
    ],
    examples: ['Training dataset', 'Prompt collection', 'Model parameters'],
  },

  // Composite layer (C)
  C: {
    icon: React.createElement(CompositeIcon),
    description: 'Combined assets that reference components from other layers',
    color: '#795548', // Brown
    fileTypes: ['application/json', 'text/plain'],
    examples: [
      'Multi-layer experience',
      'Cross-category bundle',
      'Asset collection',
    ],
  },

  // Rights layer (R)
  R: {
    icon: React.createElement(RightsIcon),
    description: 'Rights, licenses, and legal documentation for assets',
    color: '#607d8b', // Blue Grey
    fileTypes: ['application/pdf', 'text/plain', 'application/json'],
    examples: ['License document', 'Usage rights', 'Copyright information'],
  },
};

export default layerConfig;

import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  Chip,
  Typography,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Refresh as RegenerateIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIconMui,
  MusicNote as MusicIcon,
  Image as ImageIcon,
  Movie as VideoIcon,
  ViewComfy as CompositeIcon
} from '@mui/icons-material';
import openaiService from '../../services/openaiService';

interface AIMetadataGeneratorProps {
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  layer: string;
  categoryCode: string;
  subcategoryCode: string;
  onDescriptionGenerated: (description: string) => void;
  onTagsGenerated: (tags: string[]) => void;
  onAdditionalMetadataGenerated?: (metadata: any) => void;  // Phase 2A: Album art and enhanced metadata
  currentDescription?: string;
  currentTags?: string[];
  disabled?: boolean;
  
  // Enhanced AI Integration props
  shortDescription?: string;  // Creator's Description from the form
  categoryName?: string;
  subcategoryName?: string;
  layerName?: string;
  thumbnailUrl?: string;      // For video layers
  imageUrl?: string;          // For image layers
  componentMetadata?: any[];  // For composite layers
}

// Enhanced AI Context interface (matching openaiService.ts)
interface EnhancedAIContext {
  layer: string;
  category: string;
  subcategory: string;
  shortDescription: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  thumbnail?: string;
  image?: string;
  componentMetadata?: any[];
  taxonomy: {
    layerName: string;
    categoryName: string;
    subcategoryName: string;
  };
  previousAttempts?: number;
  regenerationContext?: any;
}

interface GenerationState {
  isGenerating: boolean;
  lastGenerated: {
    description?: string;
    tags?: string[];
    timestamp?: Date;
    additionalMetadata?: any;
    processingType?: string;
  } | null;
  error: string | null;
  progress: string;
  useEnhancedAI: boolean;
}

const AIMetadataGenerator: React.FC<AIMetadataGeneratorProps> = ({
  fileUrl,
  fileName,
  fileType,
  layer,
  categoryCode,
  subcategoryCode,
  onDescriptionGenerated,
  onTagsGenerated,
  onAdditionalMetadataGenerated,
  currentDescription,
  currentTags = [],
  disabled = false,
  // Enhanced AI Integration props
  shortDescription,
  categoryName,
  subcategoryName,
  layerName,
  thumbnailUrl,
  imageUrl,
  componentMetadata
}) => {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    lastGenerated: null,
    error: null,
    progress: '',
    useEnhancedAI: !!shortDescription // Use enhanced AI if Creator's Description is provided
  });

  // Check if OpenAI API is configured
  const isConfigured = !!process.env.REACT_APP_OPENAI_API_KEY;

  // Helper function to get layer-specific icon
  const getLayerIcon = (layer: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      G: MusicIcon,
      S: ImageIcon,
      L: ImageIcon,
      M: VideoIcon,
      W: VideoIcon,
      C: CompositeIcon
    };
    const IconComponent = icons[layer] || AIIcon;
    return <IconComponent sx={{ mr: 1, color: 'primary.main' }} />;
  };

  // Helper function to determine if enhanced AI should be used
  const shouldUseEnhancedAI = () => {
    return state.useEnhancedAI && shortDescription && shortDescription.trim().length > 0;
  };

  // Helper function to build enhanced AI context
  const buildEnhancedContext = (): EnhancedAIContext => {
    return {
      layer,
      category: categoryCode,
      subcategory: subcategoryCode,
      shortDescription: shortDescription || fileName || 'uploaded-file',
      fileName: fileName || 'uploaded-file',
      fileType: fileType || 'unknown',
      thumbnail: thumbnailUrl,
      image: imageUrl || fileUrl,
      componentMetadata: componentMetadata,
      taxonomy: {
        layerName: layerName || layer,
        categoryName: categoryName || categoryCode,
        subcategoryName: subcategoryName || subcategoryCode
      },
      previousAttempts: 0
    };
  };

  // Helper function to set progress with layer-specific messages
  const setProgress = (message: string) => {
    setState(prev => ({ ...prev, progress: message }));
  };

  // Enhanced progress messages for different layers
  const getProgressMessages = (layer: string): string[] => {
    const messages: Record<string, string[]> = {
      G: [
        'Extracting song information...',
        'Searching music databases...',
        'Generating enhanced description and tags...'
      ],
      S: ['Analyzing performer image...', 'Generating description and tags...'],
      L: ['Analyzing look/style image...', 'Generating description and tags...'],
      M: ['Analyzing movement video...', 'Generating description and tags...'],
      W: ['Analyzing environment/world...', 'Generating description and tags...'],
      C: ['Aggregating component metadata...', 'Generating composite description...']
    };
    return messages[layer] || ['Analyzing file...', 'Generating description and tags...'];
  };

  const handleGenerateMetadata = async () => {
    // Enhanced validation
    if (!fileUrl && !shouldUseEnhancedAI()) {
      setState(prev => ({ 
        ...prev, 
        error: 'No file available for analysis. Please upload a file first.' 
      }));
      return;
    }

    if (shouldUseEnhancedAI() && !shortDescription?.trim()) {
      setState(prev => ({ 
        ...prev, 
        error: 'Please provide a Creator\'s Description to enable enhanced AI generation.' 
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null,
      progress: 'Initializing AI generation...'
    }));

    try {
      let result: { description: string; tags: string[]; additionalMetadata?: any };
      
      if (shouldUseEnhancedAI()) {
        console.log('🚀 [ENHANCED AI] Generation started with Creator\'s Description:', shortDescription);
        
        // Enhanced AI processing with layer-specific progress
        const progressMessages = getProgressMessages(layer);
        const enhancedContext = buildEnhancedContext();
        
        // Show layer-specific progress messages
        for (let i = 0; i < progressMessages.length; i++) {
          setProgress(progressMessages[i]);
          if (i < progressMessages.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        result = await openaiService.generateEnhancedMetadata(enhancedContext);
        
        console.log('🚀 [ENHANCED AI] Generation completed:', result);
        
      } else {
        console.log('🤖 [LEGACY AI] Generation started for:', { layer, categoryCode, subcategoryCode });
        
        // Legacy AI processing
        const context = {
          layer,
          categoryCode,
          subcategoryCode,
          fileName: fileName || 'uploaded-file',
          fileType: fileType || 'unknown'
        };

        setProgress('Analyzing file and generating metadata...');
        result = await openaiService.generateMetadata(fileUrl!, context);
        
        console.log('🤖 [LEGACY AI] Generation completed:', result);
      }
      
      // Update form fields
      onDescriptionGenerated(result.description);
      onTagsGenerated(result.tags);
      
      // Phase 2A: Pass additional metadata (including album art) to parent form
      if (result.additionalMetadata && onAdditionalMetadataGenerated) {
        onAdditionalMetadataGenerated(result.additionalMetadata);
        console.log('[PHASE 2A] Additional metadata passed to form:', result.additionalMetadata);
      }
      
      // Update state with enhanced metadata
      setState(prev => ({
        ...prev,
        isGenerating: false,
        progress: '',
        lastGenerated: {
          description: result.description,
          tags: result.tags,
          timestamp: new Date(),
          additionalMetadata: result.additionalMetadata,
          processingType: shouldUseEnhancedAI() ? 'enhanced' : 'legacy'
        }
      }));

    } catch (error) {
      console.error('🤖 AI Generation failed:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        progress: '',
        error: error instanceof Error ? error.message : 'Failed to generate metadata'
      }));
    }
  };

  const handleRegenerateMetadata = async (type: 'description' | 'tags' | 'both' = 'both') => {
    if (!fileUrl && !shouldUseEnhancedAI()) return;

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null,
      progress: `Regenerating ${type}...`
    }));

    try {
      if (shouldUseEnhancedAI()) {
        // Enhanced AI regeneration
        const enhancedContext = buildEnhancedContext();
        enhancedContext.previousAttempts = (state.lastGenerated?.additionalMetadata?.attempts || 0) + 1;
        enhancedContext.regenerationContext = {
          previousAttempts: enhancedContext.previousAttempts,
          lastResult: state.lastGenerated,
          userRequest: `regenerate-${type}`
        };

        const result = await openaiService.generateEnhancedMetadata(enhancedContext);
        
        // Update only the requested fields
        if (type === 'description' || type === 'both') {
          onDescriptionGenerated(result.description);
        }
        if (type === 'tags' || type === 'both') {
          onTagsGenerated(result.tags);
        }
        
        // Phase 2A: Pass additional metadata on regeneration too
        if (result.additionalMetadata && onAdditionalMetadataGenerated) {
          onAdditionalMetadataGenerated(result.additionalMetadata);
          console.log('[PHASE 2A] Additional metadata passed to form (regeneration):', result.additionalMetadata);
        }
        
        setState(prev => ({
          ...prev,
          isGenerating: false,
          progress: '',
          lastGenerated: {
            description: type === 'description' || type === 'both' ? result.description : prev.lastGenerated?.description,
            tags: type === 'tags' || type === 'both' ? result.tags : prev.lastGenerated?.tags,
            timestamp: new Date(),
            additionalMetadata: {
              ...result.additionalMetadata,
              attempts: enhancedContext.previousAttempts
            },
            processingType: 'enhanced'
          }
        }));

      } else {
        // Legacy AI regeneration
        const context = {
          layer,
          categoryCode,
          subcategoryCode,
          fileName: fileName || 'uploaded-file',
          fileType: fileType || 'unknown'
        };

        let description = state.lastGenerated?.description;
        let tags = state.lastGenerated?.tags;

        if (type === 'description' || type === 'both') {
          description = await openaiService.generateDescription(fileUrl!, context);
          onDescriptionGenerated(description);
        }
        
        if (type === 'tags' || type === 'both') {
          tags = await openaiService.generateTags(fileUrl!, context);
          onTagsGenerated(tags);
        }
        
        setState(prev => ({
          ...prev,
          isGenerating: false,
          progress: '',
          lastGenerated: {
            ...prev.lastGenerated,
            description,
            tags,
            timestamp: new Date(),
            processingType: 'legacy'
          }
        }));
      }

    } catch (error) {
      console.error(`🤖 ${type} regeneration failed:`, error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        progress: '',
        error: error instanceof Error ? error.message : `Failed to regenerate ${type}`
      }));
    }
  };

  const hasGenerated = state.lastGenerated !== null;
  const showRegenerateOptions = hasGenerated && !state.isGenerating;

  // Show configuration warning if API key is missing
  if (!isConfigured) {
    return (
      <Box sx={{ mb: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>AI Metadata Generation Unavailable</strong><br />
            OpenAI API key is not configured. Please set the REACT_APP_OPENAI_API_KEY environment variable to enable AI-powered metadata generation.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      {/* Enhanced AI Generation Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {getLayerIcon(layer)}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          🤖 Enhanced AI Metadata Generation
        </Typography>
        {hasGenerated && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {state.lastGenerated?.processingType === 'enhanced' && (
              <Chip 
                label="Enhanced AI"
                color="primary"
                size="small"
                variant="outlined"
              />
            )}
            <Chip 
              icon={<SuccessIcon />}
              label="Generated"
              color="success"
              size="small"
            />
          </Box>
        )}
      </Box>

      {/* Enhanced Description with layer-specific guidance */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {shouldUseEnhancedAI() ? (
          <>
            🚀 <strong>Enhanced AI Mode:</strong> Using your Creator's Description "{shortDescription}" 
            to generate layer-specific, AlgoRhythm-optimized metadata for {layerName || layer} assets.
          </>
        ) : (
          <>
            Let AI analyze your {layerName || layer} asset and automatically generate 
            description and tags based on your metadata guide for optimal AlgoRhythm compatibility.
          </>
        )}
      </Typography>

      {/* Creator's Description validation alert */}
      {!shortDescription?.trim() && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            💡 <strong>Tip:</strong> For enhanced AI generation, provide a Creator's Description above. 
            This enables layer-specific processing with{' '}
            {layer === 'G' && 'MusicBrainz integration and web search capabilities'}
            {layer === 'S' && 'performer-focused analysis with image context'}
            {layer === 'L' && 'style and fashion-aware processing'}
            {layer === 'M' && 'movement and choreography analysis'}
            {layer === 'W' && 'environment and atmosphere processing'}
            {layer === 'C' && 'intelligent component aggregation'}
            {!['G', 'S', 'L', 'M', 'W', 'C'].includes(layer) && 'context-aware processing'}
            .
          </Typography>
        </Alert>
      )}

      {/* Enhanced Generation Button */}
      {!hasGenerated && (
        <Button
          variant="contained"
          startIcon={state.isGenerating ? <CircularProgress size={20} /> : getLayerIcon(layer)}
          onClick={handleGenerateMetadata}
          disabled={disabled || state.isGenerating || (!fileUrl && !shouldUseEnhancedAI())}
          size="large"
          sx={{ mb: 2 }}
        >
          {state.isGenerating ? (
            shouldUseEnhancedAI() ? 'Enhanced AI Processing...' : 'Analyzing with AI...'
          ) : (
            shouldUseEnhancedAI() ? 'Generate Enhanced Metadata' : 'Generate Description & Tags with AI'
          )}
        </Button>
      )}

      {/* Enhanced Regeneration Options */}
      {showRegenerateOptions && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Regeneration Options:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<RegenerateIcon />}
              onClick={() => handleRegenerateMetadata('description')}
              disabled={state.isGenerating}
              size="small"
            >
              Regenerate Description
            </Button>
            <Button
              variant="outlined"
              startIcon={<RegenerateIcon />}
              onClick={() => handleRegenerateMetadata('tags')}
              disabled={state.isGenerating}
              size="small"
            >
              Regenerate Tags
            </Button>
            <Button
              variant="outlined"
              startIcon={shouldUseEnhancedAI() ? getLayerIcon(layer) : <AIIcon />}
              onClick={() => handleRegenerateMetadata('both')}
              disabled={state.isGenerating}
              size="small"
            >
              {shouldUseEnhancedAI() ? 'Enhanced Regenerate' : 'Regenerate Both'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Enhanced Generation Status with Progress */}
      {state.isGenerating && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box sx={{ mb: 1 }}>
            <LinearProgress sx={{ mb: 1 }} />
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              {state.progress || `AI is analyzing your ${layerName || layer} asset...`}
            </Typography>
          </Box>
          {shouldUseEnhancedAI() && (
            <Typography variant="caption" color="text.secondary">
              Enhanced AI mode with layer-specific processing
            </Typography>
          )}
        </Alert>
      )}

      {/* Enhanced Success Message */}
      {hasGenerated && !state.isGenerating && !state.error && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            ✨ {state.lastGenerated?.processingType === 'enhanced' ? 'Enhanced AI' : 'AI'} has generated 
            metadata optimized for {layerName || layer} layer assets! 
            You can edit the generated content below or regenerate specific parts.
          </Typography>
          
          {/* Phase 2A: Enhanced metadata information */}
          {state.lastGenerated?.additionalMetadata && (
            <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Enhanced Features:</strong>{' '}
                {layer === 'G' && state.lastGenerated.additionalMetadata.musicbrainzId && 'MusicBrainz integration, '}
                {layer === 'G' && state.lastGenerated.additionalMetadata.albumArtUrl && 'Album art lookup, '}
                {layer === 'G' && state.lastGenerated.additionalMetadata.bpm && `BPM detection (${state.lastGenerated.additionalMetadata.bpm}), `}
                {layer === 'G' && state.lastGenerated.additionalMetadata.energy && `Energy analysis (${state.lastGenerated.additionalMetadata.energy}), `}
                {layer === 'G' && state.lastGenerated.additionalMetadata.mood && `Mood detection (${state.lastGenerated.additionalMetadata.mood}), `}
                {state.lastGenerated.additionalMetadata.extractedSongData && 'Song data extraction, '}
                Layer-specific processing, AlgoRhythm optimization
              </Typography>
              
              {/* Phase 2A: Display enhanced song metadata for G layer */}
              {layer === 'G' && state.lastGenerated.additionalMetadata.extractedSongData && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    <strong>🎵 Song Data:</strong>{' '}
                    {state.lastGenerated.additionalMetadata.extractedSongData.songName && 
                      `"${state.lastGenerated.additionalMetadata.extractedSongData.songName}"`}
                    {state.lastGenerated.additionalMetadata.extractedSongData.artistName && 
                      ` by ${state.lastGenerated.additionalMetadata.extractedSongData.artistName}`}
                    {state.lastGenerated.additionalMetadata.extractedSongData.albumName && 
                      ` from "${state.lastGenerated.additionalMetadata.extractedSongData.albumName}"`}
                  </Typography>
                </Box>
              )}
              
              {/* Phase 2A: Display AlgoRhythm tags */}
              {layer === 'G' && state.lastGenerated.additionalMetadata.algorhythmTags && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    <strong>🎯 AlgoRhythm Tags:</strong>{' '}
                    {state.lastGenerated.additionalMetadata.algorhythmTags.slice(0, 3).join(', ')}
                    {state.lastGenerated.additionalMetadata.algorhythmTags.length > 3 && 
                      ` + ${state.lastGenerated.additionalMetadata.algorhythmTags.length - 3} more`}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          
          <Box sx={{ mt: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {state.lastGenerated?.timestamp && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Generated: {state.lastGenerated.timestamp.toLocaleTimeString()}
              </Typography>
            )}
            {state.lastGenerated?.additionalMetadata?.attempts && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Attempt #{state.lastGenerated.additionalMetadata.attempts}
              </Typography>
            )}
          </Box>
        </Alert>
      )}

      {/* Error Message */}
      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {state.error}
          </Typography>
          <Button
            size="small"
            onClick={() => setState(prev => ({ ...prev, error: null }))}
            sx={{ mt: 1 }}
          >
            Dismiss
          </Button>
        </Alert>
      )}

      {/* Enhanced Help Text */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          <strong>How Enhanced AI works:</strong>{' '}
          {shouldUseEnhancedAI() ? (
            <>
              Using your Creator's Description, AI applies layer-specific processing strategies:
              {layer === 'G' && ' song data extraction + BPM detection + energy analysis + mood detection + album art lookup + MusicBrainz integration'}
              {layer === 'S' && ' performer analysis + image context + performance attributes'}
              {layer === 'L' && ' style analysis + fashion context + aesthetic matching'}
              {layer === 'M' && ' movement analysis + choreography context + rhythm matching'}
              {layer === 'W' && ' environment analysis + atmosphere context + mood matching'}
              {layer === 'C' && ' component aggregation + composite intelligence'}
              {!['G', 'S', 'L', 'M', 'W', 'C'].includes(layer) && ' context-aware processing'}
              . All content is AlgoRhythm-optimized for cross-layer compatibility with enhanced metadata extraction.
            </>
          ) : (
            <>
              AI analyzes your uploaded file using layer-specific prompts based on your metadata guide. 
              For enhanced results with layer-specific strategies, provide a Creator's Description above. 
              Generated content follows AlgoRhythm optimization principles for better song-to-asset matching.
            </>
          )}
        </Typography>
      </Box>

      <Divider sx={{ mt: 2 }} />
    </Box>
  );
};

export default AIMetadataGenerator;
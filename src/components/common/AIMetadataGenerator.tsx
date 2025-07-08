import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  Chip,
  Typography,
  Divider
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Refresh as RegenerateIcon,
  CheckCircle as SuccessIcon
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
  currentDescription?: string;
  currentTags?: string[];
  disabled?: boolean;
}

interface GenerationState {
  isGenerating: boolean;
  lastGenerated: {
    description?: string;
    tags?: string[];
    timestamp?: Date;
  } | null;
  error: string | null;
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
  currentDescription,
  currentTags = [],
  disabled = false
}) => {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    lastGenerated: null,
    error: null
  });

  // Check if OpenAI API is configured
  const isConfigured = !!process.env.REACT_APP_OPENAI_API_KEY;

  const handleGenerateMetadata = async () => {
    if (!fileUrl) {
      setState(prev => ({ 
        ...prev, 
        error: 'No file available for analysis. Please upload a file first.' 
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null 
    }));

    try {
      const context = {
        layer,
        categoryCode,
        subcategoryCode,
        fileName: fileName || 'uploaded-file',
        fileType: fileType || 'unknown'
      };

      console.log('🤖 AI Generation started for:', context);
      
      const result = await openaiService.generateMetadata(fileUrl, context);
      
      console.log('🤖 AI Generation completed:', result);
      
      // Update form fields
      onDescriptionGenerated(result.description);
      onTagsGenerated(result.tags);
      
      // Update state
      setState(prev => ({
        ...prev,
        isGenerating: false,
        lastGenerated: {
          description: result.description,
          tags: result.tags,
          timestamp: new Date()
        }
      }));

    } catch (error) {
      console.error('🤖 AI Generation failed:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Failed to generate metadata'
      }));
    }
  };

  const handleRegenerateDescription = async () => {
    if (!fileUrl) return;

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const context = {
        layer,
        categoryCode,
        subcategoryCode,
        fileName: fileName || 'uploaded-file',
        fileType: fileType || 'unknown'
      };

      const description = await openaiService.generateDescription(fileUrl, context);
      onDescriptionGenerated(description);
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        lastGenerated: {
          ...prev.lastGenerated,
          description,
          timestamp: new Date()
        }
      }));

    } catch (error) {
      console.error('🤖 Description regeneration failed:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Failed to regenerate description'
      }));
    }
  };

  const handleRegenerateTags = async () => {
    if (!fileUrl) return;

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const context = {
        layer,
        categoryCode,
        subcategoryCode,
        fileName: fileName || 'uploaded-file',
        fileType: fileType || 'unknown'
      };

      const tags = await openaiService.generateTags(fileUrl, context);
      onTagsGenerated(tags);
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        lastGenerated: {
          ...prev.lastGenerated,
          tags,
          timestamp: new Date()
        }
      }));

    } catch (error) {
      console.error('🤖 Tags regeneration failed:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Failed to regenerate tags'
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
      {/* AI Generation Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AIIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          AI-Powered Metadata Generation
        </Typography>
        {hasGenerated && (
          <Chip 
            icon={<SuccessIcon />}
            label="Generated"
            color="success"
            size="small"
          />
        )}
      </Box>

      {/* Description */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Let AI analyze your {layer} layer asset and automatically generate 
        description and tags based on your metadata guide for optimal AlgoRhythm compatibility.
      </Typography>

      {/* Generation Button */}
      {!hasGenerated && (
        <Button
          variant="contained"
          startIcon={state.isGenerating ? <CircularProgress size={20} /> : <AIIcon />}
          onClick={handleGenerateMetadata}
          disabled={disabled || !fileUrl || state.isGenerating}
          size="large"
          sx={{ mb: 2 }}
        >
          {state.isGenerating ? 'Analyzing with AI...' : 'Generate Description & Tags with AI'}
        </Button>
      )}

      {/* Regeneration Options */}
      {showRegenerateOptions && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Regenerate Options:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<RegenerateIcon />}
              onClick={handleRegenerateDescription}
              disabled={state.isGenerating}
              size="small"
            >
              Regenerate Description
            </Button>
            <Button
              variant="outlined"
              startIcon={<RegenerateIcon />}
              onClick={handleRegenerateTags}
              disabled={state.isGenerating}
              size="small"
            >
              Regenerate Tags
            </Button>
            <Button
              variant="outlined"
              startIcon={<AIIcon />}
              onClick={handleGenerateMetadata}
              disabled={state.isGenerating}
              size="small"
            >
              Regenerate Both
            </Button>
          </Box>
        </Box>
      )}

      {/* Generation Status */}
      {state.isGenerating && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            AI is analyzing your {layer} layer asset to generate optimized metadata...
          </Box>
        </Alert>
      )}

      {/* Success Message */}
      {hasGenerated && !state.isGenerating && !state.error && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            ✨ AI has generated metadata optimized for {layer} layer assets! 
            You can edit the generated content below or regenerate specific parts.
          </Typography>
          {state.lastGenerated?.timestamp && (
            <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.8 }}>
              Generated: {state.lastGenerated.timestamp.toLocaleTimeString()}
            </Typography>
          )}
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

      {/* Help Text */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          <strong>How it works:</strong> AI analyzes your uploaded file using layer-specific prompts 
          based on your metadata guide. Generated content follows AlgoRhythm optimization 
          principles for better song-to-asset matching.
        </Typography>
      </Box>

      <Divider sx={{ mt: 2 }} />
    </Box>
  );
};

export default AIMetadataGenerator;
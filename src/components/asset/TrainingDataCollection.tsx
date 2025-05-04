import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  TextField,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider
} from '@mui/material';

import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  TextSnippet as TextIcon,
  Image as ImageIcon,
  Videocam as VideoIcon,
  PlayArrow as PlayIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  InsertLink as LinkIcon,
  Audiotrack as AudioIcon,
  Description as FileIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  EditNote as EditIcon,
  LocalOffer as TagIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

import { useDropzone } from 'react-dropzone';
import useFileUpload from '../../hooks/useFileUpload';
import { formatFileSize } from '../asset/MediaPlayer';

// Define interfaces
export interface TrainingDataFile {
  id: string;
  file: File;
  type: 'prompt' | 'image' | 'video' | 'audio' | 'other';
  previewUrl?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  error?: string;
  metadata?: {
    caption?: string;
    source?: string;
    tags?: string[];
    weight?: number;
    description?: string;
    fileType?: string;
    usage?: string;
  };
}

export interface TrainingDataVideo {
  id: string;
  url: string;
  title: string;
  type: 'youtube' | 'vimeo' | 'other';
  thumbnailUrl?: string;
  metadata?: {
    description?: string;
    timestamp?: string;
    source?: string;
  };
}

export interface TrainingPrompt {
  id: string;
  text: string;
  category?: string;
  tags?: string[];
  weight?: number;
}

export interface PromptCategory {
  id: string;
  name: string;
  description?: string;
  prompts: TrainingPrompt[];
}

export interface TrainingData {
  prompts: TrainingPrompt[];
  promptCategories: PromptCategory[];
  images: TrainingDataFile[];
  videos: TrainingDataVideo[];
  otherFiles: TrainingDataFile[];
  trainingMethodology?: string;
  trainingDatasetInfo?: string;
  modelArchitecture?: string;
  hyperparameterInfo?: string;
  evaluationMetrics?: string;
}

interface TrainingDataCollectionProps {
  onChange: (data: TrainingData) => void;
  initialData?: TrainingData;
  isTrainable: boolean;
}

// Helper to generate a simple ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Helper to determine file type
const getFileType = (file: File): 'prompt' | 'image' | 'video' | 'audio' | 'other' => {
  if (file.type.startsWith('image/')) {
    return 'image';
  } else if (file.type.startsWith('video/')) {
    return 'video';
  } else if (file.type.startsWith('audio/')) {
    return 'audio';
  } else if (file.type.startsWith('text/')) {
    return 'prompt';
  } else {
    return 'other';
  }
};

// Helper to extract video ID from YouTube or Vimeo URLs
const extractVideoInfo = (url: string): { type: 'youtube' | 'vimeo' | 'other', id: string, thumbnailUrl?: string } => {
  // YouTube regex patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/i;
  const youtubeMatch = url.match(youtubeRegex);
  
  if (youtubeMatch && youtubeMatch[1]) {
    const videoId = youtubeMatch[1];
    return {
      type: 'youtube',
      id: videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    };
  }
  
  // Vimeo regex patterns
  const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?))/i;
  const vimeoMatch = url.match(vimeoRegex);
  
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      id: vimeoMatch[1],
      // Vimeo requires API access for thumbnails, so we don't set it here
    };
  }
  
  // Other video URL
  return {
    type: 'other',
    id: generateId()
  };
};

/**
 * TabPanel Component for the tabbed interface
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`training-tabpanel-${index}`}
      aria-labelledby={`training-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

/**
 * Main TrainingDataCollection Component
 */
const TrainingDataCollection: React.FC<TrainingDataCollectionProps> = ({
  onChange,
  initialData,
  isTrainable
}) => {
  const theme = useTheme();
  
  // Default empty training data
  const defaultTrainingData: TrainingData = {
    prompts: [],
    promptCategories: [],
    images: [],
    videos: [],
    otherFiles: [],
    trainingMethodology: '',
    trainingDatasetInfo: '',
    modelArchitecture: '',
    hyperparameterInfo: '',
    evaluationMetrics: ''
  };
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Training data state
  const [trainingData, setTrainingData] = useState<TrainingData>(initialData || defaultTrainingData);
  
  // New prompt input state
  const [newPrompt, setNewPrompt] = useState('');
  const [promptCategory, setPromptCategory] = useState('');
  const [promptTags, setPromptTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [promptWeight, setPromptWeight] = useState(1);
  
  // New category state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  // Video URL input state
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoTimestamp, setVideoTimestamp] = useState('');
  const [videoSource, setVideoSource] = useState('');
  
  // Image metadata state
  const [selectedImage, setSelectedImage] = useState<TrainingDataFile | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const [imageSource, setImageSource] = useState('');
  const [imageTags, setImageTags] = useState<string[]>([]);
  const [imageWeight, setImageWeight] = useState(1);
  const [imageMetadataOpen, setImageMetadataOpen] = useState(false);
  
  // Additional training info state
  const [methodology, setMethodology] = useState(initialData?.trainingMethodology || '');
  const [datasetInfo, setDatasetInfo] = useState(initialData?.trainingDatasetInfo || '');
  const [architecture, setArchitecture] = useState(initialData?.modelArchitecture || '');
  const [hyperparameters, setHyperparameters] = useState(initialData?.hyperparameterInfo || '');
  const [evaluation, setEvaluation] = useState(initialData?.evaluationMetrics || '');
  
  // Preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<any>(null);
  
  // File upload hook
  const { 
    addFiles, 
    clearUploadState 
  } = useFileUpload(false, file => {
    // Validate file size (max 10MB for images, 50MB for videos)
    const maxSize = file.type.startsWith('image/') 
      ? 10 * 1024 * 1024 
      : file.type.startsWith('video/') 
        ? 50 * 1024 * 1024 
        : 20 * 1024 * 1024;
    
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      alert(`File ${file.name} exceeds the maximum size of ${maxSizeMB}MB`);
      return false;
    }
    
    return true;
  });
  
  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    // Add files to our state
    addFiles(acceptedFiles);
    
    // Create file preview URLs and add to training data
    const newFiles: TrainingDataFile[] = acceptedFiles.map(file => {
      const fileType = getFileType(file);
      const previewUrl = fileType === 'image' ? URL.createObjectURL(file) : undefined;
      
      return {
        id: generateId(),
        file,
        type: fileType,
        previewUrl,
        progress: 0,
        status: 'pending',
        metadata: {
          caption: '',
          source: '',
          tags: [],
          weight: 1
        }
      };
    });
    
    // Update state based on file types
    setTrainingData(prev => {
      const newImages = [...prev.images, ...newFiles.filter(f => f.type === 'image')];
      const newOtherFiles = [...prev.otherFiles, ...newFiles.filter(f => f.type !== 'image')];
      
      return {
        ...prev,
        images: newImages,
        otherFiles: newOtherFiles
      };
    });
  }, [addFiles]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
      'audio/*': [],
      'text/*': [],
      'application/pdf': []
    }
  });
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle adding a new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory: PromptCategory = {
      id: generateId(),
      name: newCategoryName.trim(),
      description: newCategoryDescription.trim() || undefined,
      prompts: []
    };
    
    setTrainingData(prev => ({
      ...prev,
      promptCategories: [...prev.promptCategories, newCategory]
    }));
    
    setNewCategoryName('');
    setNewCategoryDescription('');
  };
  
  // Handle adding a new prompt
  const handleAddPrompt = () => {
    if (!newPrompt.trim()) return;
    
    const newPromptItem: TrainingPrompt = {
      id: generateId(),
      text: newPrompt.trim(),
      category: promptCategory.trim() || undefined,
      tags: promptTags,
      weight: promptWeight
    };
    
    // Add to selected category if one is selected
    if (selectedCategoryId) {
      setTrainingData(prev => {
        const updatedCategories = prev.promptCategories.map(cat => {
          if (cat.id === selectedCategoryId) {
            return {
              ...cat,
              prompts: [...cat.prompts, newPromptItem]
            };
          }
          return cat;
        });
        
        return {
          ...prev,
          promptCategories: updatedCategories
        };
      });
    } else {
      // Otherwise add to main prompts list
      setTrainingData(prev => ({
        ...prev,
        prompts: [...prev.prompts, newPromptItem]
      }));
    }
    
    setNewPrompt('');
    setPromptCategory('');
    setPromptTags([]);
    setPromptWeight(1);
  };
  
  // Handle adding a video URL
  const handleAddVideoUrl = () => {
    if (!videoUrl.trim()) return;
    
    const videoInfo = extractVideoInfo(videoUrl.trim());
    const newVideo: TrainingDataVideo = {
      id: videoInfo.id,
      url: videoUrl.trim(),
      title: videoTitle.trim() || `Video ${trainingData.videos.length + 1}`,
      type: videoInfo.type,
      thumbnailUrl: videoInfo.thumbnailUrl,
      metadata: {
        description: videoDescription,
        timestamp: videoTimestamp,
        source: videoSource
      }
    };
    
    setTrainingData(prev => ({
      ...prev,
      videos: [...prev.videos, newVideo]
    }));
    
    setVideoUrl('');
    setVideoTitle('');
    setVideoDescription('');
    setVideoTimestamp('');
    setVideoSource('');
  };
  
  // Handle adding a tag to a prompt
  const handleAddPromptTag = () => {
    if (!newTag.trim() || promptTags.includes(newTag.trim())) return;
    
    setPromptTags([...promptTags, newTag.trim()]);
    setNewTag('');
  };
  
  // Handle removing a tag from a prompt
  const handleRemovePromptTag = (tagToRemove: string) => {
    setPromptTags(promptTags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle adding a tag to an image
  const handleAddImageTag = () => {
    if (!newTag.trim() || imageTags.includes(newTag.trim())) return;
    
    setImageTags([...imageTags, newTag.trim()]);
    setNewTag('');
  };
  
  // Handle removing a tag from an image
  const handleRemoveImageTag = (tagToRemove: string) => {
    setImageTags(imageTags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle image metadata dialog
  const handleOpenImageMetadata = (image: TrainingDataFile) => {
    setSelectedImage(image);
    setImageCaption(image.metadata?.caption || '');
    setImageSource(image.metadata?.source || '');
    setImageTags(image.metadata?.tags || []);
    setImageWeight(image.metadata?.weight || 1);
    setImageMetadataOpen(true);
  };
  
  // Handle saving image metadata
  const handleSaveImageMetadata = () => {
    if (!selectedImage) return;
    
    setTrainingData(prev => {
      const updatedImages = prev.images.map(img => {
        if (img.id === selectedImage.id) {
          return {
            ...img,
            metadata: {
              caption: imageCaption,
              source: imageSource,
              tags: imageTags,
              weight: imageWeight
            }
          };
        }
        return img;
      });
      
      return {
        ...prev,
        images: updatedImages
      };
    });
    
    setImageMetadataOpen(false);
    setSelectedImage(null);
  };
  
  // Handle removing a prompt
  const handleRemovePrompt = (id: string) => {
    setTrainingData(prev => ({
      ...prev,
      prompts: prev.prompts.filter(p => p.id !== id)
    }));
  };
  
  // Handle removing a prompt from a category
  const handleRemoveCategoryPrompt = (categoryId: string, promptId: string) => {
    setTrainingData(prev => {
      const updatedCategories = prev.promptCategories.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            prompts: cat.prompts.filter(p => p.id !== promptId)
          };
        }
        return cat;
      });
      
      return {
        ...prev,
        promptCategories: updatedCategories
      };
    });
  };
  
  // Handle removing a category
  const handleRemoveCategory = (id: string) => {
    setTrainingData(prev => ({
      ...prev,
      promptCategories: prev.promptCategories.filter(c => c.id !== id)
    }));
    
    if (selectedCategoryId === id) {
      setSelectedCategoryId('');
    }
  };
  
  // Handle removing an image
  const handleRemoveImage = (id: string) => {
    setTrainingData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id)
    }));
  };
  
  // Handle removing a video
  const handleRemoveVideo = (id: string) => {
    setTrainingData(prev => ({
      ...prev,
      videos: prev.videos.filter(v => v.id !== id)
    }));
  };
  
  // Handle removing other files
  const handleRemoveFile = (id: string) => {
    setTrainingData(prev => ({
      ...prev,
      otherFiles: prev.otherFiles.filter(f => f.id !== id)
    }));
  };
  
  // Handle file preview
  const handlePreview = (item: any) => {
    setPreviewItem(item);
    setPreviewOpen(true);
  };
  
  // Close preview dialog
  const handleClosePreview = () => {
    setPreviewOpen(false);
  };
  
  // Clear all training data
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all training data?')) {
      setTrainingData(defaultTrainingData);
      clearUploadState();
      
      // Reset additional training info
      setMethodology('');
      setDatasetInfo('');
      setArchitecture('');
      setHyperparameters('');
      setEvaluation('');
    }
  };
  
  // Update additional training info
  useEffect(() => {
    setTrainingData(prev => ({
      ...prev,
      trainingMethodology: methodology,
      trainingDatasetInfo: datasetInfo,
      modelArchitecture: architecture,
      hyperparameterInfo: hyperparameters,
      evaluationMetrics: evaluation
    }));
  }, [methodology, datasetInfo, architecture, hyperparameters, evaluation]);
  
  // Initialize additional training info from passed in data
  useEffect(() => {
    if (initialData) {
      setMethodology(initialData.trainingMethodology || '');
      setDatasetInfo(initialData.trainingDatasetInfo || '');
      setArchitecture(initialData.modelArchitecture || '');
      setHyperparameters(initialData.hyperparameterInfo || '');
      setEvaluation(initialData.evaluationMetrics || '');
    }
  }, [initialData]);
  
  // Notify parent component when training data changes
  useEffect(() => {
    onChange(trainingData);
  }, [trainingData, onChange]);
  
  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      trainingData.images.forEach(img => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
    };
  }, [trainingData.images]);
  
  if (!isTrainable) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Enable "This asset can be used for training AI models" to add training data.
      </Alert>
    );
  }
  
  // Calculate stats for display
  const totalPrompts = trainingData.prompts.length + trainingData.promptCategories.reduce(
    (acc, cat) => acc + cat.prompts.length, 0
  );
  const totalImages = trainingData.images.length;
  const totalVideos = trainingData.videos.length;
  const totalOtherFiles = trainingData.otherFiles.length;
  const totalFiles = totalImages + totalOtherFiles;
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Summary / stats */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Training Data Collection
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              icon={<TextIcon />} 
              label={`${totalPrompts} Prompt${totalPrompts !== 1 ? 's' : ''}`} 
              color={totalPrompts > 0 ? 'primary' : 'default'} 
              variant="outlined"
            />
            <Chip 
              icon={<CategoryIcon />} 
              label={`${trainingData.promptCategories.length} Categor${trainingData.promptCategories.length !== 1 ? 'ies' : 'y'}`} 
              color={trainingData.promptCategories.length > 0 ? 'primary' : 'default'} 
              variant="outlined"
            />
            <Chip 
              icon={<ImageIcon />} 
              label={`${totalImages} Image${totalImages !== 1 ? 's' : ''}`} 
              color={totalImages > 0 ? 'primary' : 'default'}
              variant="outlined" 
            />
            <Chip 
              icon={<VideoIcon />} 
              label={`${totalVideos} Video${totalVideos !== 1 ? 's' : ''}`} 
              color={totalVideos > 0 ? 'primary' : 'default'}
              variant="outlined" 
            />
            <Chip 
              icon={<FileIcon />} 
              label={`${totalOtherFiles} Other File${totalOtherFiles !== 1 ? 's' : ''}`} 
              color={totalOtherFiles > 0 ? 'primary' : 'default'}
              variant="outlined" 
            />
          </Box>
        </Box>
        
        {(totalPrompts > 0 || totalFiles > 0 || totalVideos > 0) && (
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<ClearIcon />}
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        )}
      </Box>
      
      {/* Tabs for different types of training data */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="training data tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Prompts" id="training-tab-0" aria-controls="training-tabpanel-0" />
          <Tab label="Images" id="training-tab-1" aria-controls="training-tabpanel-1" />
          <Tab label="Videos" id="training-tab-2" aria-controls="training-tabpanel-2" />
          <Tab label="Other Files" id="training-tab-3" aria-controls="training-tabpanel-3" />
          <Tab label="Advanced" id="training-tab-4" aria-controls="training-tabpanel-4" />
        </Tabs>
        
        {/* Prompts Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            {/* Category Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Prompt Categories
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Organize your prompts into categories for better structure and usability.
              </Typography>
              
              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      label="Category Name"
                      placeholder="E.g., Style Variations, Character Descriptions"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      label="Description (Optional)"
                      placeholder="Brief description of this category"
                      value={newCategoryDescription}
                      onChange={(e) => setNewCategoryDescription(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddCategory}
                      disabled={!newCategoryName.trim()}
                      sx={{ height: '100%' }}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              
              {/* Category Selector */}
              {trainingData.promptCategories.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel id="category-select-label">Select Category for New Prompts</InputLabel>
                    <Select
                      labelId="category-select-label"
                      value={selectedCategoryId}
                      label="Select Category for New Prompts"
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>None (Add to uncategorized prompts)</em>
                      </MenuItem>
                      {trainingData.promptCategories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name} ({category.prompts.length} prompts)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
              
              {/* Categories List */}
              {trainingData.promptCategories.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  {trainingData.promptCategories.map((category) => (
                    <Accordion key={category.id} sx={{ mb: 1 }}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panel-${category.id}-content`}
                        id={`panel-${category.id}-header`}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2, alignItems: 'center' }}>
                          <Typography sx={{ fontWeight: 'bold' }}>{category.name}</Typography>
                          <Chip 
                            label={`${category.prompts.length} prompt${category.prompts.length !== 1 ? 's' : ''}`} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {category.description && (
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {category.description}
                          </Typography>
                        )}
                        
                        {category.prompts.length === 0 ? (
                          <Alert severity="info">
                            No prompts in this category yet. Add prompts using the form below.
                          </Alert>
                        ) : (
                          <List>
                            {category.prompts.map((prompt, index) => (
                              <ListItem 
                                key={prompt.id}
                                secondaryAction={
                                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveCategoryPrompt(category.id, prompt.id)}>
                                    <DeleteIcon />
                                  </IconButton>
                                }
                                sx={{ 
                                  bgcolor: 'background.paper', 
                                  mb: 1, 
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: 'divider'
                                }}
                              >
                                <ListItemIcon>
                                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                    {index + 1}
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={prompt.text}
                                  secondary={
                                    <React.Fragment>
                                      {prompt.weight !== 1 && `Weight: ${prompt.weight} • `}
                                      {prompt.tags && prompt.tags.length > 0 && (
                                        <Box sx={{ mt: 0.5 }}>
                                          {prompt.tags.map(tag => (
                                            <Chip 
                                              key={tag} 
                                              label={tag} 
                                              size="small" 
                                              variant="outlined"
                                              sx={{ mr: 0.5, mb: 0.5 }}
                                            />
                                          ))}
                                        </Box>
                                      )}
                                    </React.Fragment>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                          <Button
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleRemoveCategory(category.id)}
                          >
                            Remove Category
                          </Button>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Add Prompts
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Enter the prompts that were used to generate or train this asset. These help others understand how to use this asset in AI systems.
              </Typography>
              
              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Prompt Text"
                      placeholder="Enter a prompt used to generate or train this asset"
                      value={newPrompt}
                      onChange={(e) => setNewPrompt(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          e.preventDefault();
                          handleAddPrompt();
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={selectedCategoryId ? 4 : 6}>
                    <TextField
                      fullWidth
                      label="Category (Manual Override)"
                      placeholder="E.g., Style, Subject, Pose"
                      value={promptCategory}
                      onChange={(e) => setPromptCategory(e.target.value)}
                      disabled={!!selectedCategoryId}
                      helperText={selectedCategoryId ? "Using selected category" : "Optional free-form category"}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={selectedCategoryId ? 4 : 6}>
                    <FormControl fullWidth>
                      <InputLabel id="prompt-weight-label">Prompt Weight</InputLabel>
                      <Select
                        labelId="prompt-weight-label"
                        value={promptWeight}
                        label="Prompt Weight"
                        onChange={(e) => setPromptWeight(Number(e.target.value))}
                      >
                        <MenuItem value={0.5}>0.5 - Low Influence</MenuItem>
                        <MenuItem value={1}>1 - Normal (Default)</MenuItem>
                        <MenuItem value={1.5}>1.5 - Increased Influence</MenuItem>
                        <MenuItem value={2}>2 - High Influence</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {selectedCategoryId && (
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel id="selected-category-label">Selected Category</InputLabel>
                        <Select
                          labelId="selected-category-label"
                          value={selectedCategoryId}
                          label="Selected Category"
                          inputProps={{ readOnly: true }}
                        >
                          {trainingData.promptCategories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Prompt Tags (Optional)
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TextField
                        size="small"
                        label="Add Tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddPromptTag();
                          }
                        }}
                        sx={{ mr: 1 }}
                      />
                      <Button
                        variant="outlined"
                        size="medium"
                        startIcon={<TagIcon />}
                        onClick={handleAddPromptTag}
                        disabled={!newTag.trim() || promptTags.includes(newTag.trim())}
                      >
                        Add Tag
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {promptTags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          onDelete={() => handleRemovePromptTag(tag)}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddPrompt}
                      disabled={!newPrompt.trim()}
                    >
                      Add Prompt
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                      Press Ctrl+Enter to add quickly
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            
            {/* Uncategorized Prompts */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Uncategorized Prompts ({trainingData.prompts.length})
              </Typography>
              
              {trainingData.prompts.length === 0 ? (
                <Alert severity="info">
                  No uncategorized prompts added yet. Add prompts above to help others understand how to use this asset in AI systems.
                </Alert>
              ) : (
                <List>
                  {trainingData.prompts.map((prompt, index) => (
                    <ListItem 
                      key={prompt.id}
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => handleRemovePrompt(prompt.id)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                      sx={{ 
                        bgcolor: 'background.paper', 
                        mb: 1, 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={prompt.text}
                        secondary={
                          <React.Fragment>
                            {prompt.category && `Category: ${prompt.category} • `}
                            {prompt.weight !== 1 && `Weight: ${prompt.weight} • `}
                            {prompt.tags && prompt.tags.length > 0 && (
                              <Box sx={{ mt: 0.5 }}>
                                {prompt.tags.map(tag => (
                                  <Chip 
                                    key={tag} 
                                    label={tag} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                              </Box>
                            )}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Images Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Reference Images
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add reference images that were used to inspire or train this asset. Drag and drop images or click to select files.
              </Typography>
              
              <Paper 
                {...getRootProps()}
                sx={{
                  p: 3,
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  minHeight: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <input {...getInputProps()} />
                <UploadIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  {isDragActive ? 'Drop files here' : 'Drag & drop images here'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to select files (max 10MB per image)
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Uploaded Images ({trainingData.images.length})
              </Typography>
              
              {trainingData.images.length === 0 ? (
                <Alert severity="info">
                  No images uploaded yet. Add reference images to help train AI models or provide visual examples.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {trainingData.images.map((image) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardMedia
                          component="img"
                          height="160"
                          image={image.previewUrl}
                          alt={image.file.name}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ pt: 1, pb: 1 }}>
                          <Typography variant="body2" noWrap title={image.file.name}>
                            {image.file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(image.file.size)}
                          </Typography>
                          
                          {image.metadata && (image.metadata.caption || image.metadata.source || (image.metadata.tags && image.metadata.tags.length > 0)) && (
                            <Box sx={{ mt: 1 }}>
                              {image.metadata.caption && (
                                <Typography variant="caption" display="block">
                                  Caption: {image.metadata.caption}
                                </Typography>
                              )}
                              {image.metadata.source && (
                                <Typography variant="caption" display="block">
                                  Source: {image.metadata.source}
                                </Typography>
                              )}
                              {image.metadata.weight !== 1 && (
                                <Typography variant="caption" display="block">
                                  Weight: {image.metadata.weight}
                                </Typography>
                              )}
                              {image.metadata.tags && image.metadata.tags.length > 0 && (
                                <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {image.metadata.tags.map(tag => (
                                    <Chip 
                                      key={tag} 
                                      label={tag} 
                                      size="small" 
                                      variant="outlined"
                                      sx={{ mb: 0.5, fontSize: '0.7rem' }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          )}
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                          <Box>
                            <IconButton size="small" onClick={() => handlePreview(image)}>
                              <ViewIcon />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleOpenImageMetadata(image)}>
                              <EditIcon />
                            </IconButton>
                          </Box>
                          <IconButton size="small" color="error" onClick={() => handleRemoveImage(image.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
          
          {/* Image Metadata Dialog */}
          <Dialog open={imageMetadataOpen} onClose={() => setImageMetadataOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Image Metadata</DialogTitle>
            <DialogContent>
              {selectedImage && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <img 
                      src={selectedImage.previewUrl} 
                      alt={selectedImage.file.name} 
                      style={{ width: '100%', borderRadius: 4 }} 
                    />
                    <Typography variant="caption" color="text.secondary">
                      {selectedImage.file.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Caption"
                        multiline
                        rows={2}
                        placeholder="Describe this image"
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Source"
                        placeholder="Where this image came from"
                        value={imageSource}
                        onChange={(e) => setImageSource(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <Typography gutterBottom>
                        Training Weight: {imageWeight}
                      </Typography>
                      <Slider
                        value={imageWeight}
                        min={0.1}
                        max={2}
                        step={0.1}
                        marks={[
                          { value: 0.5, label: '0.5' },
                          { value: 1, label: '1' },
                          { value: 1.5, label: '1.5' },
                          { value: 2, label: '2' }
                        ]}
                        onChange={(_, newValue) => setImageWeight(newValue as number)}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TextField
                        size="small"
                        label="Add Tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImageTag();
                          }
                        }}
                        sx={{ mr: 1, flexGrow: 1 }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleAddImageTag}
                        disabled={!newTag.trim() || imageTags.includes(newTag.trim())}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {imageTags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          onDelete={() => handleRemoveImageTag(tag)}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setImageMetadataOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveImageMetadata} variant="contained" startIcon={<SaveIcon />}>
                Save Metadata
              </Button>
            </DialogActions>
          </Dialog>
        </TabPanel>
        
        {/* Videos Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Add Video References
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add links to videos that relate to this asset. YouTube and Vimeo links are supported.
              </Typography>
              
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Video URL"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      InputProps={{
                        startAdornment: <LinkIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Title"
                      placeholder="Video title"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description (Optional)"
                      placeholder="Brief description of this video's relevance"
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Timestamp (Optional)"
                      placeholder="E.g., 1:23 or 1m23s"
                      value={videoTimestamp}
                      onChange={(e) => setVideoTimestamp(e.target.value)}
                      helperText="Specify segment of interest (if applicable)"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Source (Optional)"
                      placeholder="E.g., Name of creator or platform"
                      value={videoSource}
                      onChange={(e) => setVideoSource(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddVideoUrl}
                      disabled={!videoUrl.trim()}
                    >
                      Add Video
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Video References ({trainingData.videos.length})
              </Typography>
              
              {trainingData.videos.length === 0 ? (
                <Alert severity="info">
                  No video references added yet. Add video links to provide motion references or examples.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {trainingData.videos.map((video) => (
                    <Grid item xs={12} sm={6} md={4} key={video.id}>
                      <Card sx={{ height: '100%' }}>
                        <Box sx={{ position: 'relative' }}>
                          {video.thumbnailUrl ? (
                            <CardMedia
                              component="img"
                              height="160"
                              image={video.thumbnailUrl}
                              alt={video.title}
                              sx={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <Box 
                              sx={{ 
                                height: 160, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                bgcolor: 'action.selected'
                              }}
                            >
                              <VideoIcon sx={{ fontSize: 60, opacity: 0.7 }} />
                            </Box>
                          )}
                          
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              top: '50%', 
                              left: '50%', 
                              transform: 'translate(-50%, -50%)',
                              zIndex: 2
                            }}
                          >
                            <IconButton 
                              sx={{ 
                                bgcolor: 'rgba(0,0,0,0.6)', 
                                color: 'white',
                                '&:hover': {
                                  bgcolor: 'rgba(0,0,0,0.8)',
                                }
                              }}
                              onClick={() => window.open(video.url, '_blank')}
                            >
                              <PlayIcon />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        <CardContent>
                          <Typography variant="body2" fontWeight="medium" gutterBottom>
                            {video.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {video.type === 'youtube' ? 'YouTube' : video.type === 'vimeo' ? 'Vimeo' : 'Video Link'}
                          </Typography>
                          
                          {video.metadata && (
                            <Box sx={{ mt: 1 }}>
                              {video.metadata.description && (
                                <Typography variant="caption" display="block">
                                  {video.metadata.description}
                                </Typography>
                              )}
                              {video.metadata.timestamp && (
                                <Typography variant="caption" display="block">
                                  Timestamp: {video.metadata.timestamp}
                                </Typography>
                              )}
                              {video.metadata.source && (
                                <Typography variant="caption" display="block">
                                  Source: {video.metadata.source}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'space-between' }}>
                          <Tooltip title="Open in new window">
                            <IconButton 
                              size="small"
                              onClick={() => window.open(video.url, '_blank')}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleRemoveVideo(video.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Other Files Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Other Training Files
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add additional files such as PDFs, audio files, or other reference materials. Drag and drop files or click to select.
              </Typography>
              
              <Paper 
                {...getRootProps()}
                sx={{
                  p: 3,
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  minHeight: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <input {...getInputProps()} />
                <UploadIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to select files (max 20MB per file)
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Other Files ({trainingData.otherFiles.length})
              </Typography>
              
              {trainingData.otherFiles.length === 0 ? (
                <Alert severity="info">
                  No additional files uploaded yet. Add PDFs, audio, or other reference materials to enhance training data.
                </Alert>
              ) : (
                <List>
                  {trainingData.otherFiles.map((file) => (
                    <ListItem 
                      key={file.id}
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFile(file.id)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                      sx={{ 
                        bgcolor: 'background.paper', 
                        mb: 1, 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getFileIconColor(file.type) }}>
                          {getFileTypeIcon(file.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={file.file.name}
                        secondary={`${file.file.type || 'Unknown type'} • ${formatFileSize(file.file.size)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Advanced Tab - Additional Training Information */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Advanced Training Information
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Provide detailed information about training methodology, dataset, model architecture, and evaluation metrics.
                This information helps others understand how this asset was trained or how it should be used in training.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Training Methodology"
                multiline
                rows={3}
                placeholder="Describe the training methodology used (e.g., transfer learning, fine-tuning, etc.)"
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Training Dataset Information"
                multiline
                rows={3}
                placeholder="Describe the dataset used for training (e.g., size, composition, preprocessing)"
                value={datasetInfo}
                onChange={(e) => setDatasetInfo(e.target.value)}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Model Architecture"
                multiline
                rows={3}
                placeholder="Describe the model architecture used (e.g., network type, layers, parameters)"
                value={architecture}
                onChange={(e) => setArchitecture(e.target.value)}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Hyperparameter Information"
                multiline
                rows={3}
                placeholder="List important hyperparameters used for training (e.g., learning rate, batch size, epochs)"
                value={hyperparameters}
                onChange={(e) => setHyperparameters(e.target.value)}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Evaluation Metrics"
                multiline
                rows={3}
                placeholder="Describe how the model was evaluated (e.g., metrics, validation methods, performance)"
                value={evaluation}
                onChange={(e) => setEvaluation(e.target.value)}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                <AlertTitle>Tip: Comprehensive Documentation</AlertTitle>
                Providing detailed training information improves reproducibility and helps others understand how to effectively use this asset in their AI training pipelines.
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewItem?.file?.name || previewItem?.title || 'Preview'}
        </DialogTitle>
        <DialogContent>
          {previewItem && previewItem.type === 'image' && previewItem.previewUrl && (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                width: '100%', 
                maxHeight: '70vh',
                overflow: 'auto'
              }}
            >
              <img 
                src={previewItem.previewUrl} 
                alt={previewItem.file.name} 
                style={{ maxWidth: '100%', maxHeight: '70vh' }} 
              />
            </Box>
          )}
          
          {previewItem && previewItem.type === 'video' && (
            <Box sx={{ width: '100%' }}>
              <video 
                src={previewItem.previewUrl} 
                controls 
                style={{ width: '100%', maxHeight: '70vh' }} 
              />
            </Box>
          )}
          
          {previewItem && previewItem.type === 'audio' && (
            <Box sx={{ width: '100%', p: 2 }}>
              <audio src={previewItem.previewUrl} controls style={{ width: '100%' }} />
            </Box>
          )}
          
          {previewItem && previewItem.url && (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Typography variant="body1" paragraph>
                {previewItem.url}
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<ViewIcon />}
                onClick={() => window.open(previewItem.url, '_blank')}
              >
                Open in New Window
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Helper function to determine icon color based on file type
const getFileIconColor = (fileType: string) => {
  switch (fileType) {
    case 'audio':
      return '#1976d2'; // blue
    case 'video':
      return '#e91e63'; // pink
    case 'prompt':
      return '#4caf50'; // green
    case 'other':
    default:
      return '#ff9800'; // orange
  }
};

// Helper function to get icon based on file type
const getFileTypeIcon = (fileType: string) => {
  switch (fileType) {
    case 'audio':
      return <AudioIcon />;
    case 'video':
      return <VideoIcon />;
    case 'prompt':
      return <TextIcon />;
    case 'other':
    default:
      return <FileIcon />;
  }
};

export default TrainingDataCollection;
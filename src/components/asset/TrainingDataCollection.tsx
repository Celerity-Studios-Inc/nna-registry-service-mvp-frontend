import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  TextField,
  Button,
  Tabs,
  Tab,
  Grid,
  Chip,
  IconButton,
  Alert,
  FormControlLabel,
  Switch,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

// Training data interfaces
interface TrainingPrompt {
  id: string;
  text: string;
  category?: string;
  tags?: string[];
}

interface TrainingImage {
  id: string;
  file?: File;
  url?: string;
  description?: string;
  tags?: string[];
}

interface TrainingVideo {
  id: string;
  url: string;
  description?: string;
  tags?: string[];
}

interface TrainingData {
  isTrainable: boolean;
  prompts: TrainingPrompt[];
  images: TrainingImage[];
  videos: TrainingVideo[];
  documentation?: string;
}

interface TrainingDataProps {
  onChange: (data: TrainingData) => void;
  initialData?: TrainingData;
  isTrainable?: boolean;
}

// Tab panel container
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`training-tabpanel-${index}`}
      aria-labelledby={`training-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Helper function to generate a unique ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 11);
};

// Prompt categories (predefined for demo)
const promptCategories = [
  'General',
  'Description',
  'Generation',
  'Classification',
  'Question',
  'Answer',
  'Instruction',
  'Example',
];

// Tags (predefined for demo)
const commonTags = [
  'ai', 'model', 'training', 'example', 'test', 'production',
  'style', 'genre', 'concept', 'high-quality',
];

const TrainingDataCollection: React.FC<TrainingDataProps> = ({
  onChange,
  initialData,
  isTrainable = true,
}) => {
  // Default training data
  const defaultData: TrainingData = {
    isTrainable: isTrainable,
    prompts: [],
    images: [],
    videos: [],
    documentation: '',
  };

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [trainingData, setTrainingData] = useState<TrainingData>(initialData || defaultData);
  const [promptText, setPromptText] = useState('');
  const [promptCategory, setPromptCategory] = useState<string>('');
  const [promptTags, setPromptTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoTags, setVideoTags] = useState<string[]>([]);

  // Update parent component when training data changes
  useEffect(() => {
    onChange(trainingData);
  }, [trainingData, onChange]);

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Toggle trainable status
  const handleTrainableToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setTrainingData(prev => ({
      ...prev,
      isTrainable: isChecked,
    }));
  };

  // Add a new prompt
  const handleAddPrompt = () => {
    if (!promptText.trim()) return;

    const newPrompt: TrainingPrompt = {
      id: generateId(),
      text: promptText,
      category: promptCategory || undefined,
      tags: promptTags.length > 0 ? promptTags : undefined,
    };

    setTrainingData(prev => ({
      ...prev,
      prompts: [...prev.prompts, newPrompt],
    }));

    // Reset form
    setPromptText('');
    setPromptCategory('');
    setPromptTags([]);
  };

  // Delete a prompt
  const handleDeletePrompt = (id: string) => {
    setTrainingData(prev => ({
      ...prev,
      prompts: prev.prompts.filter(prompt => prompt.id !== id),
    }));
  };

  // Add a video
  const handleAddVideo = () => {
    if (!videoUrl.trim()) return;

    const newVideo: TrainingVideo = {
      id: generateId(),
      url: videoUrl,
      description: videoDescription || undefined,
      tags: videoTags.length > 0 ? videoTags : undefined,
    };

    setTrainingData(prev => ({
      ...prev,
      videos: [...prev.videos, newVideo],
    }));

    // Reset form
    setVideoUrl('');
    setVideoDescription('');
    setVideoTags([]);
  };

  // Delete a video
  const handleDeleteVideo = (id: string) => {
    setTrainingData(prev => ({
      ...prev,
      videos: prev.videos.filter(video => video.id !== id),
    }));
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImages: TrainingImage[] = Array.from(files).map(file => ({
      id: generateId(),
      file: file,
      url: URL.createObjectURL(file),
      tags: [],
    }));

    setTrainingData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  // Delete an image
  const handleDeleteImage = (id: string) => {
    // Revoke object URL to avoid memory leaks
    const image = trainingData.images.find(img => img.id === id);
    if (image && image.url && image.url.startsWith('blob:')) {
      URL.revokeObjectURL(image.url);
    }

    setTrainingData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id),
    }));
  };

  // Update documentation
  const handleDocumentationChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTrainingData(prev => ({
      ...prev,
      documentation: event.target.value,
    }));
  };

  // Add a tag to a prompt
  const handleAddPromptTag = () => {
    if (!newTag.trim()) return;
    if (!promptTags.includes(newTag)) {
      setPromptTags([...promptTags, newTag]);
    }
    setNewTag('');
  };

  // Add a tag to a video
  const handleAddVideoTag = () => {
    if (!newTag.trim()) return;
    if (!videoTags.includes(newTag)) {
      setVideoTags([...videoTags, newTag]);
    }
    setNewTag('');
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Training Data Collection
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Provide training data for this asset that can be used by AI/ML models.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <FormControlLabel
        control={
          <Switch
            checked={trainingData.isTrainable}
            onChange={handleTrainableToggle}
            color="primary"
          />
        }
        label="Asset can be used for model training"
        sx={{ mb: 2 }}
      />

      {!trainingData.isTrainable ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          This asset will not be used for model training. You can toggle this option 
          if you want to provide training data.
        </Alert>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="training data tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Prompts" />
              <Tab label="Images" />
              <Tab label="Videos" />
              <Tab label="Documentation" />
            </Tabs>
          </Box>

          {/* Prompts Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Add Training Prompts
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Enter prompts that can be used to generate or work with this asset.
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Prompt Text"
                    multiline
                    rows={3}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Enter a prompt that can be used with this asset..."
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    freeSolo
                    options={promptCategories}
                    value={promptCategory}
                    onChange={(e, newValue) => setPromptCategory(newValue || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Category (optional)"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      label="Tags (optional)"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddPromptTag}
                      disabled={!newTag}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {promptTags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => {
                          setPromptTags(promptTags.filter((_, i) => i !== index));
                        }}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddPrompt}
                    disabled={!promptText.trim()}
                    startIcon={<AddIcon />}
                  >
                    Add Prompt
                  </Button>
                </Grid>
              </Grid>

              <Typography variant="subtitle1" gutterBottom>
                Saved Prompts
              </Typography>
              {trainingData.prompts.length === 0 ? (
                <Alert severity="info">No prompts added yet</Alert>
              ) : (
                <Box>
                  {trainingData.prompts.map((prompt) => (
                    <Paper
                      key={prompt.id}
                      variant="outlined"
                      sx={{ p: 2, mb: 2, position: 'relative' }}
                    >
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {prompt.text}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          {prompt.category && (
                            <Chip
                              label={prompt.category}
                              color="secondary"
                              size="small"
                              sx={{ mr: 1 }}
                            />
                          )}
                          {prompt.tags?.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5 }}
                            />
                          ))}
                        </Box>
                        <IconButton
                          color="error"
                          onClick={() => handleDeletePrompt(prompt.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </TabPanel>

          {/* Images Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Add Training Images
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Upload images that can be used for training with this asset.
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddIcon />}
                >
                  Upload Images
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </Button>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Saved Images
              </Typography>
              {trainingData.images.length === 0 ? (
                <Alert severity="info">No images added yet</Alert>
              ) : (
                <Grid container spacing={2}>
                  {trainingData.images.map((image) => (
                    <Grid item xs={12} sm={6} md={4} key={image.id}>
                      <Paper variant="outlined" sx={{ p: 2, position: 'relative' }}>
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={image.url}
                            alt="Training"
                            style={{
                              width: '100%',
                              height: '150px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                            }}
                          />
                          <IconButton
                            color="error"
                            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.7)' }}
                            onClick={() => handleDeleteImage(image.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        <Typography variant="body2" noWrap sx={{ mt: 1 }}>
                          {image.file?.name || 'Image'}
                        </Typography>
                        {image.tags && image.tags.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                            {image.tags.map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </TabPanel>

          {/* Videos Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Add Training Videos
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add video URLs that can be used for training with this asset.
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Video URL"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Enter a video URL (YouTube, Vimeo, etc.)"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description (optional)"
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      label="Tags (optional)"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddVideoTag}
                      disabled={!newTag}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {videoTags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => {
                          setVideoTags(videoTags.filter((_, i) => i !== index));
                        }}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddVideo}
                    disabled={!videoUrl.trim()}
                    startIcon={<AddIcon />}
                  >
                    Add Video
                  </Button>
                </Grid>
              </Grid>

              <Typography variant="subtitle1" gutterBottom>
                Saved Videos
              </Typography>
              {trainingData.videos.length === 0 ? (
                <Alert severity="info">No videos added yet</Alert>
              ) : (
                <Box>
                  {trainingData.videos.map((video) => (
                    <Paper
                      key={video.id}
                      variant="outlined"
                      sx={{ p: 2, mb: 2, position: 'relative' }}
                    >
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {video.url}
                      </Typography>
                      {video.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {video.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          {video.tags?.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5 }}
                            />
                          ))}
                        </Box>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteVideo(video.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </TabPanel>

          {/* Documentation Tab */}
          <TabPanel value={activeTab} index={3}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Training Documentation
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Provide additional documentation about how this asset should be used for training.
              </Typography>

              <TextField
                fullWidth
                label="Documentation"
                multiline
                rows={10}
                value={trainingData.documentation || ''}
                onChange={handleDocumentationChange}
                placeholder="Provide instructions, usage examples, or any other relevant documentation for using this asset in model training..."
                variant="outlined"
                sx={{ mb: 3 }}
              />

              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={() => {
                  // Save handled automatically through onChange
                }}
              >
                Save Documentation
              </Button>
            </Box>
          </TabPanel>
        </>
      )}
    </Paper>
  );
};

export default TrainingDataCollection;
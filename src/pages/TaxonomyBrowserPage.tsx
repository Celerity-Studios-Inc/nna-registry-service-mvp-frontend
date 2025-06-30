import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Download as ExportIcon,
  Upload as ImportIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { taxonomyService } from '../services/simpleTaxonomyService';
import { backendTaxonomyService } from '../services/backendTaxonomyService';
import { TaxonomyItem } from '../types/taxonomy.types';
import { logger } from '../utils/logger';
import EnhancedLayerIcon from '../components/common/EnhancedLayerIcon';
import { detectEnvironment } from '../utils/environment.config';

// Use centralized environment detection (hostname-based)
const getCurrentEnvironment = () => {
  return detectEnvironment();
};

// Taxonomy service selection based on user settings
const getTaxonomyService = () => {
  try {
    const useBackendTaxonomy = localStorage.getItem('nna-use-backend-taxonomy');
    if (useBackendTaxonomy === 'true') {
      logger.info('Using backend taxonomy service');
      return backendTaxonomyService;
    }
  } catch (error) {
    logger.warn('Failed to read backend taxonomy setting:', error);
  }
  
  logger.info('Using frontend taxonomy service');
  return taxonomyService;
};

// Helper function to try backend service and fallback to frontend if it fails
const getTaxonomyServiceWithFallback = () => {
  const useBackendTaxonomy = localStorage.getItem('nna-use-backend-taxonomy') === 'true';
  
  if (useBackendTaxonomy) {
    // Return a wrapper that tries backend first, then falls back to frontend
    return {
      async getCategories(layer: string) {
        try {
          logger.info(`Trying backend taxonomy service for layer ${layer} categories`);
          return await backendTaxonomyService.getCategories(layer);
        } catch (error) {
          logger.warn(`Backend taxonomy failed for ${layer} categories, falling back to frontend service:`, error);
          return taxonomyService.getCategories(layer);
        }
      },
      async getSubcategories(layer: string, category: string) {
        try {
          logger.info(`Trying backend taxonomy service for ${layer}.${category} subcategories`);
          return await backendTaxonomyService.getSubcategories(layer, category);
        } catch (error) {
          logger.warn(`Backend taxonomy failed for ${layer}.${category} subcategories, falling back to frontend service:`, error);
          return taxonomyService.getSubcategories(layer, category);
        }
      }
    };
  }
  
  return taxonomyService;
};

// Check if user has admin permissions (placeholder for RBAC)
const hasAdminPermissions = () => {
  // TODO: Implement proper RBAC check
  // For now, allow admin features in development/staging
  const env = getCurrentEnvironment();
  return env === 'development' || env === 'staging';
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ paddingTop: '16px' }}>
    {value === index && children}
  </div>
);

interface LayerOverviewProps {
  onLayerDoubleClick?: (layer: string) => void;
}

const LayerOverview: React.FC<LayerOverviewProps> = ({ onLayerDoubleClick }) => {
  const [layers, setLayers] = useState<string[]>([]);
  const [layerStats, setLayerStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  useEffect(() => {
    const loadLayerData = async () => {
      try {
        // Get all available layers
        const availableLayers = ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'];
        setLayers(availableLayers);

        // Calculate statistics for each layer
        const stats: Record<string, any> = {};
        const currentTaxonomyService = getTaxonomyServiceWithFallback();
        
        for (const layer of availableLayers) {
          try {
            const categoriesResult = currentTaxonomyService.getCategories(layer);
            const categories = Array.isArray(categoriesResult) ? categoriesResult : await categoriesResult;
            let totalSubcategories = 0;
            
            for (const category of categories) {
              // Validate category has a valid code before requesting subcategories
              if (!category || !category.code || category.code === 'undefined') {
                logger.warn(`Skipping invalid category for layer ${layer}:`, category);
                continue;
              }
              
              try {
                const subcategoriesResult = currentTaxonomyService.getSubcategories(layer, category.code);
                const subcategories = Array.isArray(subcategoriesResult) ? subcategoriesResult : await subcategoriesResult;
                totalSubcategories += subcategories.length;
              } catch (subcatError) {
                logger.warn(`Failed to load subcategories for ${layer}.${category.code}:`, subcatError);
                // Continue processing other categories even if one fails
              }
            }

            stats[layer] = {
              categories: categories.length,
              subcategories: totalSubcategories,
              lastUpdated: new Date().toISOString().split('T')[0], // Placeholder
            };
          } catch (error) {
            logger.error(`Error loading stats for layer ${layer}:`, error);
            stats[layer] = {
              categories: 0,
              subcategories: 0,
              error: true,
            };
          }
        }
        
        setLayerStats(stats);
      } catch (error) {
        logger.error('Error loading layer data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLayerData();
  }, []);

  const getLayerName = (layer: string): string => {
    const names: Record<string, string> = {
      G: 'Songs',
      S: 'Stars',
      L: 'Looks',
      M: 'Moves',
      W: 'Worlds',
      B: 'Branded',
      P: 'Personalize',
      T: 'Training Data',
      C: 'Composites',
      R: 'Rights',
    };
    return names[layer] || `Layer ${layer}`;
  };

  const getLayerDescription = (layer: string): string => {
    const descriptions: Record<string, string> = {
      G: 'Music and Audio Assets',
      S: 'Artists and People',
      L: 'Visual Styles and Fashion',
      M: 'Choreography and Dance',
      W: 'Environments and Worlds',
      B: 'Brand Assets and Marketing',
      P: 'User Content and Customization',
      T: 'Machine Learning Data',
      C: 'Combined Multi-Layer Assets',
      R: 'Legal and Licensing',
    };
    return descriptions[layer] || `Layer ${layer} assets`;
  };

  const handleLayerClick = (layer: string) => {
    setSelectedLayer(selectedLayer === layer ? null : layer);
  };

  const handleLayerDoubleClick = (layer: string) => {
    if (onLayerDoubleClick) {
      onLayerDoubleClick(layer);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading taxonomy data...</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {layers.map((layer) => {
        const stats = layerStats[layer] || {};
        const isSelected = selectedLayer === layer;
        
        return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={layer}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                },
                ...(isSelected && {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  borderColor: 'primary.main',
                  borderWidth: 2,
                })
              }}
              onClick={() => handleLayerClick(layer)}
              onDoubleClick={() => handleLayerDoubleClick(layer)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                {/* Enhanced Layer Icon */}
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                  <EnhancedLayerIcon 
                    layer={layer} 
                    width={80} 
                    height={80} 
                    showLabel={false}
                    showBadge={false}
                  />
                </Box>

                {/* Layer Code and Name */}
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {layer}
                </Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {getLayerName(layer)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {getLayerDescription(layer)}
                </Typography>

                {/* Statistics */}
                {!stats.error ? (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 1 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {stats.categories || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Categories
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {stats.subcategories || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Subcategories
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label="Active" 
                      size="small" 
                      color="success"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                ) : (
                  <Alert severity="error" sx={{ mt: 1, fontSize: '0.8rem' }}>
                    Failed to load data
                  </Alert>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <Tooltip title="View Categories">
                    <IconButton size="small" color="primary">
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {hasAdminPermissions() && (
                    <Tooltip title="Edit Layer">
                      <IconButton size="small" color="secondary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="View History">
                    <IconButton size="small">
                      <HistoryIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

interface CategoryBrowserProps {
  initialLayer?: string;
}

const CategoryBrowser: React.FC<CategoryBrowserProps> = ({ initialLayer }) => {
  const [selectedLayer, setSelectedLayer] = useState<string>(initialLayer || 'S');
  const [categories, setCategories] = useState<TaxonomyItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TaxonomyItem | null>(null);
  const [subcategories, setSubcategories] = useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: 'category' | 'subcategory', item: TaxonomyItem } | null>(null);

  const loadCategories = async (layer: string) => {
    setLoading(true);
    setSelectedCategory(null);
    setSubcategories([]);
    try {
      const currentTaxonomyService = getTaxonomyServiceWithFallback();
      const categoryDataResult = currentTaxonomyService.getCategories(layer);
      const categoryData = Array.isArray(categoryDataResult) ? categoryDataResult : await categoryDataResult;
      setCategories(categoryData);
      logger.info(`Loaded ${categoryData.length} categories for layer ${layer}`);
    } catch (error) {
      logger.error(`Error loading categories for layer ${layer}:`, error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = async (layer: string, categoryCode: string) => {
    setLoadingSubcategories(true);
    
    // Validate inputs before making API call
    if (!categoryCode || categoryCode === 'undefined' || categoryCode.trim() === '') {
      logger.error(`Invalid category code provided: "${categoryCode}" for layer ${layer}`);
      setSubcategories([]);
      setLoadingSubcategories(false);
      return;
    }
    
    try {
      const currentTaxonomyService = getTaxonomyServiceWithFallback();
      const subcategoryDataResult = currentTaxonomyService.getSubcategories(layer, categoryCode);
      const subcategoryData = Array.isArray(subcategoryDataResult) ? subcategoryDataResult : await subcategoryDataResult;
      setSubcategories(subcategoryData);
      logger.info(`Loaded ${subcategoryData.length} subcategories for ${layer}.${categoryCode}`);
    } catch (error) {
      logger.error(`Error loading subcategories for ${layer}.${categoryCode}:`, error);
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const handleCategoryClick = (category: TaxonomyItem) => {
    if (selectedCategory?.code === category.code) {
      // Clicking the same category collapses it
      setSelectedCategory(null);
      setSubcategories([]);
    } else {
      // Load subcategories for this category
      setSelectedCategory(category);
      loadSubcategories(selectedLayer, category.code);
    }
  };

  const handleCategoryDoubleClick = (category: TaxonomyItem) => {
    // Double-click automatically expands subcategories
    setSelectedCategory(category);
    loadSubcategories(selectedLayer, category.code);
  };

  // Generate HFN for category (Layer.Category only)
  const generateCategoryHFN = (layer: string, categoryCode: string): string => {
    return `${layer}.${categoryCode}`;
  };

  // Generate HFN for subcategory (Layer.Category.Subcategory)
  const generateSubcategoryHFN = (layer: string, categoryCode: string, subcategoryCode: string): string => {
    return `${layer}.${categoryCode}.${subcategoryCode}`;
  };

  // Generate MFA for category (Layer.Category only)
  const generateCategoryMFA = (layer: string, categoryNumericCode: string): string => {
    const layerNumeric = taxonomyService.getLayerNumericCode(layer);
    return `${layerNumeric}.${categoryNumericCode}`;
  };

  // Generate MFA for subcategory (Layer.Category.Subcategory)
  const generateSubcategoryMFA = (layer: string, categoryNumericCode: string, subcategoryNumericCode: string): string => {
    const layerNumeric = taxonomyService.getLayerNumericCode(layer);
    return `${layerNumeric}.${categoryNumericCode}.${subcategoryNumericCode}`;
  };

  const handleEditClick = (type: 'category' | 'subcategory', item: TaxonomyItem) => {
    setEditingItem({ type, item });
  };

  const handleSaveEdit = () => {
    // TODO: Implement actual save functionality
    logger.info('Save edit functionality to be implemented');
    setEditingItem(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  useEffect(() => {
    loadCategories(selectedLayer);
  }, [selectedLayer]);

  // Handle initialLayer prop changes
  useEffect(() => {
    if (initialLayer && initialLayer !== selectedLayer) {
      setSelectedLayer(initialLayer);
    }
  }, [initialLayer]);

  return (
    <Box>
      {/* Layer Selection */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Select Layer</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'].map((layer) => (
            <Box key={layer} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EnhancedLayerIcon 
                layer={layer} 
                width={32} 
                height={32} 
                showLabel={false}
                showBadge={false}
              />
              <Chip
                label={`${layer} - ${getLayerName(layer)}`}
                variant={selectedLayer === layer ? 'filled' : 'outlined'}
                color={selectedLayer === layer ? 'primary' : 'default'}
                onClick={() => setSelectedLayer(layer)}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Breadcrumb Navigation */}
      {selectedCategory && (
        <Box sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link 
              component="button" 
              variant="body1" 
              onClick={() => {
                setSelectedCategory(null);
                setSubcategories([]);
              }}
              sx={{ textDecoration: 'none' }}
            >
              {selectedLayer} - Categories
            </Link>
            <Typography color="text.primary">
              {selectedCategory.code} - {selectedCategory.name}
            </Typography>
          </Breadcrumbs>
        </Box>
      )}

      {/* Categories View */}
      {!selectedCategory && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Categories for Layer {selectedLayer} ({categories.length})
            </Typography>
            {hasAdminPermissions() && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                size="small"
              >
                Add Category
              </Button>
            )}
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {categories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.code}>
                  <Card 
                    sx={{ 
                      '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleCategoryClick(category)}
                    onDoubleClick={() => handleCategoryDoubleClick(category)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EnhancedLayerIcon 
                          layer={selectedLayer} 
                          width={32} 
                          height={32} 
                          showLabel={false}
                          showBadge={false}
                        />
                        <Box sx={{ ml: 2, flexGrow: 1 }}>
                          <Typography variant="h6" component="div">
                            {category.code}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {category.name}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* HFN and MFA Display */}
                      <Box sx={{ mb: 2 }}>
                        {(() => {
                          const categoryHFN = generateCategoryHFN(selectedLayer, category.code);
                          const categoryMFA = generateCategoryMFA(selectedLayer, category.numericCode);
                          return (
                            <>
                              <Typography variant="caption" display="block" color="text.secondary">
                                HFN: <strong>{categoryHFN}</strong>
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                MFA: <strong>{categoryMFA}</strong>
                              </Typography>
                            </>
                          );
                        })()}
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Chip 
                          label={`Numeric: ${category.numericCode}`} 
                          size="small" 
                          variant="outlined" 
                        />
                        <Box>
                          <Tooltip title="View Subcategories">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCategoryClick(category);
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {hasAdminPermissions() && (
                            <Tooltip title="Edit Category">
                              <IconButton 
                                size="small" 
                                color="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick('category', category);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Subcategories View */}
      {selectedCategory && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Subcategories for {selectedCategory.code} - {selectedCategory.name} ({subcategories.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<BackIcon />}
                onClick={() => {
                  setSelectedCategory(null);
                  setSubcategories([]);
                }}
                size="small"
              >
                Back to Categories
              </Button>
              {hasAdminPermissions() && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  size="small"
                >
                  Add Subcategory
                </Button>
              )}
            </Box>
          </Box>

          {loadingSubcategories ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {subcategories.map((subcategory) => (
                <Grid item xs={12} sm={6} md={4} key={subcategory.code}>
                  <Card 
                    sx={{ 
                      '&:hover': { boxShadow: 3, transform: 'translateY(-1px)' },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EnhancedLayerIcon 
                          layer={selectedLayer} 
                          width={24} 
                          height={24} 
                          showLabel={false}
                          showBadge={false}
                        />
                        <Box sx={{ ml: 2, flexGrow: 1 }}>
                          <Typography variant="h6" component="div">
                            {subcategory.code}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {subcategory.name}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* HFN and MFA Display */}
                      <Box sx={{ mb: 2 }}>
                        {(() => {
                          const subcategoryHFN = generateSubcategoryHFN(selectedLayer, selectedCategory?.code || '', subcategory.code);
                          const subcategoryMFA = generateSubcategoryMFA(selectedLayer, selectedCategory?.numericCode || '', subcategory.numericCode);
                          return (
                            <>
                              <Typography variant="caption" display="block" color="text.secondary">
                                HFN: <strong>{subcategoryHFN}</strong>
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                MFA: <strong>{subcategoryMFA}</strong>
                              </Typography>
                            </>
                          );
                        })()}
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Chip 
                          label={`Numeric: ${subcategory.numericCode}`} 
                          size="small" 
                          variant="outlined" 
                        />
                        <Box>
                          {hasAdminPermissions() && (
                            <Tooltip title="Edit Subcategory">
                              <IconButton 
                                size="small" 
                                color="secondary"
                                onClick={() => handleEditClick('subcategory', subcategory)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={true} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
          <DialogTitle>
            Edit {editingItem.type === 'category' ? 'Category' : 'Subcategory'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Code"
                value={editingItem.item.code}
                margin="normal"
                disabled={!hasAdminPermissions()}
              />
              <TextField
                fullWidth
                label="Name"
                value={editingItem.item.name}
                margin="normal"
                disabled={!hasAdminPermissions()}
              />
              <TextField
                fullWidth
                label="Numeric Code"
                value={editingItem.item.numericCode}
                margin="normal"
                disabled={!hasAdminPermissions()}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelEdit} startIcon={<CancelIcon />}>
              Cancel
            </Button>
            {hasAdminPermissions() && (
              <Button onClick={handleSaveEdit} variant="contained" startIcon={<SaveIcon />}>
                Save Changes
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );

  // Helper function to get layer name (moved inside component to access it)
  function getLayerName(layer: string): string {
    const names: Record<string, string> = {
      G: 'Songs',
      S: 'Stars', 
      L: 'Looks',
      M: 'Moves',
      W: 'Worlds',
      B: 'Branded',
      P: 'Personalize',
      T: 'Training Data',
      C: 'Composites',
      R: 'Rights',
    };
    return names[layer] || `Layer ${layer}`;
  }
};

const AdminTools: React.FC = () => {
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const environment = getCurrentEnvironment();

  if (!hasAdminPermissions()) {
    return (
      <Alert severity="info">
        Admin tools are only available in development and staging environments.
        Current environment: <strong>{environment}</strong>
      </Alert>
    );
  }

  return (
    <Box>
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Admin Mode</strong> - You have administrative permissions in the <strong>{environment}</strong> environment.
          Changes made here will affect the taxonomy structure for all users.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Basic Admin Tools */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Operations
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <RefreshIcon color="primary" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1">Refresh Taxonomy Cache</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reload taxonomy data from the backend service
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ExportIcon color="primary" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1">Export Taxonomy</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Download current taxonomy structure as JSON
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ImportIcon color="primary" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1">Import Taxonomy</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload and validate taxonomy changes
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Advanced Admin Tools */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Advanced Operations
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={showAdvancedFeatures}
                  onChange={(e) => setShowAdvancedFeatures(e.target.checked)}
                />
              }
              label="Enable Advanced Features"
              sx={{ mb: 2 }}
            />

            {showAdvancedFeatures && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <HistoryIcon color="secondary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">Version Control</Typography>
                    <Typography variant="body2" color="text.secondary">
                      View history and rollback changes
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AnalyticsIcon color="secondary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">Usage Analytics</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Analyze taxonomy usage patterns
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SecurityIcon color="secondary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">Permission Management</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Configure user access controls
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Environment Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Environment Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Current Environment</Typography>
                  <Chip 
                    label={environment.toUpperCase()} 
                    color={environment === 'production' ? 'error' : environment === 'staging' ? 'warning' : 'success'}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Taxonomy Service</Typography>
                  <Chip 
                    label={localStorage.getItem('nna-use-backend-taxonomy') === 'true' ? 'Backend API Service' : 'Frontend Service'} 
                    color={localStorage.getItem('nna-use-backend-taxonomy') === 'true' ? 'primary' : 'info'} 
                    sx={{ mt: 1 }} 
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Admin Permissions</Typography>
                  <Chip 
                    label={hasAdminPermissions() ? 'Enabled' : 'Disabled'} 
                    color={hasAdminPermissions() ? 'success' : 'default'}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const TaxonomyBrowserPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLayerForBrowser, setSelectedLayerForBrowser] = useState<string | undefined>(undefined);
  const environment = getCurrentEnvironment();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleLayerDoubleClick = (layer: string) => {
    setSelectedLayerForBrowser(layer);
    setActiveTab(1); // Switch to Category Browser tab
    logger.info(`Navigating to Category Browser for layer ${layer}`);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Taxonomy Browser
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and manage the NNA Registry taxonomy structure across all layers.
          Environment: <strong>{environment}</strong>
        </Typography>
      </Box>

      {/* Environment-specific notices */}
      {environment === 'development' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Development Environment</strong> - All admin features are available. 
          Changes here are safe for testing and will not affect production data.
        </Alert>
      )}
      
      {environment === 'staging' && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Staging Environment</strong> - Admin features available for pre-production testing. 
          Use caution when making changes as this environment may be used for demonstrations.
        </Alert>
      )}

      {environment === 'production' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Production Environment</strong> - Admin features are restricted. 
          Only viewing capabilities are available to prevent accidental changes.
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Layer Overview" />
          <Tab label="Category Browser" />
          <Tab label="Search & Filter" />
          {hasAdminPermissions() && <Tab label="Admin Tools" />}
          <Tab label="API Documentation" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        <LayerOverview onLayerDoubleClick={handleLayerDoubleClick} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <CategoryBrowser initialLayer={selectedLayerForBrowser} />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Search & Filter</Typography>
          <Typography variant="body2" color="text.secondary">
            Advanced search and filtering capabilities coming soon...
          </Typography>
        </Paper>
      </TabPanel>

      {hasAdminPermissions() && (
        <TabPanel value={activeTab} index={hasAdminPermissions() ? 3 : -1}>
          <AdminTools />
        </TabPanel>
      )}

      <TabPanel value={activeTab} index={hasAdminPermissions() ? 4 : 3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>API Documentation</Typography>
          <Typography variant="body2" color="text.secondary">
            Taxonomy service API documentation and examples coming soon...
          </Typography>
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default TaxonomyBrowserPage;
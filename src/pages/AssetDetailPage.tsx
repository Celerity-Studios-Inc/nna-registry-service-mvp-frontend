import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tabs,
  Tab,
  Alert,
  Skeleton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Badge,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CloudDownload as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Image as ImageIcon,
  Description as DocumentIcon,
  Code as CodeIcon,
  Folder as FolderIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import MediaPlayer, { formatFileSize } from '../components/asset/MediaPlayer';
import AssetService from '../services/api/asset.service';
import { Asset, CreateVersionRequest, AssetRights } from '../types/asset.types';
import taxonomyService from '../api/taxonomyService';
import VersionHistory from '../components/asset/VersionHistory';
import RecommendedAssets from '../components/asset/RecommendedAssets';
import RightsManagement from '../components/asset/RightsManagement';

// Interface for tab panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface AssetFile {
  size: number;
  type: string;
  url: string;
}

// Tab Panel component
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`asset-tabpanel-${index}`}
      aria-labelledby={`asset-tab-${index}`}
      {...other}
      style={{ minHeight: '300px' }}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

// Get file icon based on file type
const getFileIcon = (contentType: string) => {
  if (contentType.startsWith('audio/')) {
    return <AudioIcon color="primary" />;
  } else if (contentType.startsWith('video/')) {
    return <VideoIcon color="secondary" />;
  } else if (contentType.startsWith('image/')) {
    return <ImageIcon color="success" />;
  } else if (contentType === 'application/pdf' || contentType.includes('document')) {
    return <DocumentIcon color="warning" />;
  } else if (
    contentType.includes('text') ||
    contentType.includes('json') ||
    contentType.includes('xml')
  ) {
    return <CodeIcon color="info" />;
  } else {
    return <FolderIcon />;
  }
};

// Helper to get file metadata
// const getFileMetadata = (file: AssetFile) => {
//   const metadata: Record<string, any> = {};

//   // Add any specific metadata based on file type
//   if (file.contentType.startsWith('audio/')) {
//     metadata.format = file.contentType.split('/')[1].toUpperCase();
//     metadata.bitrate = '320 kbps'; // Example, should come from actual metadata
//   }

//   return metadata;
// };

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State
  const [asset, setAsset] = useState<Asset | null>(null);
  const [assetRights, setAssetRights] = useState<AssetRights | null>(null);

  const [assetFile, setAssetFile] = useState<AssetFile | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [rightsLoading, setRightsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [currentVersionNumber, setCurrentVersionNumber] = useState<string | null>(null);
  const [createVersionDialogOpen, setCreateVersionDialogOpen] = useState<boolean>(false);
  const [versionMessage, setVersionMessage] = useState<string>('');
  const [versionChanges, setVersionChanges] = useState<File[]>([]);
  const [versionLoading, setVersionLoading] = useState<boolean>(false);

  // Check user permissions
  const isAdmin = user?.role === 'admin';
  const canEdit = isAdmin || user?.id === asset?.registeredBy;

  // Load asset data
  useEffect(() => {
    const loadAsset = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error('Asset ID is required');

        const loadedAsset = await AssetService.getAssetById(id);
        if (loadedAsset.gcpStorageUrl) {
          const asset = await fetchMedia(loadedAsset.gcpStorageUrl);

          setAssetFile(asset as AssetFile);
        }

        setAsset(loadedAsset);

        // Set the current version number
        if (loadedAsset.version) {
          setCurrentVersionNumber(loadedAsset?.version?.number);
        }

        // Load rights information
        await loadRightsInformation(loadedAsset.id);

        setError(null);
      } catch (err) {
        console.error('Error loading asset:', err);
        setError(err instanceof Error ? err.message : 'Failed to load asset');
      } finally {
        setLoading(false);
      }
    };

    loadAsset();
  }, [id]);

  const fetchMedia = async (gcpStorageUrl: string) => {
    try {
      const file = await fetch(gcpStorageUrl);

      const blob = await file.blob();

      return {
        size: blob.size,
        type: blob.type,
        url: gcpStorageUrl,
      };
    } catch (error) {
      console.log(error);
    }
  };

  // Load rights information
  const loadRightsInformation = async (assetId: string) => {
    try {
      setRightsLoading(true);
      // const rights = await rightsService.getAssetRights(assetId);
      // setAssetRights(rights);
    } catch (err) {
      console.error('Error loading rights information:', err);
      // Don't set error here to avoid blocking main asset display
    } finally {
      setRightsLoading(false);
    }
  };

  // Tab change handler
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // File selection handler
  const handleFileSelect = (index: number) => {
    setSelectedFileIndex(index);
  };

  // Navigate between files
  const handlePreviousFile = () => {
    if (asset?.files && selectedFileIndex > 0) {
      setSelectedFileIndex(selectedFileIndex - 1);
    }
  };

  const handleNextFile = () => {
    if (asset?.files && selectedFileIndex < asset.files.length - 1) {
      setSelectedFileIndex(selectedFileIndex + 1);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get full taxonomy path
  const getFullTaxonomyPath = (asset: Asset) => {
    if (!asset?.layer) return '';

    return taxonomyService.getTaxonomyPath(asset.layer, asset.category, asset.subcategory);
  };

  // Handle version change
  const handleVersionChange = async (versionNumber: string) => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // If switching back to current version
      if (versionNumber === asset?.version?.number) {
        // Just refresh the current asset
        const currentAsset = await AssetService.getAssetById(id);
        setAsset(currentAsset);
        setCurrentVersionNumber(currentAsset?.version?.number || '');
      } else {
        // Get the specific version
        const versionedAsset = await AssetService.getAssetVersion(id, versionNumber);
        setAsset(versionedAsset);
        setCurrentVersionNumber(versionNumber);
      }
    } catch (err) {
      console.error('Error changing version:', err);
      setError(err instanceof Error ? err.message : 'Failed to load version');
    } finally {
      setLoading(false);
    }
  };

  // Handle creating a new version
  const handleCreateVersion = () => {
    setVersionMessage('');
    setVersionChanges([]);
    setCreateVersionDialogOpen(true);
  };

  // Submit new version
  const submitNewVersion = async () => {
    if (!id || !versionMessage.trim()) return;

    try {
      setVersionLoading(true);

      const request: CreateVersionRequest = {
        assetId: id,
        message: versionMessage,
        files: versionChanges.length > 0 ? versionChanges : undefined,
      };

      const updatedAsset = await AssetService.createVersion(request);
      setAsset(updatedAsset);
      setCurrentVersionNumber(updatedAsset?.version?.number || '');
      setCreateVersionDialogOpen(false);
    } catch (err) {
      console.error('Error creating new version:', err);
      setError(err instanceof Error ? err.message : 'Failed to create new version');
    } finally {
      setVersionLoading(false);
    }
  };

  // Refresh asset data
  const refreshAsset = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const refreshedAsset = await AssetService.getAssetById(id);
      setAsset(refreshedAsset);

      // If we were viewing a specific version, switch back to the current version
      setCurrentVersionNumber(refreshedAsset?.version?.number || '');

      // Refresh rights information as well
      await loadRightsInformation(refreshedAsset.name);

      setError(null);
    } catch (err) {
      console.error('Error refreshing asset:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh asset');
    } finally {
      setLoading(false);
    }
  };

  // Handle rights updates
  const handleRightsUpdated = (updatedRights: AssetRights) => {
    setAssetRights(updatedRights);

    // If the asset has rights information attached directly, update that too
    if (asset && asset.rights) {
      setAsset({
        ...asset,
        rights: updatedRights,
      });
    }
  };

  // Render loading skeleton
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 3 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <Skeleton variant="text" width={100} height={40} sx={{ mr: 2 }} />
            <Skeleton variant="text" width="50%" height={40} />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" height={300} />
              <Box sx={{ mt: 3 }}>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="70%" />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  }

  // Render error state
  if (error || !asset) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Asset not found'}
          </Alert>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} component={Link} to="/assets">
            Return to Assets
          </Button>
        </Box>
      </Container>
    );
  }

  // Get selected file
  const selectedFile =
    asset.files && asset.files.length > 0 ? asset.files[selectedFileIndex] : null;

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ my: 3 }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            component={Link}
            to="/assets"
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            {asset.name}
          </Typography>

          {/* Version indicator */}
          {currentVersionNumber && asset.version && (
            <Chip
              size="small"
              icon={<HistoryIcon />}
              label={`v${asset?.version?.number}`}
              color={currentVersionNumber !== asset?.version?.number ? 'secondary' : 'default'}
              sx={{ ml: 2 }}
              onClick={() => setTabValue(3)} // Switch to versions tab
            />
          )}
        </Box>
        <Box display="flex" alignItems="center" flexWrap="wrap">
          <Chip label={asset.layer} color="primary" variant="outlined" sx={{ mr: 1, mb: 1 }} />
          {asset.category && (
            <Chip label={getFullTaxonomyPath(asset)} variant="outlined" sx={{ mr: 1, mb: 1 }} />
          )}
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
            NNA: {asset.nna_address}
          </Typography>

          {/* Show indicator if viewing an older version */}
          {currentVersionNumber &&
            asset.version &&
            currentVersionNumber !== asset?.version?.number && (
              <Chip
                label="Viewing older version"
                color="warning"
                size="small"
                icon={<WarningIcon />}
                sx={{ ml: 1, mb: 1 }}
              />
            )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content Area */}
        <Grid item xs={12} md={8}>
          <Card>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="asset tabs"
              variant={isMobile ? 'scrollable' : 'fullWidth'}
              scrollButtons={isMobile ? 'auto' : false}
            >
              <Tab label="Overview" id="asset-tab-0" aria-controls="asset-tabpanel-0" />

              {asset.files && asset.files.length > 0 && (
                <Tab
                  label={`Files (${asset.files.length})`}
                  id="asset-tab-1"
                  aria-controls="asset-tabpanel-1"
                />
              )}

              <Tab label="Metadata" id="asset-tab-2" aria-controls="asset-tabpanel-2" />

              <Tab
                label="Versions"
                id="asset-tab-3"
                aria-controls="asset-tabpanel-3"
                icon={
                  currentVersionNumber !== asset?.version?.number ? (
                    <Badge color="secondary" variant="dot">
                      <HistoryIcon />
                    </Badge>
                  ) : undefined
                }
                iconPosition="end"
              />

              <Tab label="Recommendations" id="asset-tab-4" aria-controls="asset-tabpanel-4" />

              <Tab label="Rights Management" id="asset-tab-5" aria-controls="asset-tabpanel-5" />
            </Tabs>

            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {asset.description || 'No description available.'}
                </Typography>

                {asset.tags && asset.tags.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Tags
                    </Typography>
                    <Box>
                      {asset.tags.map(tag => (
                        <Chip key={tag} label={tag} sx={{ mr: 0.5, mb: 0.5 }} size="small" />
                      ))}
                    </Box>
                  </>
                )}

                {assetFile && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
                      Preview
                    </Typography>

                    <Box sx={{ position: 'relative' }}>
                      <MediaPlayer
                        fileUrl={assetFile.url}
                        fileName={assetFile.url}
                        fileType={assetFile.type}
                        fileSize={assetFile.size}
                        thumbnailUrl={assetFile.url}
                        // metadata={getFileMetadata(selectedFile)}
                        hasNext={asset.files && selectedFileIndex < asset.files.length - 1}
                        hasPrevious={selectedFileIndex > 0}
                        onNext={handleNextFile}
                        onPrevious={handlePreviousFile}
                        height={400}
                      />

                      {asset.files && asset.files.length > 1 && (
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mt: 1,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Showing file {selectedFileIndex + 1} of {asset.files.length}
                          </Typography>

                          <Box>
                            <Button
                              startIcon={<PrevIcon />}
                              disabled={selectedFileIndex === 0}
                              onClick={handlePreviousFile}
                              size="small"
                            >
                              Previous
                            </Button>
                            <Button
                              endIcon={<NextIcon />}
                              disabled={selectedFileIndex === asset.files.length - 1}
                              onClick={handleNextFile}
                              size="small"
                              sx={{ ml: 1 }}
                            >
                              Next
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </>
                )}

                {/* Similar Assets Section in Overview */}
                <Box sx={{ mt: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Similar Assets</Typography>
                    <Button
                      size="small"
                      onClick={() => setTabValue(4)} // Switch to Recommendations tab
                    >
                      View All Recommendations
                    </Button>
                  </Box>
                  <RecommendedAssets
                    asset={asset}
                    limit={4}
                    showFilters={false}
                    onAssetClick={() => window.scrollTo(0, 0)}
                  />
                </Box>
              </CardContent>
            </TabPanel>

            {/* Files Tab */}
            <TabPanel value={tabValue} index={1}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Files
                </Typography>

                {!asset.files || asset.files.length === 0 ? (
                  <Alert severity="info">This asset does not have any associated files.</Alert>
                ) : (
                  <>
                    {/* File list */}
                    <List sx={{ mb: 4 }}>
                      {asset.files.map((file, index) => (
                        <ListItem
                          key={file.id}
                          button
                          selected={selectedFileIndex === index}
                          onClick={() => handleFileSelect(index)}
                          sx={{
                            borderRadius: 1,
                            mb: 1,
                            '&.Mui-selected': {
                              backgroundColor: theme.palette.action.selected,
                              '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                              },
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar>{getFileIcon(file.contentType)}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={file.filename}
                            secondary={`${file.contentType} • ${formatFileSize(file.size)}`}
                            primaryTypographyProps={{
                              noWrap: true,
                              sx: { maxWidth: { xs: '180px', sm: '250px', md: '400px' } },
                            }}
                          />
                          <ListItemSecondaryAction>
                            <Tooltip title="Download">
                              <IconButton
                                edge="end"
                                href={file.url}
                                download={file.filename}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="download"
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>

                    {/* Preview of selected file */}
                    {selectedFile && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Preview: {selectedFile.filename}
                        </Typography>
                        <MediaPlayer
                          fileUrl={selectedFile.url}
                          fileName={selectedFile.filename}
                          fileType={selectedFile.contentType}
                          fileSize={selectedFile.size}
                          thumbnailUrl={selectedFile.thumbnailUrl}
                          // metadata={getFileMetadata(selectedFile)}
                          hasNext={asset.files && selectedFileIndex < asset.files.length - 1}
                          hasPrevious={selectedFileIndex > 0}
                          onNext={handleNextFile}
                          onPrevious={handlePreviousFile}
                          height={400}
                        />
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </TabPanel>

            {/* Metadata Tab */}
            <TabPanel value={tabValue} index={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Metadata
                </Typography>

                {!asset.metadata || Object.keys(asset.metadata).length === 0 ? (
                  <Alert severity="info">This asset does not have any additional metadata.</Alert>
                ) : (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      {Object.entries(asset.metadata).map(([key, value]) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <Typography variant="subtitle2" color="text.secondary">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </Typography>
                          <Typography variant="body1">
                            {typeof value === 'object'
                              ? JSON.stringify(value, null, 2)
                              : String(value)}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                )}

                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    System Information
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Asset ID
                        </Typography>
                        <Typography variant="body1">{asset._id}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          NNA Address
                        </Typography>
                        <Typography variant="body1">{asset.nna_address}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Created
                        </Typography>
                        <Typography variant="body1">{formatDate(asset.createdAt || '')}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Last Updated
                        </Typography>
                        <Typography variant="body1">{formatDate(asset.updatedAt || '')}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Created By
                        </Typography>
                        <Typography variant="body1">{asset.registeredBy}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              </CardContent>
            </TabPanel>

            {/* Versions Tab */}
            <TabPanel value={tabValue} index={3}>
              <CardContent>
                {/* Display version warning if viewing older version */}
                {currentVersionNumber !== asset?.version?.number && (
                  <Alert
                    severity="warning"
                    sx={{ mb: 3 }}
                    action={
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => handleVersionChange(asset?.version?.number || '')}
                      >
                        Switch to Current
                      </Button>
                    }
                  >
                    You are viewing version {currentVersionNumber} (current version is{' '}
                    {asset?.version?.number})
                  </Alert>
                )}

                <VersionHistory
                  asset={asset}
                  onVersionChange={handleVersionChange}
                  onCreateVersion={handleCreateVersion}
                  refreshAsset={refreshAsset}
                />
              </CardContent>
            </TabPanel>

            {/* Recommendations Tab */}
            <TabPanel value={tabValue} index={4}>
              <CardContent>
                <RecommendedAssets
                  asset={asset}
                  limit={8}
                  showFilters={true}
                  onAssetClick={() => window.scrollTo(0, 0)}
                />
              </CardContent>
            </TabPanel>

            {/* Rights Management Tab */}
            <TabPanel value={tabValue} index={5}>
              <CardContent>
                {rightsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : assetRights ? (
                  <RightsManagement
                    asset={asset}
                    rights={assetRights}
                    onRightsUpdated={handleRightsUpdated}
                    readOnly={!canEdit}
                  />
                ) : (
                  <Alert severity="info">
                    No rights management information is available for this asset.
                  </Alert>
                )}
              </CardContent>
            </TabPanel>

            {canEdit && (
              <CardActions
                sx={{
                  borderTop: `1px solid ${theme.palette.divider}`,
                  justifyContent: 'flex-end',
                  px: 2,
                  py: 1.5,
                }}
              >
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/assets/edit/${asset.id}`)}
                  color="primary"
                >
                  Edit Asset
                </Button>
                {isAdmin && (
                  <Button
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={() => {
                      // Implement delete confirmation and handling
                      alert('Delete functionality not implemented yet');
                    }}
                  >
                    Delete
                  </Button>
                )}
              </CardActions>
            )}
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Asset Information
                </Typography>

                {/* Rights status chip */}
                {assetRights && (
                  <Tooltip
                    title={`Rights Status: ${
                      assetRights.status.charAt(0).toUpperCase() + assetRights.status.slice(1)
                    }`}
                    arrow
                  >
                    <Chip
                      label={
                        assetRights.status.charAt(0).toUpperCase() + assetRights.status.slice(1)
                      }
                      color={
                        assetRights.status === 'verified'
                          ? 'success'
                          : assetRights.status === 'partial'
                          ? 'info'
                          : assetRights.status === 'pending'
                          ? 'warning'
                          : assetRights.status === 'rejected' || assetRights.status === 'expired'
                          ? 'error'
                          : 'default'
                      }
                      size="small"
                      onClick={() => setTabValue(5)} // Switch to Rights Management tab
                    />
                  </Tooltip>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                  {asset.name}
                </Typography>
              </Box>

              {asset.layer === 'C' && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Components
                  </Typography>
                  <Stack mt={1} flexDirection="row" flexWrap="wrap" gap={1}>
                    {asset.components?.map(item => (
                      <Chip label={item} />
                    ))}
                  </Stack>
                </Box>
              )}

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  NNA Address
                </Typography>
                <Typography variant="body1">{asset.nna_address}</Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Layer
                </Typography>
                <Typography variant="body1">{asset.layer}</Typography>
              </Box>

              {asset.category && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">{asset.category}</Typography>
                </Box>
              )}

              {asset.subcategory && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Subcategory
                  </Typography>
                  <Typography variant="body1">{asset.subcategory}</Typography>
                </Box>
              )}

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">{formatDate(asset?.createdAt || '')}</Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">{formatDate(asset?.updatedAt || '')}</Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created By
                </Typography>
                <Typography variant="body1">{asset.registeredBy}</Typography>
              </Box>

              {asset.files && asset.files.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Files
                  </Typography>
                  <Typography variant="body1">
                    {asset.files.length} file{asset.files.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              )}

              {/* Rights Information Summary */}
              {assetRights && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box mb={1}>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      Rights Information
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => setTabValue(5)}
                        sx={{ ml: 1 }}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Typography>

                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Commercial Use
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          variant="body2"
                          color={assetRights.commercialUse ? 'success.main' : 'error.main'}
                        >
                          {assetRights.commercialUse ? 'Allowed' : 'Not Allowed'}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Derivative Works
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          variant="body2"
                          color={assetRights.derivativeWorks ? 'success.main' : 'error.main'}
                        >
                          {assetRights.derivativeWorks ? 'Allowed' : 'Not Allowed'}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Attribution
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          variant="body2"
                          color={!assetRights.attributionRequired ? 'success.main' : 'warning.main'}
                        >
                          {assetRights.attributionRequired ? 'Required' : 'Not Required'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        {assetRights.clearances && assetRights.clearances.length > 0 ? (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {assetRights.clearances.length} clearance record
                            {assetRights.clearances.length !== 1 ? 's' : ''}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No clearance records
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Box>

                  <Button variant="outlined" size="small" fullWidth onClick={() => setTabValue(5)}>
                    View Rights Management
                  </Button>
                </>
              )}
            </CardContent>

            {asset.files && asset.files.length > 0 && (
              <CardActions sx={{ borderTop: `1px solid ${theme.palette.divider}`, px: 2, py: 1.5 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  component={Link}
                  to={asset.files[0].url}
                  target="_blank"
                  download
                >
                  Download Primary File
                </Button>
              </CardActions>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Create Version Dialog */}
      <Dialog
        open={createVersionDialogOpen}
        onClose={() => !versionLoading && setCreateVersionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Version</DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Create a new version of this asset. Include a description of the changes you're making.
          </DialogContentText>

          <TextField
            autoFocus
            margin="dense"
            label="Version Message"
            fullWidth
            required
            value={versionMessage}
            onChange={e => setVersionMessage(e.target.value)}
            disabled={versionLoading}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Upload New Files (Optional)
          </Typography>

          <Box sx={{ mb: 2 }}>
            <input
              accept="*/*"
              id="upload-version-files"
              type="file"
              multiple
              onChange={e => {
                if (e.target.files) {
                  setVersionChanges(Array.from(e.target.files));
                }
              }}
              style={{ display: 'none' }}
              disabled={versionLoading}
            />
            <label htmlFor="upload-version-files">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AddIcon />}
                disabled={versionLoading}
              >
                Add Files
              </Button>
            </label>
          </Box>

          {/* Display selected files */}
          {versionChanges.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Files ({versionChanges.length}):
              </Typography>
              <List dense>
                {versionChanges.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar>
                        {file.type.startsWith('image') ? (
                          <ImageIcon />
                        ) : file.type.startsWith('audio') ? (
                          <AudioIcon />
                        ) : file.type.startsWith('video') ? (
                          <VideoIcon />
                        ) : (
                          <DocumentIcon />
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={file.name}
                      secondary={`${file.type || 'Unknown type'} - ${formatFileSize(file.size)}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => {
                          const newFiles = [...versionChanges];
                          newFiles.splice(index, 1);
                          setVersionChanges(newFiles);
                        }}
                        disabled={versionLoading}
                      >
                        <CloseIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateVersionDialogOpen(false)} disabled={versionLoading}>
            Cancel
          </Button>
          <Button
            onClick={submitNewVersion}
            variant="contained"
            disabled={versionLoading || !versionMessage.trim()}
            startIcon={versionLoading ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {versionLoading ? 'Creating...' : 'Create Version'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssetDetail;

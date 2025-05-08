import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Slider,
  LinearProgress,
  Tooltip,
  Card,
  CardMedia,
  CardContent,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Button,
  Grid,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  CloudDownload,
  Fullscreen,
  SkipNext,
  SkipPrevious,
  Lyrics,
  Info,
  BrokenImage,
  VideocamOff,
  MusicOff,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Types for the media player component
export interface MediaPlayerProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  showControls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  width?: string | number;
  height?: string | number;
  metadata?: Record<string, any>;
}

// Styled components
const PlayerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

const MediaControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  padding: theme.spacing(1, 2),
  display: 'flex',
  flexDirection: 'column',
  transition: 'opacity 0.3s ease',
  backdropFilter: 'blur(5px)',
}));

const ErrorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.common.white,
  height: '100%',
  padding: theme.spacing(3),
}));

/**
 * FormatTime - Helper function to format seconds into MM:SS
 */
const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '00:00';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

/**
 * FormatFileSize - Helper function to format file size in bytes to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * MediaPlayer Component - Handles different media types with appropriate controls
 */
const MediaPlayer: React.FC<MediaPlayerProps> = ({
  fileUrl,
  fileName,
  fileType,
  fileSize,
  thumbnailUrl,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  showControls = true,
  autoPlay = false,
  loop = false,
  width = '100%',
  height = 'auto',
  metadata = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Refs for media elements
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // State for player
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(showControls);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mediaInfo, setMediaInfo] = useState<Record<string, any>>({});

  // Determine media type
  const isAudio = fileType.startsWith('audio/');
  const isVideo = fileType.startsWith('video/');
  const isImage = fileType.startsWith('image/');
  const isPdf = fileType === 'application/pdf';
  const isText =
    fileType.startsWith('text/') || fileType === 'application/json';
  const isUnknown = !isAudio && !isVideo && !isImage && !isPdf && !isText;

  // Media event handlers
  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleLoadMetadata = (
    e: React.SyntheticEvent<HTMLAudioElement | HTMLVideoElement>
  ) => {
    const target = e.target as HTMLAudioElement | HTMLVideoElement;
    setDuration(target.duration || 0);

    // Extract media info
    const info: Record<string, any> = {
      duration: target.duration ? formatTime(target.duration) : 'Unknown',
    };

    if (isVideo && videoRef.current) {
      info.dimensions = `${videoRef.current.videoWidth} × ${videoRef.current.videoHeight}`;
      info.aspectRatio = (
        videoRef.current.videoWidth / videoRef.current.videoHeight
      ).toFixed(2);
    }

    setMediaInfo({ ...info, ...metadata });
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    setLoadProgress(100);
  };

  const handleProgress = (
    e: React.SyntheticEvent<HTMLAudioElement | HTMLVideoElement>
  ) => {
    const target = e.target as HTMLAudioElement | HTMLVideoElement;
    if (target.buffered.length > 0) {
      const bufferedEnd = target.buffered.end(target.buffered.length - 1);
      const duration = target.duration;
      if (duration > 0) {
        setLoadProgress((bufferedEnd / duration) * 100);
      }
    }
  };

  const handleTimeUpdate = (
    e: React.SyntheticEvent<HTMLAudioElement | HTMLVideoElement>
  ) => {
    const target = e.target as HTMLAudioElement | HTMLVideoElement;
    setCurrentTime(target.currentTime);
  };

  const handleError = (
    e: React.SyntheticEvent<
      HTMLAudioElement | HTMLVideoElement | HTMLImageElement
    >
  ) => {
    setIsLoading(false);
    setError(
      `Failed to load ${isAudio ? 'audio' : isVideo ? 'video' : 'media'}`
    );
    console.error('Media error:', e);
  };

  // Image specific handlers
  const handleImageLoad = () => {
    console.log('ergerge');

    setIsLoading(false);

    // Extract image info
    if (imageRef.current) {
      const info = {
        dimensions: `${imageRef.current.naturalWidth} × ${imageRef.current.naturalHeight}`,
        aspectRatio: (
          imageRef.current.naturalWidth / imageRef.current.naturalHeight
        ).toFixed(2),
      };
      setMediaInfo({ ...info, ...metadata });
    }
  };

  // Control handlers
  const togglePlay = () => {
    if (isAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (isVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (_event: Event, newValue: number | number[]) => {
    const seekTime = typeof newValue === 'number' ? newValue : newValue[0];
    if (isAudio && audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    } else if (isVideo && videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    const newVolume = typeof newValue === 'number' ? newValue : newValue[0];
    setVolume(newVolume / 100);

    if (isAudio && audioRef.current) {
      audioRef.current.volume = newVolume / 100;
      setIsMuted(newVolume === 0);
    } else if (isVideo && videoRef.current) {
      videoRef.current.volume = newVolume / 100;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (isAudio && audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    } else if (isVideo && videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const enterFullScreen = () => {
    if (isVideo && videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Update the audio/video element when props change
  useEffect(() => {
    if (isAudio && audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
      audioRef.current.loop = loop;

      if (autoPlay) {
        audioRef.current.play().catch(e => {
          console.warn('Autoplay prevented:', e);
        });
      }
    } else if (isVideo && videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
      videoRef.current.loop = loop;

      if (autoPlay) {
        videoRef.current.play().catch(e => {
          console.warn('Autoplay prevented:', e);
        });
      }
    }
  }, [fileUrl, autoPlay, loop, isAudio, isVideo, volume, isMuted]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (isAudio && audioRef.current) {
        audioRef.current.pause();
      } else if (isVideo && videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [isAudio, isVideo]);

  // Hide controls after inactivity for video
  useEffect(() => {
    if (!showControls || !isVideo) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      setControlsVisible(true);

      timeoutId = setTimeout(() => {
        if (isPlaying) {
          setControlsVisible(false);
        }
      }, 3000);
    };

    resetTimeout();

    const handleMouseMove = () => resetTimeout();
    const handleMouseLeave = () => {
      clearTimeout(timeoutId);
      if (isPlaying) {
        setControlsVisible(false);
      }
    };

    const container = document.getElementById('media-player-container');
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      clearTimeout(timeoutId);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isPlaying, showControls, isVideo]);

  // Render appropriate media player based on file type
  const renderPlayer = () => {
    if (error) {
      return (
        <ErrorContainer
          style={{ width, height: typeof height === 'number' ? height : 240 }}
        >
          {isAudio && <MusicOff fontSize="large" sx={{ mb: 2 }} />}
          {isVideo && <VideocamOff fontSize="large" sx={{ mb: 2 }} />}
          {isImage && <BrokenImage fontSize="large" sx={{ mb: 2 }} />}
          {!isAudio && !isVideo && !isImage && (
            <Info fontSize="large" sx={{ mb: 2 }} />
          )}
          <Typography variant="body1" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {fileName} ({formatFileSize(fileSize)})
          </Typography>
        </ErrorContainer>
      );
    }

    if (isAudio) {
      return (
        <Card
          sx={{
            width,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          {thumbnailUrl ? (
            <CardMedia
              component="img"
              sx={{
                width: { xs: '100%', sm: 140 },
                height: { xs: 140, sm: 140 },
              }}
              image={thumbnailUrl}
              alt={fileName}
            />
          ) : (
            <Box
              sx={{
                width: { xs: '100%', sm: 140 },
                height: { xs: 140, sm: 140 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              }}
            >
              <Lyrics sx={{ fontSize: 48 }} />
            </Box>
          )}

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              p: 2,
            }}
          >
            <Typography component="div" variant="h6" noWrap sx={{ mb: 1 }}>
              {fileName}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              {hasPrevious && (
                <IconButton onClick={onPrevious} size="small">
                  <SkipPrevious />
                </IconButton>
              )}

              <IconButton onClick={togglePlay} sx={{ mx: hasPrevious ? 1 : 0 }}>
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>

              {hasNext && (
                <IconButton onClick={onNext} size="small">
                  <SkipNext />
                </IconButton>
              )}

              <Box sx={{ mx: 2, flexGrow: 1 }}>
                <Slider
                  size="small"
                  min={0}
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Time"
                />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(currentTime)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(duration)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={toggleMute} size="small">
                  {isMuted ? <VolumeOff /> : <VolumeUp />}
                </IconButton>

                {!isMobile && (
                  <Box sx={{ width: 80, ml: 1 }}>
                    <Slider
                      size="small"
                      min={0}
                      max={100}
                      value={isMuted ? 0 : volume * 100}
                      onChange={handleVolumeChange}
                      aria-label="Volume"
                    />
                  </Box>
                )}

                <Tooltip title="Download">
                  <IconButton
                    href={fileUrl}
                    download={fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    <CloudDownload />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <audio
              ref={audioRef}
              src={fileUrl}
              onLoadStart={handleLoadStart}
              onLoadedMetadata={handleLoadMetadata}
              onLoadedData={handleLoadedData}
              onTimeUpdate={handleTimeUpdate}
              onProgress={handleProgress}
              onError={handleError}
              style={{ display: 'none' }}
            />

            {loadProgress < 100 && (
              <LinearProgress
                variant="determinate"
                value={loadProgress}
                sx={{ height: 3, borderRadius: 3 }}
              />
            )}
          </Box>
        </Card>
      );
    }

    if (isVideo) {
      return (
        <PlayerContainer
          id="media-player-container"
          sx={{
            width,
            height: typeof height === 'number' ? height : 'auto',
            backgroundColor: 'black',
          }}
        >
          <video
            ref={videoRef}
            src={fileUrl}
            poster={thumbnailUrl}
            style={{ width: '100%', height: '100%', display: 'block' }}
            onLoadStart={handleLoadStart}
            onLoadedMetadata={handleLoadMetadata}
            onLoadedData={handleLoadedData}
            onTimeUpdate={handleTimeUpdate}
            onProgress={handleProgress}
            onError={handleError}
            onClick={togglePlay}
          />

          {controlsVisible && (
            <MediaControls sx={{ opacity: controlsVisible ? 1 : 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="caption" color="white">
                  {formatTime(currentTime)}
                </Typography>
                <Typography variant="caption" color="white">
                  {formatTime(duration)}
                </Typography>
              </Box>

              <Slider
                size="small"
                min={0}
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                aria-label="Time"
                sx={{
                  color: 'white',
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: 'none',
                    },
                  },
                  '& .MuiSlider-rail': {
                    opacity: 0.3,
                  },
                }}
              />

              {loadProgress < 100 && (
                <LinearProgress
                  variant="determinate"
                  value={loadProgress}
                  sx={{ height: 2, borderRadius: 2, mb: 1 }}
                />
              )}

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {hasPrevious && (
                    <IconButton
                      onClick={onPrevious}
                      size="small"
                      sx={{ color: 'white' }}
                    >
                      <SkipPrevious />
                    </IconButton>
                  )}

                  <IconButton
                    onClick={togglePlay}
                    size="small"
                    sx={{ color: 'white', mx: 0.5 }}
                  >
                    {isPlaying ? <Pause /> : <PlayArrow />}
                  </IconButton>

                  {hasNext && (
                    <IconButton
                      onClick={onNext}
                      size="small"
                      sx={{ color: 'white' }}
                    >
                      <SkipNext />
                    </IconButton>
                  )}

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      ml: 1,
                      position: 'relative',
                    }}
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <IconButton
                      onClick={toggleMute}
                      size="small"
                      sx={{ color: 'white' }}
                    >
                      {isMuted ? <VolumeOff /> : <VolumeUp />}
                    </IconButton>

                    {showVolumeSlider && !isMobile && (
                      <Box
                        sx={{
                          width: 70,
                          position: 'absolute',
                          left: '100%',
                          ml: 1,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        <Slider
                          size="small"
                          min={0}
                          max={100}
                          value={isMuted ? 0 : volume * 100}
                          onChange={handleVolumeChange}
                          aria-label="Volume"
                          sx={{
                            color: 'white',
                            '& .MuiSlider-thumb': {
                              width: 10,
                              height: 10,
                            },
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box>
                  <Tooltip title="Download">
                    <IconButton
                      href={fileUrl}
                      download={fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      sx={{ color: 'white' }}
                    >
                      <CloudDownload />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Fullscreen">
                    <IconButton
                      onClick={enterFullScreen}
                      size="small"
                      sx={{ color: 'white', ml: 0.5 }}
                    >
                      <Fullscreen />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </MediaControls>
          )}
        </PlayerContainer>
      );
    }

    if (isImage) {
      return (
        <Box
          sx={{
            width,
            height,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 1,
              backgroundColor: theme.palette.grey[100],
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              ref={imageRef}
              src={fileUrl}
              alt={fileName}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
              onLoad={handleImageLoad}
              onError={handleError}
            />

            {/* Download button for image */}
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                opacity: 0.7,
                '&:hover': {
                  opacity: 1,
                },
              }}
            >
              <Tooltip title="Download">
                <IconButton
                  href={fileUrl}
                  download={fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                  size="small"
                >
                  <CloudDownload />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      );
    }

    if (isPdf) {
      return (
        <Box sx={{ width, height }}>
          <object
            data={fileUrl}
            type="application/pdf"
            width="100%"
            height={typeof height === 'number' ? height : 600}
            style={{ borderRadius: theme.shape.borderRadius }}
          >
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: theme.palette.grey[100],
                borderRadius: 1,
              }}
            >
              <Typography variant="body1" gutterBottom>
                PDF preview not available
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Your browser doesn't support embedded PDF viewing.
              </Typography>
              <Button
                href={fileUrl}
                download={fileName}
                variant="contained"
                startIcon={<CloudDownload />}
                sx={{ mt: 2 }}
              >
                Download PDF
              </Button>
            </Box>
          </object>
        </Box>
      );
    }

    // For text files and other unsupported formats
    return (
      <Box
        sx={{
          width,
          p: 3,
          textAlign: 'center',
          bgcolor: theme.palette.grey[100],
          borderRadius: 1,
          height: typeof height === 'number' ? height : 'auto',
        }}
      >
        <Typography variant="body1" gutterBottom>
          {isText ? 'Text file preview not available' : 'Preview not available'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {fileName} ({formatFileSize(fileSize)})
        </Typography>
        <Button
          href={fileUrl}
          download={fileName}
          variant="contained"
          startIcon={<CloudDownload />}
          sx={{ mt: 2 }}
        >
          Download File
        </Button>
      </Box>
    );
  };

  // Render media information
  const renderMediaInfo = () => {
    if (Object.keys(mediaInfo).length === 0) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          File Information
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Type
            </Typography>
            <Typography variant="body2">
              {fileType.split('/')[1].toUpperCase()}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Size
            </Typography>
            <Typography variant="body2">{formatFileSize(fileSize)}</Typography>
          </Grid>

          {mediaInfo.dimensions && (
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Dimensions
              </Typography>
              <Typography variant="body2">{mediaInfo.dimensions}</Typography>
            </Grid>
          )}

          {mediaInfo.duration && (
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Duration
              </Typography>
              <Typography variant="body2">{mediaInfo.duration}</Typography>
            </Grid>
          )}

          {metadata.bitrate && (
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Bitrate
              </Typography>
              <Typography variant="body2">{metadata.bitrate}</Typography>
            </Grid>
          )}

          {metadata.codec && (
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Codec
              </Typography>
              <Typography variant="body2">{metadata.codec}</Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      {isLoading && (
        <CircularProgress color="primary" size={48} sx={{ mb: 2 }} />
      )}
      {renderPlayer()}
      {renderMediaInfo()}
    </Box>
  );
};

export default MediaPlayer;

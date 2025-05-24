# Allowed File Formats for NNA Registry Service

This document outlines the allowed file formats for each layer in the NNA Registry Service.

## Layer-Specific File Format Requirements

| Layer Code | Layer Name      | Allowed File Formats | Description |
|------------|-----------------|----------------------|-------------|
| G          | Songs           | `.mp3`, `.wav`, `.ogg`, `.flac`, `.aac` | Audio files only |
| S          | Stars           | `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg` | Image files only |
| L          | Looks           | `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg` | Image files only |
| M          | Moves           | `.mp4`, `.webm`, `.mov`, `.json` | Video files and JSON |
| W          | Worlds          | `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.mp4`, `.webm`, `.mov`, `.json`, `.gltf`, `.glb` | Both images, videos, and 3D models |
| V          | Videos          | `.mp4`, `.webm`, `.mov` | Video files only |
| B          | Branded Assets  | `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.mp4`, `.webm` | Image and video files |
| C          | Composites      | `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.mp4`, `.webm`, `.mov`, `.json` | Multiple file types supported |
| T          | Training Data   | `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.mp4`, `.webm`, `.mov`, `.json`, `.txt`, `.pdf` | Multiple file types supported |
| P          | Patterns        | `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.json` | Image files and JSON |

## MIME Types Used in Implementation

The file upload component uses the following MIME types to enforce these restrictions:

```javascript
// Songs (G)
'audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/aac'

// Stars (S)
'image/jpeg,image/png,image/gif,image/svg+xml'

// Looks (L)
'image/jpeg,image/png,image/gif,image/svg+xml'

// Moves (M)
'video/mp4,video/webm,video/quicktime,application/json'

// Worlds (W)
'image/jpeg,image/png,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime,application/json,model/gltf-binary,model/gltf+json,application/octet-stream'

// Videos (V)
'video/mp4,video/webm,video/quicktime'

// Branded Assets (B)
'image/jpeg,image/png,image/gif,image/svg+xml,video/mp4,video/webm'
```

## File Type Validation

The application performs validation on file uploads based on the selected layer:

1. **Client-Side Validation**: Prevents uploading of files that don't match the allowed MIME types
2. **Additional Layer-Specific Validation**: Validates that the file content matches the layer requirements

## Implementation Details

These file format restrictions are implemented in:
- `src/components/asset/FileUpload.tsx` - For setting allowed file types and validation
- The file input accepts only the specified MIME types for each layer
- Validation messages provide clear feedback if an invalid file type is selected

## Best Practices for File Formats

- **Images**: Use high-resolution, lossless formats for best quality (PNG preferred)
- **Videos**: Use MP4 format with H.264 encoding for best compatibility
- **Audio**: Use high-quality formats (WAV, FLAC) for source files, MP3 for distribution
- **3D Models**: Use GLTF/GLB formats for best compatibility with web standards
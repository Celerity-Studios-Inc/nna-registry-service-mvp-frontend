# Backend Requirements for Enhanced AI Integration

## Overview
This document outlines the backend changes needed to support the Enhanced AI Integration Phase 1 and Phase 2A implementation. The frontend has temporary fixes, but proper backend support is required for full functionality.

## 🎯 **Phase 1: Creator's Description Field**

### **Current Issue**
- Frontend sends `creatorDescription` field in asset creation payload
- Backend doesn't recognize this field and returns HFN in the `name` field
- Frontend displays HFN instead of original creator input

### **Required Backend Changes**

#### 1. Database Schema Update
```javascript
// Add to Asset model/schema
{
  creatorDescription: {
    type: String,
    required: false, // Optional for backwards compatibility
    maxLength: 500,  // Reasonable limit for creator input
    description: "Original description provided by creator during asset registration"
  }
}
```

#### 2. API Endpoint Updates

**Asset Creation (`POST /api/assets`)**
- Accept `creatorDescription` field in request body
- Store `creatorDescription` separately from generated `name` field
- Return `creatorDescription` in response

**Asset Retrieval (`GET /api/assets/:id`)**
- Include `creatorDescription` in response
- Maintain `name` field with HFN for backwards compatibility

**Asset Update (`PUT/PATCH /api/assets/:id`)**
- Allow updating `creatorDescription` field
- Keep separate from HFN generation logic

#### 3. Migration Strategy
```javascript
// Migration script needed for existing assets
// Set creatorDescription = name for assets created before this feature
// This provides backwards compatibility
```

## 🎯 **Phase 2A: Album Art Storage**

### **Current Implementation**
- Frontend fetches album art from iTunes API during registration
- Album art URL stored in `metadata.albumArtUrl`
- No permanent storage of album art images

### **Required Backend Changes**

#### 1. Album Art Storage
```javascript
// Add to Asset model/schema
{
  albumArt: {
    url: String,           // Stored album art URL (GCS bucket)
    sourceUrl: String,     // Original iTunes/source URL
    source: String,        // "iTunes", "Manual", "AI Generated"
    quality: String,       // "High", "Medium", "Low"
    uploadedAt: Date,
    contentType: String,   // "image/jpeg", "image/png"
    size: Number          // File size in bytes
  }
}
```

#### 2. Album Art Processing Pipeline
- **Download and Store:** Download album art from iTunes API to GCS bucket
- **Multiple Resolutions:** Store thumbnail (150x150) and full-size versions
- **Fallback Handling:** Support manual album art upload if iTunes lookup fails
- **Content Validation:** Validate image format and size

#### 3. API Enhancements
```javascript
// Enhanced asset creation for Songs layer
POST /api/assets
{
  // Existing fields...
  albumArt: {
    sourceUrl: "https://is1-ssl.mzstatic.com/...",
    source: "iTunes",
    quality: "High"
  },
  extractedSongData: {
    songName: "Bohemian Rhapsody",
    albumName: "A Night at the Opera", 
    artistName: "Queen"
  }
}
```

## 🎯 **Phase 2B: Advanced AI Integration Support**

### **Enhanced Metadata Storage**
```javascript
// Extended Asset model for AI-generated content
{
  aiMetadata: {
    generatedBy: String,           // "OpenAI GPT-4o", "Claude", etc.
    generationStrategy: String,    // "visual-image", "visual-thumbnail", "songs", etc.
    processingTime: Number,        // Generation time in milliseconds
    inputContext: {
      creatorDescription: String,  // Original creator input
      layerStrategy: String,       // "G", "S", "L", "M", "W", "C"
      additionalContext: Object    // Layer-specific context data
    },
    confidence: Number,            // AI confidence score (0-1)
    fallbackUsed: Boolean,         // Whether fallback methods were used
    generatedAt: Date
  }
}
```

### **Layer-Specific Enhancements**

#### **Songs Layer (G) - MusicBrainz Integration**
```javascript
{
  musicData: {
    musicBrainzId: String,         // MusicBrainz recording ID
    spotifyId: String,             // Spotify track ID (future)
    duration: Number,              // Track duration in seconds
    bpm: Number,                   // Beats per minute
    key: String,                   // Musical key
    genre: [String],               // Multiple genres
    recordLabel: String,           // Record label
    releaseDate: Date,             // Original release date
    lastMusicBrainzSync: Date      // Last sync with MusicBrainz
  }
}
```

#### **Component Aggregation (C Layer)**
```javascript
{
  componentAnalysis: {
    totalComponents: Number,
    layerBreakdown: {
      G: Number,  // Count of Songs components
      S: Number,  // Count of Stars components
      L: Number,  // Count of Looks components
      M: Number,  // Count of Moves components
      W: Number   // Count of Worlds components
    },
    aggregatedTags: [String],      // Combined unique tags from all components
    aggregatedDescription: String,  // AI-generated composite description
    compatibilityScore: Number     // How well components work together (0-1)
  }
}
```

## 🎯 **API Versioning Strategy**

### **Backwards Compatibility**
- Maintain existing API responses for current frontend versions
- Add new fields without breaking existing integrations
- Use API versioning headers for enhanced features

### **Response Format Enhancement**
```javascript
// Enhanced API response format
{
  id: "asset_id",
  name: "L.CAS.ATL.001",              // Generated HFN (existing)
  creatorDescription: "Kelly is wearing...", // NEW: Original creator input
  description: "AI-generated description",   // AI-enhanced description
  // ... existing fields ...
  
  // NEW: Enhanced metadata
  aiMetadata: { /* AI generation info */ },
  albumArt: { /* Album art info for Songs */ },
  musicData: { /* MusicBrainz data for Songs */ },
  componentAnalysis: { /* Component info for Composites */ }
}
```

## 🎯 **Development Priority**

### **Phase 1 (Immediate - Required for Current Frontend)**
1. ✅ **Creator's Description Field** - Critical for UI functionality
2. ✅ **Album Art Storage** - Songs layer enhancement

### **Phase 2B (Next Sprint)**
1. **MusicBrainz Integration** - Songs layer data enrichment
2. **Enhanced AI Metadata** - Generation tracking and optimization
3. **Component Analysis** - Composite layer intelligence

### **Phase 3 (Future)**
1. **Web Search Integration** - Additional context gathering
2. **Multi-modal AI Processing** - Advanced content analysis
3. **Real-time Updates** - Live data synchronization

## 🎯 **Testing Requirements**

### **API Testing**
- Creator's Description preservation through create/read/update cycle
- Album art download and storage pipeline
- Backwards compatibility with existing assets
- Performance testing with AI metadata storage

### **Migration Testing**
- Existing asset compatibility
- Data integrity during schema updates
- Rollback procedures if needed

## 📋 **Frontend Coordination**

The frontend has implemented temporary fixes and is ready for proper backend integration:
- ✅ UI layouts enhanced for Creator's Description display
- ✅ Album art display components ready
- ✅ Enhanced AI integration architecture implemented
- ✅ Type definitions updated for new fields

**Next Step:** Backend team implements Phase 1 requirements, then we proceed to Phase 2B advanced features.
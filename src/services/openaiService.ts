/**
 * OpenAI Service for Automatic Asset Description and Tags Generation
 * Based on the automation guide and metadata guide for creators
 */

// Import diagnostic utility for troubleshooting
import { logEnvironmentDiagnostic } from '../utils/envDiagnostic';
// Phase 2A: Import album art service
import albumArtService from './albumArtService';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface AssetContext {
  layer: string;
  categoryCode: string;
  subcategoryCode: string;
  fileName: string;
  fileType: string;
}

// Enhanced AI Integration: New context interface for Creator's Description + AI collaboration
interface EnhancedAIContext {
  // Core identification
  layer: string;
  category: string;
  subcategory: string;
  
  // Creator input (repurposed Name field)
  shortDescription: string;  // <100 characters, layer-specific guidance
  
  // File context
  fileName: string;
  fileType: string;
  fileSize?: number;
  
  // Layer-specific data
  thumbnail?: string;        // For M, W, C layers (video thumbnail)
  image?: string;           // For S, L layers (direct image)
  componentMetadata?: ComponentMetadata[]; // For C layer (composite components)
  
  // Enhanced taxonomy context
  taxonomy: {
    layerName: string;       // "Songs", "Stars", "Looks", etc.
    categoryName: string;    // Full category name
    subcategoryName: string; // Full subcategory name
  };
  
  // Processing metadata
  previousAttempts?: number;
  regenerationContext?: RegenerationContext;
}

interface ComponentMetadata {
  layer: string;
  category: string;
  subcategory: string;
  description: string;
  tags: string[];
  hfn: string;
  mfa: string;
}

interface RegenerationContext {
  previousAttempts: number;
  lastResult: any;
  userRequest: string;
}

interface LayerProcessingStrategy {
  type: 'songs' | 'visual-image' | 'visual-thumbnail' | 'composite' | 'generic';
  requiresWebSearch: boolean;
  requiresImageAnalysis: boolean;
  requiresThumbnailGeneration: boolean;
  requiresComponentAggregation: boolean;
  musicBrainzIntegration: boolean;
}

interface ExtractedSongData {
  songName: string;
  albumName: string;
  artistName: string;
  originalInput: string;
}

class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    // API key must be provided via environment variable
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ REACT_APP_OPENAI_API_KEY environment variable is not set. AI metadata generation will not work.');
      
      // Run diagnostic to help troubleshoot
      if (typeof window !== 'undefined' && window.location.hostname.includes('dev')) {
        logEnvironmentDiagnostic();
      }
    }
  }

  /**
   * Generate description for an asset using OpenAI GPT-4o
   */
  async generateDescription(fileUrl: string, context: AssetContext): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured. Please set REACT_APP_OPENAI_API_KEY environment variable.');
    }

    try {
      const systemPrompt = "Do not use line breaks or any kind of formatting like list items, code blocks, etc. Just a single plain paragraph.";
      const userPrompt = this.getDescriptionPrompt(context.layer);

      // Convert blob URL to base64 data URL for OpenAI API
      const imageDataUrl = await this.convertBlobToDataUrl(fileUrl);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: userPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageDataUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 1200
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      const description = data.choices[0]?.message?.content?.trim() || '';
      
      // Clean up any "Description: " prefix if it exists
      return description.replace(/^Description:\s*/i, '');
    } catch (error) {
      console.error('Error generating description:', error);
      throw new Error('Failed to generate description. Please try again or enter manually.');
    }
  }

  /**
   * Generate tags for an asset using OpenAI GPT-4o
   */
  async generateTags(fileUrl: string, context: AssetContext): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured. Please set REACT_APP_OPENAI_API_KEY environment variable.');
    }

    try {
      const systemPrompt = "Do not include any formatting.\\n\\nBAD:\\ntag1, tag2, etc.,\\n\\nGOOD:\\ntag1, tag2, etc.";
      const userPrompt = this.getTagsPrompt(context.layer);

      // Convert blob URL to base64 data URL for OpenAI API
      const imageDataUrl = await this.convertBlobToDataUrl(fileUrl);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: userPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageDataUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 1200
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      const tagsString = data.choices[0]?.message?.content?.trim() || '';
      
      // Clean up any "Comma-separated tag list: " prefix if it exists
      const cleanTagsString = tagsString.replace(/^Comma-separated tag list:\s*/i, '');
      
      // Split into array and clean up
      return cleanTagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    } catch (error) {
      console.error('Error generating tags:', error);
      throw new Error('Failed to generate tags. Please try again or enter manually.');
    }
  }

  /**
   * Convert blob URL to base64 data URL for OpenAI API
   */
  private async convertBlobToDataUrl(blobUrl: string): Promise<string> {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting blob to data URL:', error);
      throw new Error('Failed to convert image for AI processing');
    }
  }

  /**
   * Generate both description and tags in parallel
   */
  async generateMetadata(fileUrl: string, context: AssetContext): Promise<{
    description: string;
    tags: string[];
  }> {
    try {
      const [description, tags] = await Promise.all([
        this.generateDescription(fileUrl, context),
        this.generateTags(fileUrl, context)
      ]);

      return { description, tags };
    } catch (error) {
      console.error('Error generating metadata:', error);
      throw error;
    }
  }

  /**
   * Get layer-specific description prompt
   */
  private getDescriptionPrompt(layer: string): string {
    const basePrompt = "You are part of an automated workflow. Provide a comprehensive and detailed description of the attached file. Your response is being passed to a program, so headers or preambles will break it. Respond only with the description. Do not use line breaks in your description. It will be saved to a tsv file and line breaks, quotes, and other special characters would break it; therefore, the entire description needs to be one paragraph, regardless of length. Limit the length of your description to 7 sentences.";

    switch (layer.toUpperCase()) {
      case 'G': // Songs
        return `${basePrompt}

The audio attached is a song.
**Your description should focus on the following primary dimensions:**

- Genre and subgenre
- Tempo and energy level
- Instrumentation and production style
- Vocal characteristics
- Cultural/regional influences

Write the description now.
Description: `;

      case 'S': // Stars
        return `${basePrompt}

The image attached depicts a performer or performance avatar.
**Your description should focus on the following primary dimensions:**

- Performance style and energy
- Visual aesthetic and personality
- Movement capabilities
- Clothing/costume style
- Facial expressions and attitude

Write the description now.
Description: `;

      case 'L': // Looks
        return `${basePrompt}

The image attached depicts a costume and styling that complement stars and match song aesthetics.

**Your description should focus on the following primary dimensions:**
- Style
- Era
- Color scheme and visual impact
- Formality level
- Cultural influences
- Occasion/performance type

**Example:**
Sparkly stage dress with contemporary cut and dynamic movement. Features sequined bodice with flowing skirt, perfect for high-energy pop performances. Bright colors and modern silhouette create visual impact under stage lights.

Write the description now.
Description: `;

      case 'M': // Moves
        return `${basePrompt}

The video attached shows a dance or movement sequence.
**Your description should focus on the following primary dimensions:**

- Movement tempo and intensity
- Dance style and technique
- Body parts involved
- Complexity level
- Cultural origin
- Synchronization capabilities

Write the description now.
Description: `;

      case 'W': // Worlds
        return `${basePrompt}

The image or video attached depicts a setting or environment.
**Your description should focus on the following primary dimensions:**

- Setting type and atmosphere
- Visual style and mood
- Lighting conditions
- Scale and grandeur
- Cultural context

Write the description now.
Description: `;

      default:
        return `${basePrompt}

Write the description now.
Description: `;
    }
  }

  /**
   * Get layer-specific tags prompt
   */
  private getTagsPrompt(layer: string): string {
    const baseInstructions = "You are part of an automated workflow. Write a list of comma-separated tags for the attached";

    switch (layer.toUpperCase()) {
      case 'G': // Songs
        return `${baseInstructions} audio file. The tags must capture the primary characteristics of the song and enable musical and cross-layer matching. Your tag list must be flattened (no headers or categories), comma-separated, and limited to 40 terms. Multi-word tags should use dashes, not spaces. No more than two words per tag.

**Your tags should address the following dimensions:**

- Genre and subgenre
- Tempo and energy level
- Instrumentation and production style
- Vocal characteristics
- Mood and emotional tone
- Compatibility (e.g. pop-suitable, hip-hop-ready)

Example:
pop, electronic, upbeat, 128bpm, high-energy, catchy, contemporary, synth, danceable, mainstream, female-vocal, energetic, polished, club

Comma-separated tag list: `;

      case 'S': // Stars
        return `${baseInstructions} image of a performer. The tags must capture appearance, energy, performance type, visual style, and compatibility. Your tag list must be flattened (no headers or categories), comma-separated, and limited to 40 terms. Multi-word tags should use dashes, not spaces. No more than two words per tag.

**Your tags should cover:**

- Style and aesthetic
- Mood and expression
- Clothing and visual cues
- Energy and movement
- Performance type
- Genre-compatibility

Example:
female, contemporary, confident, energetic, streetwear, dynamic, expressive, pop-suitable, hip-hop-ready, modern, performer, high-energy

Comma-separated tag list: `;

      case 'L': // Looks
        return `${baseInstructions} picture. Write a list of comma-separated tags related to the objects, people, mood, lighting, clothing, location, etc., of the attached picture. Multi-word tags should be dashed (don't use spaces within a tag). No three-word tags, two tops. Avoid repeating tags or words.

Your tag list should usually be about 80% or more one-word tags. The tags should **always** cover the primary dimensions:
1. Style
2. Era
3. Color scheme and visual impact
4. Formality level
5. Cultural influences
6. Occasion/performance type

**Example Style Tags:** streetwear, formal, casual, vintage, contemporary, elegant, edgy
**Example Era Tags:** modern, retro, 80s, 90s, futuristic, classic, timeless
**Example Color Tags:** bright, dark, colorful, monochrome, pastel, bold, neutral
**Example Occasion Tags:** performance, concert, casual, formal, dance, stage
**Example Aesthetic Tags:** minimalist, maximalist, urban, glamorous, artistic
**Example Genre-compatibility Tags:** pop-friendly, rock-suitable, elegant-appropriate

**AlgoRhythm Matching Logic:**
- **Energetic pop songs** → Bright, contemporary, performance-ready outfits
- **Classic rock** → Leather, denim, edgy styling
- **Romantic ballads** → Elegant, flowing, sophisticated looks

**Example:**
sparkly, stage-ready, contemporary, pop-friendly, bright, energetic, performance, sequined, flowing, high-energy, modern, dance-suitable

Remember, you're part of an automated workflow and the tag list you provide will be iterated over by the workflow, so if your response includes preamble, a header like Here are the tags: or any other stuff other than a comma-separated list of tags, the workflow will break, so respond only with the tag list. Limit the list to 40 tags or fewer.

Above all else, make sure your list address the primary dimensions listed above. Only include additional tags once you have first covered the six primary dimensions (you will probably need more than one tag each to adequately cover the six primary dimensions).

Comma-separated tag list: `;

      case 'M': // Moves
        return `${baseInstructions} video of a dance or movement. The tags must describe tempo, intensity, style, synchronization, and body use. Your tag list must be flattened (no headers or categories), comma-separated, and limited to 40 terms. Multi-word tags should use dashes, not spaces. No more than two words per tag.

**Your tags should address:**

- Tempo and synchronization
- Dance style and technique
- Energy and intensity
- Body parts involved
- Skill level
- Genre-compatibility

Example:
fast, high-tempo, hip-hop, contemporary, full-body, arms, hips, beat-synced, expressive, athletic, advanced, energetic, rhythmic, pop-suitable

Comma-separated tag list: `;

      case 'W': // Worlds
        return `${baseInstructions} image or video of a setting or environment. The tags must describe setting type, lighting, mood, style, and compatibility. Your tag list must be flattened (no headers or categories), comma-separated, and limited to 40 terms. Multi-word tags should use dashes, not spaces. No more than two words per tag.

**Your tags should cover:**

- Setting type and atmosphere
- Mood and visual tone
- Lighting and environment
- Scale and cultural feel
- Genre-compatibility

Example:
concert-stage, LED-lighting, modern, spacious, colorful, high-energy, pop-suitable, electronic-ready, stadium, vibrant, dynamic, bright, professional

Comma-separated tag list: `;

      default:
        return `${baseInstructions} file. Write relevant tags as a comma-separated list.

Comma-separated tag list: `;
    }
  }

  // ========================================================================================
  // ENHANCED AI INTEGRATION: Creator's Description + AI Collaboration Methods
  // ========================================================================================

  /**
   * Generate metadata using enhanced context-aware processing
   * Main entry point for the enhanced AI integration
   */
  async generateEnhancedMetadata(context: EnhancedAIContext): Promise<{
    description: string;
    tags: string[];
    additionalMetadata?: any;
  }> {
    const strategy = this.determineProcessingStrategy(context.layer);
    
    console.log(`[ENHANCED AI] Processing ${context.layer} layer with strategy: ${strategy.type}`);
    console.log(`[ENHANCED AI] Creator's Description: "${context.shortDescription}"`);
    
    try {
      switch (strategy.type) {
        case 'songs':
          return await this.processSongsLayer(context);
        case 'visual-image':
          return await this.processVisualWithImage(context);
        case 'visual-thumbnail':
          return await this.processVisualWithThumbnail(context);
        case 'composite':
          return await this.processCompositeLayer(context);
        default:
          return await this.processGenericLayer(context);
      }
    } catch (error) {
      console.error('[ENHANCED AI] Error in enhanced metadata generation:', error);
      throw new Error(`Enhanced AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Determine processing strategy based on layer
   */
  private determineProcessingStrategy(layer: string): LayerProcessingStrategy {
    const strategies: Record<string, LayerProcessingStrategy> = {
      G: { 
        type: 'songs', 
        requiresWebSearch: true, 
        requiresImageAnalysis: false,
        requiresThumbnailGeneration: false,
        requiresComponentAggregation: false,
        musicBrainzIntegration: true 
      },
      S: { 
        type: 'visual-image', 
        requiresWebSearch: false,
        requiresImageAnalysis: true,
        requiresThumbnailGeneration: false,
        requiresComponentAggregation: false,
        musicBrainzIntegration: false 
      },
      L: { 
        type: 'visual-image', 
        requiresWebSearch: false,
        requiresImageAnalysis: true,
        requiresThumbnailGeneration: false,
        requiresComponentAggregation: false,
        musicBrainzIntegration: false 
      },
      M: { 
        type: 'visual-thumbnail', 
        requiresWebSearch: false,
        requiresImageAnalysis: false,
        requiresThumbnailGeneration: true,
        requiresComponentAggregation: false,
        musicBrainzIntegration: false 
      },
      W: { 
        type: 'visual-thumbnail', 
        requiresWebSearch: false,
        requiresImageAnalysis: false,
        requiresThumbnailGeneration: true,
        requiresComponentAggregation: false,
        musicBrainzIntegration: false 
      },
      C: { 
        type: 'composite', 
        requiresWebSearch: false,
        requiresImageAnalysis: false,
        requiresThumbnailGeneration: false,
        requiresComponentAggregation: true,
        musicBrainzIntegration: false 
      }
    };
    
    return strategies[layer] || { 
      type: 'generic', 
      requiresWebSearch: false,
      requiresImageAnalysis: false,
      requiresThumbnailGeneration: false,
      requiresComponentAggregation: false,
      musicBrainzIntegration: false 
    };
  }

  /**
   * Enhanced processing for Songs layer with web search capabilities
   */
  private async processSongsLayer(context: EnhancedAIContext): Promise<any> {
    console.log('[ENHANCED AI] Processing Songs layer with MusicBrainz integration');
    
    // 1. Claude processing: Extract structured song data
    const songData = this.extractSongData(context.shortDescription);
    console.log('[ENHANCED AI] Extracted song data:', songData);
    
    // 2. OpenAI processing: Enhanced prompt with web search capabilities
    const prompt = this.buildEnhancedSongsPrompt(songData, context.taxonomy);
    
    // 3. Call OpenAI with enhanced context
    const response = await this.callOpenAIWithEnhancedContext(prompt, null, context);
    
    const processedResponse = this.processSongsResponse(response, songData);
    
    // Phase 2A: Fetch album art asynchronously using dedicated service
    albumArtService.fetchAlbumArt({
      songName: songData.songName,
      artistName: songData.artistName,
      albumName: songData.albumName
    }).then(albumArtResult => {
      if (albumArtResult) {
        processedResponse.additionalMetadata.albumArtUrl = albumArtResult.url;
        processedResponse.additionalMetadata.albumArtSource = albumArtResult.source;
        processedResponse.additionalMetadata.albumArtQuality = albumArtResult.quality;
        console.log('[PHASE 2A] Album art added to metadata:', albumArtResult);
      }
    }).catch(error => {
      console.warn('[PHASE 2A] Album art fetch error:', error);
    });
    
    return processedResponse;
  }

  /**
   * Extract structured song information using Claude-like logic
   */
  private extractSongData(description: string): ExtractedSongData {
    console.log(`[ENHANCED AI] Extracting song data from: "${description}"`);
    
    // Handle multiple input formats - Enhanced with song description patterns
    const patterns = [
      // Pattern 1: Song = "Song Name", Artist = "Artist", Album = "Album" (SPECIFIC for structured format)
      /Song\s*=\s*[""'](.+?)[""']\s*,\s*Artist\s*=\s*[""'](.+?)[""']\s*,\s*Album\s*=\s*[""'](.+?)[""']/i,
      
      // Pattern 2: Simple "Song Name" by Artist (MOST COMMON format)
      /^[""'](.+?)[""']\s*by\s+(.+?)$/i,
      
      // Pattern 3: "Song Name - Album Name - Artist/Band"
      /^(.+?)\s*-\s*(.+?)\s*-\s*(.+?)$/,
      
      // Pattern 2: "Song Name" by Artist from album Album Name
      /^[""'](.+?)[""']\s*by\s+(.+?)\s+from\s+album\s+(.+?)(?:\s*\([\d]+\))?(?:\.|$)/i,
      
      // Pattern 3: "Song Name is a song by Artist... from the album Album Name" (ENHANCED)
      /^(.+?)\s+is\s+a\s+song\s+by\s+(.+?)\.\s*.*?from\s+the\s+album\s+(.+?)(?:\s*\([\d]+\))?(?:\.|$)/i,
      
      // Pattern 4: Song Name by Artist from the album Album Name
      /^(.+?)\s+by\s+(.+?)\s+from\s+the\s+album\s+(.+?)(?:\s*\([\d]+\))?(?:\.|$)/i,
      
      // Pattern 5: Song Name by Artist from album Album Name
      /^(.+?)\s+by\s+(.+?)\s+from\s+album\s+(.+?)(?:\s*\([\d]+\))?(?:\.|$)/i,
      
      // Pattern 6: "Song Name" by Artist (enhanced to stop at sentence break)
      /^[""'](.+?)[""']\s*by\s+([^.]+?)(?:\s+is\s|\s+was\s|\.\s|\s*\([\d]+\))?(?:\.|$)/i,
      
      // Pattern 7: "Song Name" by Artist with features/description (ENHANCED for your format)
      /^[""'](.+?)[""']\s*(?:song\s+)?by\s+([^.]+?)\s+(?:features|is\s+an?|and\s+)/i,
      
      // Pattern 8: "Song Name" song by Artist features ... (SPECIFIC for your input format)
      /^[""'](.+?)[""']\s*song\s+by\s+([^,]+(?:,\s*[^,]+)*?)\s+features\s+/i,
      
      // Pattern 9: Song Name by Artist
      /^(.+?)\s*by\s+(.+?)(?:\s*\([\d]+\))?(?:\.|$)/i,
      
      // Pattern 8: Song Name - Artist format
      /^(.+?)\s*-\s*(.+?)$/,
      
      // Pattern 9: Just song name
      /^(.+?)$/
    ];
    
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = description.match(pattern);
      if (match) {
        console.log(`[ENHANCED AI] Pattern ${i + 1} matched. Extracted:`, {
          songName: match[1]?.trim(),
          artistName: match[2]?.trim(),
          albumName: match[3]?.trim() || '',
          originalInput: description
        });
        let result: ExtractedSongData;
        
        if (i === 0) { // Song = "Song Name", Artist = "Artist", Album = "Album"
          result = {
            songName: match[1]?.trim() || '',
            artistName: match[2]?.trim() || '',
            albumName: match[3]?.trim() || '',
            originalInput: description
          };
        } else if (i === 1) { // Simple "Song Name" by Artist (MOST COMMON)
          result = {
            songName: match[1]?.trim() || '',
            artistName: match[2]?.trim() || '',
            albumName: '', // No album in this format
            originalInput: description
          };
        } else if (i === 3) { // "Song Name" by Artist from album Album Name
          result = {
            songName: match[1]?.trim() || '',
            artistName: match[2]?.trim() || '',
            albumName: match[3]?.trim() || '',
            originalInput: description
          };
        } else if (i === 4) { // "Song Name is a song by Artist... from the album Album Name" (ENHANCED)
          result = {
            songName: match[1]?.trim() || '',
            artistName: match[2]?.trim() || '',
            albumName: match[3]?.trim() || '',
            originalInput: description
          };
        } else if (i === 5 || i === 6) { // Song Name by Artist from the album Album Name / from album Album Name
          result = {
            songName: match[1]?.trim() || '',
            artistName: match[2]?.trim() || '',
            albumName: match[3]?.trim() || '',
            originalInput: description
          };
        } else if (i === 7 || i === 8 || i === 9 || i === 10) { // "Song Name" by Artist patterns
          // Clean up song name - remove quotes and trailing "song"
          let cleanSongName = (match[1]?.trim() || '').replace(/^["'"]|["'"]$/g, '').replace(/\s+song$/i, '');
          result = {
            songName: cleanSongName,
            artistName: match[2]?.trim() || '',
            albumName: '',
            originalInput: description
          };
        } else if (i === 2) { // Song - Album - Artist
          result = {
            songName: match[1]?.trim() || '',
            albumName: match[2]?.trim() || '',
            artistName: match[3]?.trim() || '',
            originalInput: description
          };
        } else if (i === 11) { // Song by Artist (general)
          result = {
            songName: match[1]?.trim() || '',
            artistName: match[2]?.trim() || '',
            albumName: '',
            originalInput: description
          };
        } else if (i === 12) { // Song - Artist
          result = {
            songName: match[1]?.trim() || '',
            artistName: match[2]?.trim() || '',
            albumName: '',
            originalInput: description
          };
        } else { // Just song name (pattern 13)
          result = {
            songName: match[1]?.trim() || description,
            albumName: '',
            artistName: '',
            originalInput: description
          };
        }
        
        console.log(`[ENHANCED AI] Pattern ${i + 1} matched. Extracted:`, result);
        return result;
      }
    }
    
    const fallback = {
      songName: description,
      albumName: '',
      artistName: '',
      originalInput: description
    };
    console.log('[ENHANCED AI] No patterns matched, using fallback:', fallback);
    return fallback;
  }

  /**
   * Build enhanced prompt for songs with web search integration
   */
  private buildEnhancedSongsPrompt(songData: ExtractedSongData, taxonomy: any): string {
    return `Research and describe the song "${songData.songName}"${songData.artistName ? ` by "${songData.artistName}"` : ''}${songData.albumName ? ` from the album "${songData.albumName}"` : ''}.

Creator's Context: "${songData.originalInput}"
Layer: ${taxonomy.layerName} 
Category: ${taxonomy.categoryName} - ${taxonomy.subcategoryName}

Please provide comprehensive information including:

1. **Single Paragraph Description** (no line breaks, detailed but concise)
   - Genre and subgenre classification
   - Tempo, energy level, and BPM if available
   - Instrumentation and production style  
   - Vocal characteristics and mood
   - Cultural/regional influences
   - Historical context and significance

2. **AlgoRhythm-Optimized Tags** (comma-separated, focus on cross-layer compatibility)
   - Genre tags (specific and general)
   - Tempo and energy descriptors
   - Mood and atmosphere tags
   - Cross-layer compatibility (pop-suitable, hip-hop-ready, etc.)
   - Instrumentation and style tags
   - Cultural and era indicators

3. **Enhanced Metadata** (if available)
   - MusicBrainz ID for authoritative reference
   - Album artwork URL
   - Additional context for music databases

Format your response as JSON:
{
  "description": "Single comprehensive paragraph...",
  "tags": "comma,separated,tag,list,optimized,for,algorhythm",
  "musicbrainzId": "optional-mbid-if-available",
  "albumArtUrl": "optional-album-art-url-if-available",
  "additionalContext": "any-other-relevant-metadata"
}

Use web search if needed to find accurate information about this song.`;
  }

  /**
   * Enhanced processing for visual layers with image + context analysis
   */
  private async processVisualWithImage(context: EnhancedAIContext): Promise<any> {
    console.log(`[ENHANCED AI] Processing ${context.layer} layer with image + context analysis`);
    
    // Build enhanced prompt with Creator's Description context
    const enhancedPrompt = this.buildVisualPrompt(context);
    
    // Process with image analysis + context
    const imageDataUrl = context.image ? await this.convertBlobToDataUrl(context.image) : null;
    
    const response = await this.callOpenAIWithEnhancedContext(enhancedPrompt, imageDataUrl, context);
    
    return this.processVisualResponse(response, context);
  }

  /**
   * Build enhanced visual prompt with Creator's Description context
   */
  private buildVisualPrompt(context: EnhancedAIContext): string {
    const baseDescription = context.shortDescription;
    const layerContext = context.taxonomy.layerName;
    const categoryContext = `${context.taxonomy.categoryName} - ${context.taxonomy.subcategoryName}`;
    
    const layerSpecificFocus = this.getLayerSpecificFocus(context.layer);
    
    return `Analyze this ${layerContext.toLowerCase()} image with the following context:

Creator's Description: "${baseDescription}"
Category Context: ${categoryContext}
Layer Purpose: ${this.getLayerPurpose(context.layer)}

Generate:
1. **Enhanced Description** that combines the creator's input with detailed visual analysis
2. **AlgoRhythm-Optimized Tags** for cross-layer compatibility and music synchronization

Focus on:
${layerSpecificFocus}

Ensure tags include:
- Energy level indicators (high-energy, medium-energy, low-energy)
- Style descriptors (contemporary, classic, urban, etc.)
- Genre-compatibility tags (pop-suitable, rock-compatible, etc.)
- Mood and atmosphere descriptors
- Visual aesthetic tags
- Performance context tags

Respond with only the description paragraph and comma-separated tag list in JSON format:
{
  "description": "Single enhanced paragraph combining creator context with visual analysis...",
  "tags": "comma,separated,algorhythm,optimized,tag,list"
}`;
  }

  /**
   * Get layer-specific focus areas for enhanced prompting
   */
  private getLayerSpecificFocus(layer: string): string {
    const focusAreas: Record<string, string> = {
      S: `- Performance style and energy level
- Visual aesthetic and personality expression
- Movement potential and dance compatibility
- Clothing/costume style and color scheme
- Facial expressions and emotional projection
- Cross-layer synchronization potential`,
      L: `- Style category and fashion era
- Color scheme and visual impact under stage lighting
- Formality level and occasion appropriateness
- Cultural influences and design inspiration
- Movement compatibility and dance-friendliness
- Genre and music style compatibility`,
      M: `- Movement tempo and intensity level
- Dance style and technical complexity
- Body engagement and choreographic elements
- Rhythm synchronization capabilities
- Cultural dance influences
- Cross-genre and cross-layer compatibility`,
      W: `- Setting type and environmental atmosphere
- Mood and emotional tone
- Lighting conditions and visual ambiance
- Scale, grandeur, and production value
- Cultural context and aesthetic influences
- Performance suitability and genre compatibility`
    };
    
    return focusAreas[layer] || '- General aesthetic and style characteristics\n- Mood and atmosphere\n- Quality and production value';
  }

  /**
   * Get layer purpose description for enhanced context
   */
  private getLayerPurpose(layer: string): string {
    const purposes: Record<string, string> = {
      G: 'Musical compositions and audio content for entertainment and synchronization',
      S: 'Performer avatars and character representations for visual performances',
      L: 'Clothing, costumes, and styling that complement performers and match music aesthetics', 
      M: 'Dance choreography and movement sequences for performance synchronization',
      W: 'Environmental settings and backgrounds that enhance performance atmosphere',
      C: 'Composite assets combining multiple layers for complete performance experiences'
    };
    
    return purposes[layer] || 'Digital asset for creative and entertainment purposes';
  }

  /**
   * Enhanced processing for video layers with thumbnail + context analysis
   */
  private async processVisualWithThumbnail(context: EnhancedAIContext): Promise<any> {
    console.log(`[ENHANCED AI] Processing ${context.layer} layer with thumbnail + context analysis`);
    
    // Use provided thumbnail or process as image
    const thumbnailUrl = context.thumbnail || context.image;
    
    if (!thumbnailUrl) {
      throw new Error('No thumbnail or image provided for video layer processing');
    }
    
    // Process with thumbnail analysis + enhanced context
    const enhancedContext = {
      ...context,
      image: thumbnailUrl // Use thumbnail as image for processing
    };
    
    return this.processVisualWithImage(enhancedContext);
  }

  /**
   * Enhanced processing for composite layer with component aggregation
   */
  private async processCompositeLayer(context: EnhancedAIContext): Promise<any> {
    console.log('[ENHANCED AI] Processing Composite layer with component aggregation');
    
    if (!context.componentMetadata || context.componentMetadata.length === 0) {
      throw new Error('No component metadata provided for composite layer processing');
    }
    
    // Aggregate component metadata
    const aggregatedData = this.aggregateComponentMetadata(context.componentMetadata);
    
    // Build composite prompt
    const compositePrompt = this.buildCompositePrompt(aggregatedData, context);
    
    // Process composite metadata
    const response = await this.callOpenAIWithEnhancedContext(compositePrompt, context.thumbnail || null, context);
    
    return this.processCompositeResponse(response, aggregatedData);
  }

  /**
   * Aggregate component metadata for intelligent composite processing
   */
  private aggregateComponentMetadata(components: ComponentMetadata[]): any {
    const uniqueLayers = new Set(components.map(c => c.layer));
    const layers = Array.from(uniqueLayers);
    const allTags = components.flatMap(c => c.tags);
    const styles = allTags.filter(tag => 
      tag.includes('style') || tag.includes('energy') || tag.includes('mood')
    );
    
    return {
      componentCount: components.length,
      layersUsed: layers,
      dominantStyles: this.extractDominantStyles(styles),
      energyLevels: this.analyzeEnergyLevels(components),
      genreCompatibility: this.analyzeGenreCompatibility(components),
      summary: this.generateComponentSummary(components)
    };
  }

  /**
   * Call OpenAI with enhanced context and error handling
   */
  private async callOpenAIWithEnhancedContext(prompt: string, imageDataUrl: string | null, context: EnhancedAIContext): Promise<any> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured. Please set REACT_APP_OPENAI_API_KEY environment variable.');
    }

    const messages: any[] = [
      {
        role: 'system',
        content: 'You are an AI expert specializing in entertainment asset metadata generation. Provide accurate, detailed responses in the requested JSON format without additional formatting or explanations.'
      }
    ];

    if (imageDataUrl) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: imageDataUrl
            }
          }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: prompt
      });
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Process songs response with additional metadata handling
   */
  private processSongsResponse(response: any, songData: ExtractedSongData): any {
    let content = response.choices[0]?.message?.content?.trim() || '';
    
    // Clean up markdown code blocks if present
    content = this.cleanJsonResponse(content);
    
    try {
      const parsed = JSON.parse(content);
      const baseTags = typeof parsed.tags === 'string' ? parsed.tags.split(',').map((t: string) => t.trim()) : parsed.tags || [];
      
      // Phase 2A: Extract BPM and enhanced metadata from description and tags
      const enhancedMetadata = this.extractEnhancedSongMetadata(parsed.description || '', baseTags, songData);
      
      return {
        description: parsed.description || '',
        tags: enhancedMetadata.enhancedTags,
        additionalMetadata: {
          musicbrainzId: parsed.musicbrainzId,
          albumArtUrl: parsed.albumArtUrl || enhancedMetadata.albumArtUrl,
          additionalContext: parsed.additionalContext,
          extractedSongData: songData,
          // Phase 2A: Enhanced song metadata
          bpm: enhancedMetadata.bpm,
          energy: enhancedMetadata.energy,
          mood: enhancedMetadata.mood,
          tempo: enhancedMetadata.tempo,
          algorhythmTags: enhancedMetadata.algorhythmTags
        }
      };
    } catch (error) {
      console.warn('[ENHANCED AI] Failed to parse JSON response, using fallback processing');
      console.log('[ENHANCED AI] Raw content:', content);
      // Fallback to text processing
      const lines = content.split('\n').filter((line: string) => line.trim());
      const fallbackTags = lines[1] ? lines[1].split(',').map((t: string) => t.trim()) : [];
      const enhancedFallback = this.extractEnhancedSongMetadata(lines[0] || '', fallbackTags, songData);
      
      return {
        description: lines[0] || songData.originalInput,
        tags: enhancedFallback.enhancedTags,
        additionalMetadata: { 
          extractedSongData: songData,
          bpm: enhancedFallback.bpm,
          energy: enhancedFallback.energy,
          mood: enhancedFallback.mood,
          tempo: enhancedFallback.tempo,
          algorhythmTags: enhancedFallback.algorhythmTags
        }
      };
    }
  }
  
  /**
   * Phase 2A: Extract enhanced song metadata from description and tags
   */
  private extractEnhancedSongMetadata(description: string, baseTags: string[], songData: ExtractedSongData): any {
    console.log('[PHASE 2A] Extracting enhanced song metadata');
    
    // Extract BPM from description with enhanced patterns
    const bpmPatterns = [
      /(\d+)\s*BPM/i,                    // "117 BPM"
      /BPM\s*(?:of\s*)?(\d+)/i,          // "BPM of 117"
      /(\d+)[\s-]*beats?\s*per\s*minute/i, // "117 beats per minute"
      /tempo.*?(\d+)/i,                  // "tempo of 117"
      /(\d+)[\s-]*bpm/i                  // "117-bpm" or "117bpm"
    ];
    
    let bpm = null;
    for (const pattern of bpmPatterns) {
      const match = description.match(pattern);
      if (match) {
        const extractedBpm = parseInt(match[1]);
        if (extractedBpm >= 60 && extractedBpm <= 200) { // Valid BPM range
          bpm = extractedBpm;
          console.log(`[BPM EXTRACTION] Found BPM: ${bpm} using pattern: ${pattern}`);
          break;
        }
      }
    }
    
    // Extract energy level
    const energyPatterns = {
      'high-energy': /high[\s-]?energy|energetic|intense|powerful|driving/i,
      'medium-energy': /medium[\s-]?energy|moderate|balanced/i,
      'low-energy': /low[\s-]?energy|calm|mellow|gentle|soft/i
    };
    
    let energy = 'medium-energy'; // default
    for (const [level, pattern] of Object.entries(energyPatterns)) {
      if (pattern.test(description) || baseTags.some(tag => pattern.test(tag))) {
        energy = level;
        break;
      }
    }
    
    // Extract mood
    const moodPatterns = {
      'romantic': /romantic|love|intimate|sensual|sultry/i,
      'upbeat': /upbeat|happy|cheerful|joyful|positive/i,
      'dramatic': /dramatic|emotional|intense|powerful/i,
      'playful': /playful|fun|lighthearted|whimsical/i,
      'melancholic': /sad|melancholic|nostalgic|wistful/i
    };
    
    const moods: string[] = [];
    for (const [moodType, pattern] of Object.entries(moodPatterns)) {
      if (pattern.test(description) || baseTags.some(tag => pattern.test(tag))) {
        moods.push(moodType);
      }
    }
    
    // Determine tempo category
    let tempo = 'medium-tempo';
    if (bpm) {
      if (bpm >= 120) tempo = 'fast-tempo';
      else if (bpm <= 80) tempo = 'slow-tempo';
    }
    
    // Generate enhanced tags
    const enhancedTags = [...baseTags];
    
    // Add BPM tag if extracted (enhanced with debugging)
    if (bpm) {
      const bpmTag = `${bpm}bpm`;
      // Check if BPM tag already exists
      const hasBpmTag = enhancedTags.some(tag => tag.toLowerCase().includes('bpm'));
      if (!hasBpmTag) {
        enhancedTags.push(bpmTag);
        console.log(`[BPM TAGS] Added BPM tag: ${bpmTag}`);
      } else {
        console.log(`[BPM TAGS] BPM tag already exists in tags:`, enhancedTags.filter(tag => tag.toLowerCase().includes('bpm')));
      }
    } else {
      console.log(`[BPM TAGS] No BPM detected in description: "${description.substring(0, 100)}..."`);
    }
    
    // Add tempo tag if not present
    if (!enhancedTags.some(tag => tag.includes('tempo'))) {
      enhancedTags.push(tempo);
    }
    
    // Add energy tag if not present
    if (!enhancedTags.some(tag => tag.includes('energy'))) {
      enhancedTags.push(energy);
    }
    
    // Add mood tags if not present
    moods.forEach(mood => {
      if (!enhancedTags.includes(mood)) {
        enhancedTags.push(mood);
      }
    });
    
    // Generate AlgoRhythm-specific tags
    const algorhythmTags = [
      `tempo-${tempo}`,
      `energy-${energy}`,
      ...moods.map(mood => `mood-${mood}`)
    ];
    
    if (bpm) {
      algorhythmTags.push(`bpm-range-${Math.floor(bpm / 10) * 10}`);
    }
    
    console.log('[PHASE 2A] Enhanced metadata extracted:', {
      bpm,
      energy,
      mood: moods.join(', '),
      tempo,
      enhancedTagsAdded: enhancedTags.length - baseTags.length
    });
    
    return {
      bpm,
      energy,
      mood: moods.join(', '),
      tempo,
      enhancedTags,
      algorhythmTags,
      albumArtUrl: null // Will be populated by album art service
    };
  }
  
  /**
   * Clean JSON response by removing markdown code blocks
   */
  private cleanJsonResponse(content: string): string {
    // Remove markdown code blocks like ```json ... ``` or ``` ... ```
    content = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    
    // Handle cases where response starts with markdown but no closing
    if (content.startsWith('```json')) {
      content = content.substring(7);
    } else if (content.startsWith('```')) {
      content = content.substring(3);
    }
    
    return content.trim();
  }

  /**
   * Process visual response with enhanced metadata
   */
  private processVisualResponse(response: any, context: EnhancedAIContext): any {
    let content = response.choices[0]?.message?.content?.trim() || '';
    
    // Clean up markdown code blocks if present
    content = this.cleanJsonResponse(content);
    
    try {
      const parsed = JSON.parse(content);
      return {
        description: parsed.description || context.shortDescription,
        tags: typeof parsed.tags === 'string' ? parsed.tags.split(',').map((t: string) => t.trim()) : parsed.tags || [],
        additionalMetadata: {
          layerProcessing: context.layer,
          creatorContext: context.shortDescription
        }
      };
    } catch (error) {
      console.warn('[ENHANCED AI] Failed to parse JSON response, using fallback processing');
      return {
        description: content || context.shortDescription,
        tags: [],
        additionalMetadata: { creatorContext: context.shortDescription }
      };
    }
  }

  /**
   * Process composite response with component integration
   */
  private processCompositeResponse(response: any, aggregatedData: any): any {
    let content = response.choices[0]?.message?.content?.trim() || '';
    
    // Clean up markdown code blocks if present
    content = this.cleanJsonResponse(content);
    
    try {
      const parsed = JSON.parse(content);
      return {
        description: parsed.description || 'Composite asset combining multiple layers',
        tags: typeof parsed.tags === 'string' ? parsed.tags.split(',').map((t: string) => t.trim()) : parsed.tags || [],
        additionalMetadata: {
          compositeData: aggregatedData,
          processingType: 'component-aggregation'
        }
      };
    } catch (error) {
      console.warn('[ENHANCED AI] Failed to parse JSON response, using fallback processing');
      return {
        description: `Composite asset combining ${aggregatedData.componentCount} components across ${aggregatedData.layersUsed.join(', ')} layers`,
        tags: aggregatedData.dominantStyles || [],
        additionalMetadata: { compositeData: aggregatedData }
      };
    }
  }

  /**
   * Generic layer processing for fallback scenarios
   */
  private async processGenericLayer(context: EnhancedAIContext): Promise<any> {
    console.log(`[ENHANCED AI] Processing ${context.layer} layer with generic strategy`);
    
    // Use the original metadata generation as fallback
    const assetContext: AssetContext = {
      layer: context.layer,
      categoryCode: context.category,
      subcategoryCode: context.subcategory,
      fileName: context.fileName,
      fileType: context.fileType
    };
    
    const imageUrl = context.image || context.thumbnail;
    if (imageUrl) {
      const result = await this.generateMetadata(imageUrl, assetContext);
      return {
        ...result,
        additionalMetadata: { 
          creatorContext: context.shortDescription,
          processingType: 'generic-fallback'
        }
      };
    } else {
      throw new Error('No image or thumbnail provided for generic processing');
    }
  }

  // Helper methods for composite processing
  private extractDominantStyles(styles: string[]): string[] {
    // Simple frequency analysis to find dominant styles
    const styleCounts = styles.reduce((acc, style) => {
      acc[style] = (acc[style] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(styleCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([style]) => style);
  }

  private analyzeEnergyLevels(components: ComponentMetadata[]): string[] {
    return components.flatMap(c => 
      c.tags.filter(tag => tag.includes('energy') || tag.includes('tempo'))
    );
  }

  private analyzeGenreCompatibility(components: ComponentMetadata[]): string[] {
    return components.flatMap(c => 
      c.tags.filter(tag => tag.includes('suitable') || tag.includes('compatible'))
    );
  }

  private generateComponentSummary(components: ComponentMetadata[]): string {
    const layers = components.map(c => c.layer).join(', ');
    return `${components.length} components across ${layers} layers`;
  }

  private buildCompositePrompt(aggregatedData: any, context: EnhancedAIContext): string {
    return `Generate description and tags for a composite asset combining multiple layers:

Creator's Description: "${context.shortDescription}"
Components Summary: ${aggregatedData.summary}
Layers Combined: ${aggregatedData.layersUsed.join(', ')}
Dominant Styles: ${aggregatedData.dominantStyles.join(', ')}

Create:
1. A cohesive description that explains how these components work together
2. Tags that capture the composite's overall aesthetic and compatibility

Focus on:
- Overall aesthetic harmony and production quality
- Cross-layer compatibility and synchronization
- Target use cases and performance applications
- Style coherence and visual balance

Respond in JSON format:
{
  "description": "Cohesive description of the composite asset...",
  "tags": "comma,separated,composite,optimized,tag,list"
}`;
  }
}

export const openaiService = new OpenAIService();
export default openaiService;
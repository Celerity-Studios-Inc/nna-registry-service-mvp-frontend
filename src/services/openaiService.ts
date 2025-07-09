/**
 * OpenAI Service for Automatic Asset Description and Tags Generation
 * Based on the automation guide and metadata guide for creators
 */

// Import diagnostic utility for troubleshooting
import { logEnvironmentDiagnostic } from '../utils/envDiagnostic';

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
                    url: fileUrl
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
                    url: fileUrl
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
}

export const openaiService = new OpenAIService();
export default openaiService;
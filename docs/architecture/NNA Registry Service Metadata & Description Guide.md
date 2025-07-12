# NNA Registry Service: Metadata & Description Guide for Creators, Editors, and Curators

Owner: Ajay Madhok

**Version**: 1.0

**Release Date**: July 2025

**Target Users**: Content Creators, Editors, and Curators

## Table of Contents

1. [Introduction](about:blank#introduction)
2. [Understanding AlgoRhythm Recommendations](about:blank#understanding-algorhythm-recommendations)
3. [Core Principles for Effective Metadata](about:blank#core-principles-for-effective-metadata)
4. [Layer-Specific Guidelines](about:blank#layer-specific-guidelines)
5. [Best Practices and Examples](about:blank#best-practices-and-examples)
6. [Common Mistakes to Avoid](about:blank#common-mistakes-to-avoid)
7. [Quality Checklist](about:blank#quality-checklist)

---

## Introduction

The NNA Registry Service enables creators to upload and register digital assets across multiple layers, each serving a specific role in video remixing. Your asset descriptions and metadata tags are crucial for **AlgoRhythm**, our AI recommendation engine, to make intelligent suggestions when users start with a song selection.

### How It Works

1. **User selects a song** (e.g., “Shake It Off” by Taylor Swift)
2. **AlgoRhythm analyzes** the song’s tempo (120 BPM), genre (Pop), energy (High), mood (Upbeat)
3. **AlgoRhythm recommends compatible assets** from other layers based on your descriptions and tags
4. **Better metadata = Better recommendations = Better user experience**

---

## Understanding AlgoRhythm Recommendations

AlgoRhythm uses a two-tower neural network that analyzes:

### Song Analysis Features

- **Tempo & Rhythm**: BPM, time signature, beat patterns
- **Genre & Style**: Pop, Rock, Hip-Hop, Latin, Electronic, etc.
- **Energy Level**: Low, Medium, High intensity
- **Mood & Emotion**: Happy, Sad, Energetic, Romantic, Aggressive
- **Instrumentation**: Acoustic, Electronic, Orchestra, etc.
- **Cultural Context**: Regional styles, traditional vs. contemporary

### Cross-Layer Compatibility Scoring

AlgoRhythm evaluates how well assets from different layers work together:
- **Stars ↔︎ Songs**: Performance style matching with musical energy
- **Looks ↔︎ Stars**: Visual coherence and style consistency

- **Moves ↔︎ Songs**: Choreography synchronization with tempo and rhythm
- **Worlds ↔︎ All**: Environmental context that enhances the overall aesthetic

---

## Core Principles for Effective Metadata

### 1. **Be Specific and Descriptive**

❌ “Nice outfit”

✅ “Contemporary streetwear with oversized hoodie, distressed jeans, and high-top sneakers”

### 2. **Include Musical Compatibility Keywords**

For non-song assets, think: “What types of songs would this work well with?”
- Energy levels: energetic, calm, intense, mellow
- Genres: pop-friendly, rock-compatible, hip-hop-suitable
- Moods: upbeat, romantic, dramatic, playful

### 3. **Use Consistent Terminology**

Stick to standard terms that AlgoRhythm recognizes:
- **Tempo**: fast, medium, slow, high-energy, low-energy
- **Style**: contemporary, classic, modern, vintage, futuristic
- **Mood**: happy, sad, energetic, romantic, dramatic, playful

### 4. **Think About User Intent**

Consider how creators will search and what they’re trying to achieve:
- “TikTok-ready dance moves”
- “Professional performance look”
- “Vintage concert stage”

---

## Layer-Specific Guidelines

### G - Songs Layer

*Primary layer that drives all recommendations*

**Description Focus:**
- Genre and subgenre
- Tempo and energy level
- Instrumentation and production style
- Vocal characteristics
- Cultural/regional influences

**Essential Tags:**

```
Genre: pop, rock, hip-hop, electronic, latin, country, r&b, jazz
Tempo: fast, medium, slow, 120bpm, uptempo, downtempo
Energy: high-energy, medium-energy, low-energy, intense, mellow
Mood: upbeat, romantic, sad, energetic, dramatic, playful, party
Style: contemporary, classic, acoustic, electronic, live, studio
```

**Example:**

```
Description: "Upbeat contemporary pop track with electronic beats, catchy vocal hooks, and energetic production. Features synthesized instruments with a danceable 128 BPM tempo. Perfect for high-energy performances and dance content."

Tags: pop, electronic, upbeat, high-energy, dance, contemporary, 128bpm, catchy, energetic, party, mainstream
```

---

### S - Stars Layer

*Performance avatars that must match song energy and style*

**Description Focus:**
- Performance style and energy
- Visual aesthetic and personality
- Movement capabilities
- Clothing/costume style
- Facial expressions and attitude

**Essential Tags:**

```
Style: contemporary, classic, edgy, elegant, casual, professional, streetwear
Energy: high-energy, medium-energy, low-energy, dynamic, static
Performance: dancer, singer, performer, model, actor
Aesthetic: modern, vintage, futuristic, urban, glamorous, minimalist
Mood: confident, playful, serious, romantic, edgy, sophisticated
Genre-compatibility: pop-suitable, rock-compatible, hip-hop-ready
```

**AlgoRhythm Matching Logic:**
- **High-energy songs** → Stars with dynamic, energetic performance styles
- **Romantic ballads** → Stars with soft, emotional expressions
- **Hip-hop tracks** → Stars with urban, contemporary aesthetics

**Example:**

```
Description: "Contemporary female performer with confident, energetic stage presence. Features modern streetwear styling with dynamic poses and expressive facial expressions. Perfect for pop, hip-hop, and electronic music performances."

Tags: female, contemporary, confident, energetic, streetwear, dynamic, expressive, pop-suitable, hip-hop-ready, modern, performer, high-energy
```

---

### L - Looks Layer

*Costumes and styling that complement Stars and match song aesthetics*

**Description Focus:**
- Clothing style and era
- Color scheme and visual impact
- Formality level
- Cultural influences
- Occasion/performance type

**Essential Tags:**

```
Style: streetwear, formal, casual, vintage, contemporary, elegant, edgy
Era: modern, retro, 80s, 90s, futuristic, classic, timeless
Color: bright, dark, colorful, monochrome, pastel, bold, neutral
Occasion: performance, concert, casual, formal, dance, stage
Aesthetic: minimalist, maximalist, urban, glamorous, artistic
Genre-compatibility: pop-friendly, rock-suitable, elegant-appropriate
```

**AlgoRhythm Matching Logic:**
- **Energetic pop songs** → Bright, contemporary, performance-ready outfits
- **Classic rock** → Leather, denim, edgy styling
- **Romantic ballads** → Elegant, flowing, sophisticated looks

**Example:**

```
Description: "Sparkly stage dress with contemporary cut and dynamic movement. Features sequined bodice with flowing skirt, perfect for high-energy pop performances. Bright colors and modern silhouette create visual impact under stage lights."

Tags: sparkly, stage-ready, contemporary, pop-friendly, bright, energetic, performance, sequined, flowing, high-energy, modern, dance-suitable
```

---

### M - Moves Layer

*Choreography that must synchronize with song tempo and style*

**Description Focus:**
- Movement tempo and intensity
- Dance style and technique
- Body parts involved
- Complexity level
- Cultural origin
- Synchronization capabilities

**Essential Tags:**

```
Tempo: fast, medium, slow, high-tempo, synced, rhythmic
Style: contemporary, hip-hop, latin, ballroom, street, commercial
Intensity: high-energy, medium-energy, low-energy, intense, gentle
Technique: simple, complex, beginner, intermediate, advanced
Body: full-body, upper-body, arms, legs, expressive, athletic
Sync: beat-synced, tempo-matched, rhythm-heavy, musical
```

**AlgoRhythm Matching Logic:**
- **120+ BPM songs** → Fast, high-energy, rhythm-heavy moves
- **Slow ballads** → Gentle, expressive, flowing choreography

- **Latin music** → Latin dance styles, hip movements, cultural authenticity

**Example:**

```
Description: "High-energy contemporary dance sequence with sharp movements and beat synchronization. Features full-body choreography with emphasis on arm expressions and hip movements. Perfect for pop and electronic music with 120-140 BPM tempo."

Tags: high-energy, contemporary, sharp, beat-synced, full-body, arms, hips, pop-suitable, electronic-ready, 120bpm, rhythmic, dynamic
```

---

### W - Worlds Layer

*Environmental settings that enhance the overall aesthetic*

**Description Focus:**
- Setting type and atmosphere
- Visual style and mood
- Lighting conditions
- Scale and grandeur
- Cultural context

**Essential Tags:**

```
Setting: stage, studio, outdoor, indoor, concert, club, street, beach
Atmosphere: energetic, intimate, dramatic, peaceful, exciting, professional
Style: modern, vintage, futuristic, urban, natural, industrial
Scale: intimate, large, grand, massive, cozy, expansive
Mood: bright, dark, colorful, moody, vibrant, sophisticated
Performance: concert-ready, dance-suitable, recording, live
```

**AlgoRhythm Matching Logic:**
- **Electronic/Dance music** → Club, stage, neon-lit environments
- **Acoustic songs** → Intimate, natural, studio settings
- **Rock music** → Concert stages, urban, industrial settings

**Example:**

```
Description: "Modern concert stage with dynamic LED lighting and professional sound setup. Features spacious performance area with colorful light shows perfect for high-energy pop and electronic performances. Stadium-scale with energetic atmosphere."

Tags: concert-stage, modern, LED-lighting, spacious, colorful, high-energy, pop-suitable, electronic-ready, stadium, energetic, professional, dynamic
```

---

### B - Branded Layer

*Premium brand integrations that enhance without overwhelming*

**Description Focus:**
- Brand integration style
- Product placement approach
- Visual prominence level
- Target audience alignment
- Aesthetic compatibility

**Essential Tags:**

```
Brand-style: subtle, prominent, elegant, bold, integrated, natural
Product: fashion, tech, lifestyle, luxury, sports, entertainment
Placement: background, featured, integrated, accent, prominent
Aesthetic: premium, luxury, contemporary, sporty, elegant, trendy
Audience: mainstream, luxury, youth, professional, trendy, sophisticated
```

**Example:**

```
Description: "Elegant luxury watch placement on performer's wrist with subtle brand visibility. Premium aesthetic that enhances sophistication without dominating the visual. Perfect for pop, R&B, and contemporary performances."

Tags: luxury, elegant, subtle, premium, sophisticated, pop-suitable, r&b-appropriate, contemporary, wrist-placement, natural-integration
```

---

### P - Personalize Layer

*User-generated customizations processed with privacy*

**Description Focus:**
- Customization type and scope
- Quality and resolution
- Integration approach
- Privacy considerations

**Essential Tags:**

```
Type: face-swap, voice-replacement, style-transfer, custom-outfit
Quality: high-resolution, clear, professional, amateur, mobile
Integration: seamless, natural, obvious, blended, realistic
Privacy: on-device, secure, anonymous, personal, private
```

---

### R - Rights Layer

*Legal and ownership tracking for all assets*

**Description Focus:**
- Rights ownership details
- Usage permissions
- Territory restrictions
- Revenue sharing models

**Essential Tags:**

```
Ownership: original, licensed, royalty-free, exclusive, shared
Usage: commercial, non-commercial, educational, unlimited, restricted
Territory: global, regional, us-only, eu-restricted, worldwide
Revenue: standard-split, custom-split, flat-fee, royalty-based
```

---

### C - Composites Layer

*Complete multi-layer combinations ready for use*

**Description Focus:**
- Component combination logic
- Overall aesthetic achieved
- Target use cases
- Quality and production value

**Essential Tags:**

```
Style: professional, amateur, polished, creative, experimental
Quality: high-production, standard, mobile-ready, broadcast
Purpose: social-media, professional, educational, entertainment
Aesthetic: cohesive, contrasting, balanced, dynamic, harmonious
```

---

## Best Practices and Examples

### Example 1: Pop Song → AlgoRhythm Recommendations

**Song Input:**

```
Description: "Upbeat pop anthem with driving electronic beats, catchy vocal hooks, and high-energy production at 128 BPM. Contemporary sound with mainstream appeal."
Tags: pop, electronic, upbeat, 128bpm, high-energy, mainstream, catchy, contemporary
```

**AlgoRhythm’s Recommendation Logic:**

**For Stars Layer:**
- Searches for: `high-energy`, `contemporary`, `pop-suitable`, `dynamic`
- Recommends: Energetic performers with modern styling

**For Looks Layer:**
- Searches for: `contemporary`, `pop-friendly`, `energetic`, `performance`
- Recommends: Modern performance outfits with visual impact

**For Moves Layer:**
- Searches for: `128bpm`, `high-energy`, `pop-suitable`, `beat-synced`
- Recommends: Fast choreography synchronized to 128 BPM

**For Worlds Layer:**
- Searches for: `energetic`, `pop-suitable`, `contemporary`, `stage`
- Recommends: Modern concert stages with dynamic lighting

---

### Example 2: Romantic Ballad → Recommendation Flow

**Song Input:**

```
Description: "Emotional piano ballad with soft vocals and gentle orchestration. Slow tempo around 70 BPM with romantic, intimate mood perfect for emotional storytelling."
Tags: ballad, romantic, soft, piano, 70bpm, emotional, intimate, gentle, orchestral
```

**AlgoRhythm Recommendations:**

**Stars:** Soft, emotional performers with intimate expressions

**Looks:** Elegant, romantic styling with flowing fabrics

**Moves:** Gentle, expressive choreography with emotional storytelling

**Worlds:** Intimate settings with warm, romantic lighting

---

### Example 3: Hip-Hop Track → Recommendation Flow

**Song Input:**

```
Description: "Hard-hitting hip-hop track with heavy bass, trap-influenced beats, and aggressive vocal delivery. Fast 140 BPM tempo with urban, street-ready energy."
Tags: hip-hop, trap, aggressive, 140bpm, bass-heavy, urban, street, hard-hitting, fast
```

**AlgoRhythm Recommendations:**

**Stars:** Urban performers with confident, edgy attitudes

**Looks:** Streetwear, urban fashion with bold styling

**Moves:** Hip-hop choreography with sharp, rhythmic movements

**Worlds:** Urban environments, street settings, club atmospheres

---

## Common Mistakes to Avoid

### ❌ Vague Descriptions

“Nice dance move” → Tells AlgoRhythm nothing about tempo, style, or compatibility

### ❌ Missing Energy Indicators

Not including energy levels makes it impossible to match with song intensity

### ❌ Genre-Specific Language Only

Using only “pop” without describing visual or performance characteristics

### ❌ Overly Technical Language

“Polyrhythmic syncopated movements” → Use simpler, more universal terms

### ❌ Inconsistent Terminology

Mixing “high-energy” and “intense” randomly instead of consistently

### ❌ Missing Compatibility Tags

Not including genre-compatibility tags like “pop-suitable” or “rock-compatible”

---

## Quality Checklist

Before submitting your asset, ensure:

### Description Quality

- [ ]  Specific and detailed (not vague)
- [ ]  Includes energy level indicators
- [ ]  Mentions style and aesthetic
- [ ]  Describes compatibility with musical genres
- [ ]  Uses clear, professional language

### Tags Effectiveness

- [ ]  Includes energy tags (high-energy, medium-energy, low-energy)
- [ ]  Contains style descriptors (contemporary, classic, urban, etc.)
- [ ]  Has genre-compatibility tags (pop-suitable, rock-compatible, etc.)
- [ ]  Uses consistent terminology throughout
- [ ]  Covers all relevant characteristics

### AlgoRhythm Optimization

- [ ]  Enables tempo-based matching (for Moves)
- [ ]  Supports energy-level compatibility (all layers)
- [ ]  Includes style coherence indicators (Looks, Stars)
- [ ]  Provides mood and atmosphere context (Worlds)
- [ ]  Uses terminology AlgoRhythm can understand

### Layer-Specific Requirements

- [ ]  **Songs**: Tempo, genre, energy, mood clearly described
- [ ]  **Stars**: Performance style and energy level specified
- [ ]  **Looks**: Style, era, and occasion appropriateness indicated
- [ ]  **Moves**: Tempo compatibility and intensity level included
- [ ]  **Worlds**: Atmosphere and setting type clearly defined

---

## Conclusion

Effective metadata and descriptions are the foundation of AlgoRhythm’s recommendation accuracy. By following these guidelines, you ensure that:

1. **Users get relevant recommendations** when they start with a song
2. **Your assets are discoverable** in the right contexts
3. **The remix creation process is seamless** and intuitive
4. **The overall platform quality improves** for all users

Remember: **Every tag and description word matters** for AlgoRhythm’s AI analysis. Take time to craft thoughtful, specific metadata that accurately represents your asset and its compatibility with different musical styles and energies.

---

*For technical questions about the NNA Registry Service, consult the Technical Implementation Guide. For AlgoRhythm algorithm details, see the AI Recommendation Engine documentation.*
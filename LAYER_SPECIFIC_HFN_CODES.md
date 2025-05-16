# Layer-Specific HFN Codes Documentation

## Overview

The NNA Registry Service uses a dual addressing scheme:

1. **Human-Friendly Names (HFN)**: Three-letter alphabetic codes (e.g., POP, ROK, BCH)
2. **Machine-Friendly Addresses (MFA)**: Three-digit numeric codes (e.g., 001, 002, 003)

This document provides a reference for the layer-specific HFN codes used in the system.

## Layer-Specific Category Codes

Each layer has its own set of categories with specific three-letter codes:

### G (Songs) Layer

| Numeric Code | Alphabetic Code | Category Name |
|--------------|-----------------|---------------|
| 001 | POP | Pop |
| 002 | ROK | Rock |
| 003 | RNB | R&B |
| 004 | HIP | Hip Hop |
| 005 | EDM | EDM |
| 006 | CTY | Country |
| 007 | LTN | Latin |
| 008 | REG | Reggae |
| 009 | IND | Indie |
| 010 | ALT | Alternative |
| 011 | JAZ | Jazz |
| 012 | CLS | Classical |
| 013 | FLK | Folk |
| 014 | MET | Metal |
| 015 | BLU | Blues |
| 016 | FNK | Funk |
| 017 | DNC | Dance |
| 018 | SOU | Soul |
| 019 | ORB | Orbit |

### S (Stars) Layer

| Numeric Code | Alphabetic Code | Category Name |
|--------------|-----------------|---------------|
| 001 | POP | Pop Star |
| 002 | ROK | Rock Star |
| 003 | RNB | R&B Star |
| 004 | HIP | Hip Hop Star |
| 005 | EDM | EDM Star |
| 006 | CTY | Country Star |
| 007 | LTN | Latin Star |
| 008 | REG | Reggae Star |
| 009 | IND | Indie Star |
| 010 | ALT | Alternative Star |
| 011 | JAZ | Jazz Star |
| 012 | CLS | Classical Star |
| 013 | FLK | Folk Star |
| 014 | MET | Metal Star |
| 015 | BLU | Blues Star |
| 016 | FNK | Funk Star |
| 017 | DNC | Dance Star |
| 018 | SOU | Soul Star |
| 019 | ORB | Orbit Star |

### L (Looks) Layer

| Numeric Code | Alphabetic Code | Category Name |
|--------------|-----------------|---------------|
| 001 | POP | Modern_Performance |
| 002 | ROK | Traditional_Attire |
| 003 | HIP | Stage_Ready |
| 004 | RNB | Casual |
| 005 | JZZ | Designer |
| 006 | LAT | Urban |
| 007 | IND | Vintage |
| 008 | ALT | Cultural |
| 009 | WLD | Futuristic |
| 010 | DSC | Fantasy |
| 011 | EDM | Y2K_Fashion |
| 012 | CLB | Sustainable_Fashion |
| 013 | URB | Digital_Fashion |
| 014 | SPO | Sportswear |

### W (Worlds) Layer

| Numeric Code | Alphabetic Code | Category Name |
|--------------|-----------------|---------------|
| 001 | CLB | Dance Clubs |
| 002 | STG | Concert Stages |
| 003 | URB | Urban |
| 004 | BCH | Beach |
| 005 | FES | Festival |
| 006 | TRL | Trailer |
| 007 | SPC | Space |
| 008 | VRT | Virtual |
| 009 | CCH | Coachella |
| 010 | NAT | Natural |
| 011 | FAN | Fantasy |
| 012 | FUT | Futuristic |
| 013 | IND | Industrial |
| 014 | RUR | Rural |
| 015 | HIS | Historical |
| 016 | CUL | Cultural |
| 017 | ABS | Abstract |
| 018 | RET | Retro |
| 019 | NTR | Nature |

### M (Moves) Layer

| Numeric Code | Alphabetic Code | Category Name |
|--------------|-----------------|---------------|
| 001 | DNC | Dance |
| 002 | POS | Pose |
| 003 | FIT | Fitness |
| 004 | MRT | Martial Arts |
| 005 | SPT | Sports |
| 006 | GYM | Gymnastics |
| 007 | YGA | Yoga |
| 008 | AER | Aerobics |
| 009 | POP | Pop Dance |
| 010 | HIP | Hip Hop Dance |
| 011 | BLK | Ballet/Classical |
| 012 | JAZ | Jazz Dance |
| 013 | CNT | Contemporary |
| 014 | LAT | Latin Dance |
| 015 | BRK | Breakdance |
| 016 | STR | Street Dance |

## Layer-Specific Subcategory Codes

Some specific combinations of layer and category have their own set of subcategory codes:

### W.001 (Worlds.Dance_Clubs / W.CLB)

| Numeric Code | Alphabetic Code | Subcategory Name |
|--------------|-----------------|------------------|
| 001 | BAS | Base |
| 002 | NEO | Neon |
| 003 | BLK | Black |
| 004 | VIP | VIP Lounge |
| 005 | RTF | Rooftop |
| 006 | UND | Underground |
| 007 | RET | Retro |
| 008 | BCH | Beach Club |

### W.002 (Worlds.Concert_Stages / W.STG)

| Numeric Code | Alphabetic Code | Subcategory Name |
|--------------|-----------------|------------------|
| 001 | BAS | Base |
| 002 | NBA | NBA |
| 003 | NFL | NFL |
| 004 | ROY | Royal |
| 005 | ARE | Arena |
| 006 | FES | Festival |
| 007 | THE | Theater |
| 008 | STD | Stadium |
| 009 | UND | Underground |
| 010 | OUT | Outdoor |

### W.004 (Worlds.Beach / W.BCH)

| Numeric Code | Alphabetic Code | Subcategory Name |
|--------------|-----------------|------------------|
| 001 | BAS | Base |
| 002 | TRO | Tropical |
| 003 | SUN | Sunset |
| 004 | WAV | Waves |
| 005 | PAL | Palm |

### S.001 (Stars.Pop / S.POP)

| Numeric Code | Alphabetic Code | Subcategory Name |
|--------------|-----------------|------------------|
| 001 | BAS | Base |
| 002 | DIV | Pop_Diva_Female_Stars |
| 003 | IDF | Pop_Idol_Female_Stars |
| 004 | LGF | Pop_Legend_Female_Stars |
| 005 | LGM | Pop_Legend_Male_Stars |
| 006 | ICM | Pop_Icon_Male_Stars |
| 007 | HPM | Pop_Hipster_Male_Stars |

## Critical Special Cases

The most important special cases to be aware of are:

### W.BCH.SUN - Beach Sunset in Worlds Layer

This combination must map to `5.004.003` in MFA format. The W (Worlds) layer maps to 5, BCH (Beach) maps to 004, and SUN (Sunset) maps to 003.

### S.POP.HPM - Pop Hipster Male Stars in Stars Layer

This combination must map to `3.001.007` in MFA format. The S (Stars) layer maps to 3, POP (Pop) maps to 001, and HPM (Hipster Male) maps to 007.

## Implementation Details

The system uses a layered approach to determine the appropriate HFN code:

1. First, it checks for a specific mapping in the layer-specific tables defined in taxonomyService.ts
2. If not found, it falls back to generic mappings
3. If still not found, it generates a code from the category or subcategory name
4. For known special cases, explicit mappings are defined to ensure consistency

### Code Structure

The mapping implementation uses a nested structure in taxonomyService.ts:

```typescript
// Layer-specific mappings for categories
const layerSpecificMappings: Record<string, Record<string, string>> = {
  'G': { '001': 'POP', '002': 'ROK', ... },
  'S': { '001': 'POP', '002': 'ROK', ... },
  'W': { '001': 'CLB', '002': 'STG', '004': 'BCH', ... },
  'M': { '001': 'DNC', '002': 'POS', ... }
};

// Layer-specific mappings for subcategories
const layerCategorySpecificMappings: Record<string, Record<string, Record<string, string>>> = {
  'W': {
    '001': { '001': 'BAS', '002': 'NEO', ... },
    '002': { '001': 'BAS', '002': 'NBA', ... },
    '004': { '001': 'BAS', '002': 'TRO', '003': 'SUN', ... }
  },
  'S': {
    '001': { '001': 'BAS', '002': 'DIV', '007': 'HPM', ... }
  }
};
```

This approach ensures proper HFN display while maintaining the integrity of the taxonomy data by keeping the mappings centralized and consistent across the application.
# Taxonomy Code Mapping Reference

This document provides a comprehensive reference for the HFN (Human-Friendly Name) code mappings used in the NNA Registry Service.

## Code Mapping Approach

The system uses fixed mappings for each layer to ensure consistency in HFN codes based on the screenshots and user testing.

### Key Principles

1. **Source of Truth**: 
   - Use the `code` property from the taxonomy data if available
   - Fall back to layer-specific predefined mappings
   - Generate codes from names only as a last resort

2. **Layer-Specific Mappings**: 
   - Different layers have their own distinct mappings
   - Mappings are defined explicitly to prevent inconsistencies
   - Special handling for each layer ensures proper display

## Layer-Specific HFN Code Mappings

### Songs Layer (G)

| Numeric | HFN | Category Name |
|---|---|---|
| 001 | POP | Pop |
| 002 | ROK | Rock |
| 003 | HIP | Hip Hop |
| 004 | RNB | R&B |
| 005 | JZZ | Jazz |
| 006 | CTY | Country/Latin |
| 007 | LTN | Latin |
| 008 | REG | Reggae |
| 009 | IND | Indie |
| 010 | ALT | Alternative |

### Stars Layer (S)

| Numeric | HFN | Category Name |
|---|---|---|
| 001 | POP | Pop |
| 002 | ROK | Rock |
| 003 | HIP | Hip Hop |
| 004 | RNB | R&B |
| 005 | JZZ | Jazz |
| 006 | CTY | Country |
| 007 | LTN | Latin |
| 008 | REG | Reggae |

### Looks Layer (L)

| Numeric | HFN | Category Name |
|---|---|---|
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

### Worlds Layer (W)

| Numeric | HFN | Category Name |
|---|---|---|
| 001 | CLB | Dance Clubs |
| 002 | STG | Concert Stages |
| 003 | URB | Urban |
| 004 | BCH | Beach |
| 005 | FES | Festival |
| 006 | TRL | Trailer |
| 007 | SPC | Space |
| 008 | VRT | Virtual |
| 009 | CCH | Coachella |

### Moves Layer (M)

| Numeric | HFN | Category Name |
|---|---|---|
| 001 | DNC | Dance/Pop_Dance |
| 002 | POS | Pose/Jazz_Dance |
| 003 | FIT | Fitness/Hip_Hop_Dance |
| 004 | MRT | Martial Arts/Latin_Dance |
| 005 | SPT | Sports/EDM_Dance |
| 006 | GYM | Gymnastics/Rock_Dance |
| 007 | YGA | Yoga/RnB_Dance |
| 008 | AER | Aerobics/Bollywood_Dance |
| 009 | POP | Pop Dance |
| 010 | HIP | Hip Hop Dance |
| 011 | BLK | Ballet/Classical |
| 012 | JAZ | Jazz Dance |
| 013 | CNT | Contemporary Dance |
| 014 | LAT | Latin Dance |
| 015 | BRK | Breakdance |
| 016 | STR | Street Dance |

## Special Subcategory Mappings

### Stars.POP Subcategories

| Numeric | HFN | Subcategory |
|---|---|---|
| 001 | BAS | Base |
| 002 | DIV | Pop_Diva_Female_Stars |
| 003 | IDF | Pop_Idol_Female_Stars |
| 004 | LGF | Pop_Legend_Female_Stars |
| 005 | LGM | Pop_Legend_Male_Stars |
| 006 | ICM | Pop_Icon_Male_Stars |
| 007 | HPM | Pop_Hipster_Male_Stars |

### World.CLB Subcategories (Dance Clubs)

| Numeric | HFN | Subcategory |
|---|---|---|
| 001 | BAS | Base |
| 002 | NEO | Neon |
| 003 | BLK | Black |
| 004 | VIP | VIP Lounge |
| 005 | RTF | Rooftop |
| 006 | UND | Underground |

### World.BCH Subcategories (Beach)

| Numeric | HFN | Subcategory |
|---|---|---|
| 001 | BAS | Base |
| 002 | TRO | Tropical |
| 003 | SUN | Sunset |

## Implementation Details

The code mappings are implemented in the `taxonomyService.ts` file using a series of mapping objects:

1. `layerNumericToHFN`: Layer-specific mappings for categories
2. `layerCategorySubcategoryMappings`: Mappings for specific layer-category-subcategory combinations
3. `standardSubcategoryMappings`: Common subcategory mappings used as fallbacks

### Code Generation Logic

When a code is not found in any mapping:

1. For multi-word names, it takes the first letter of each word (up to 3)
2. For two-word names, it takes the first two letters of the first word + first letter of the second
3. For single words, it takes the first 3 letters 

This approach ensures that all HFN codes follow the three-letter uppercase format while maintaining consistency with the taxonomy data.
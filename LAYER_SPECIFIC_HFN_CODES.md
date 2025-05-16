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
| 003 | HIP | Hip Hop |
| 004 | RNB | R&B |
| 005 | JZZ | Jazz |
| 006 | LAT | Latin |
| 007 | IND | Indie |
| 008 | ALT | Alternative |
| 009 | WLD | World |
| 010 | DSC | Disco |
| 011 | EDM | Electronic |

### S (Stars) Layer

| Numeric Code | Alphabetic Code | Category Name |
|--------------|-----------------|---------------|
| 001 | POP | Pop |
| 002 | ROK | Rock |
| 003 | HIP | Hip Hop |
| 004 | RNB | R&B |
| 005 | JZZ | Jazz |
| 006 | LAT | Latin |
| 007 | IND | Indie |
| 008 | ALT | Alternative |

### W (Worlds) Layer

| Numeric Code | Alphabetic Code | Category Name |
|--------------|-----------------|---------------|
| 001 | CLB | Dance Clubs |
| 002 | STG | Concert Stages |
| 003 | URB | Urban |
| 004 | BCH | Beach |
| 005 | NAT | Natural |
| 006 | FAN | Fantasy |
| 007 | FUT | Futuristic |
| 008 | VIR | Virtual |
| 009 | IND | Industrial |
| 010 | RUR | Rural |
| 011 | HIS | Historical |
| 012 | CUL | Cultural |
| 013 | ABS | Abstract |
| 014 | RET | Retro |
| 015 | NTR | Nature |

### M (Moves) Layer

| Numeric Code | Alphabetic Code | Category Name |
|--------------|-----------------|---------------|
| 001 | POP | Pop Dance |
| 002 | HIP | Hip Hop Dance |
| 003 | BLK | Ballet/Classical |
| 004 | JAZ | Jazz Dance |
| 005 | CNT | Contemporary |
| 006 | LAT | Latin Dance |
| 007 | BRK | Breakdance |
| 008 | STR | Street Dance |

## Layer-Specific Subcategory Codes

Some specific combinations of layer and category have their own set of subcategory codes:

### W.001 (Worlds.Dance_Clubs)

| Numeric Code | Alphabetic Code | Subcategory Name |
|--------------|-----------------|------------------|
| 001 | BAS | Base |
| 002 | NEO | Neon |
| 003 | VIP | VIP Lounge |
| 004 | RTF | Rooftop |
| 005 | UND | Underground |
| 006 | RET | Retro |
| 007 | BCH | Beach Club |

### W.002 (Worlds.Concert_Stages)

| Numeric Code | Alphabetic Code | Subcategory Name |
|--------------|-----------------|------------------|
| 001 | BAS | Base |
| 002 | ARE | Arena |
| 003 | FES | Festival |
| 004 | THE | Theater |
| 005 | STD | Stadium |
| 006 | UND | Underground |
| 007 | OUT | Outdoor |

### W.004 (Worlds.Beach)

| Numeric Code | Alphabetic Code | Subcategory Name |
|--------------|-----------------|------------------|
| 001 | BAS | Base |
| 002 | TRO | Tropical |
| 003 | SUN | Sunset |
| 004 | WAV | Waves |
| 005 | PAL | Palm |

### S.001 (Stars.Pop)

| Numeric Code | Alphabetic Code | Subcategory Name |
|--------------|-----------------|------------------|
| 001 | BAS | Base |
| 002 | DIV | Pop_Diva_Female_Stars |
| 003 | IDF | Pop_Idol_Female_Stars |
| 004 | LGF | Pop_Legend_Female_Stars |
| 005 | LGM | Pop_Legend_Male_Stars |
| 006 | ICM | Pop_Icon_Male_Stars |
| 007 | HPM | Pop_Hipster_Male_Stars |

## Special Cases

The most important special case to be aware of is:

### W.BCH.SUN - Beach Sunset in Worlds Layer

This combination must map to `5.003.003` in MFA format. The W (Worlds) layer maps to 5, BCH (Beach) maps to 003, and SUN (Sunset) maps to 003. 

## Implementation Notes

The system uses a layered approach to determine the appropriate HFN code:

1. First, it checks for a specific mapping in the layer-specific tables
2. If not found, it falls back to generic mappings
3. If still not found, it generates a code from the category or subcategory name
4. For known special cases, explicit mappings are defined to ensure consistency

This approach ensures proper HFN display while maintaining the integrity of the taxonomy data.
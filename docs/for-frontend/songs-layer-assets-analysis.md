# Songs Layer Assets Analysis - Staging Environment

Generated on: 2025-07-15T15:28:30.880Z

## Summary Statistics

| Metric | Count | Percentage |
|--------|-------|------------|
| Total Songs Assets | 15 | 100% |
| With Creator Description | 0 | 0% |
| With Album Art | 0 | 0% |
| With AI Metadata | 0 | 0% |
| **Need Migration** | **15** | **100%** |

## Assets by Category and Subcategory

### Dance_Electronic - Techno (1 assets)

| Asset Name | Creator Description | Album Art | AI Metadata | Description |
|------------|-------------------|-----------|-------------|-------------|
| G.DNC.TEC.001 | Missing | ❌ | ❌ | Shake It To The Max by Moliy & Silent Addy. A high... |

### Hip_Hop - Modern_Hip_Hop (1 assets)

| Asset Name | Creator Description | Album Art | AI Metadata | Description |
|------------|-------------------|-----------|-------------|-------------|
| G.HIP.MOD.001 | Missing | ❌ | ❌ | Anxiety by Doechii.  A smooth and introspective tr... |

### Hip_Hop - Trap (1 assets)

| Asset Name | Creator Description | Album Art | AI Metadata | Description |
|------------|-------------------|-----------|-------------|-------------|
| G.HIP.TRP.001 | Missing | ❌ | ❌ | What It Is (Block Boy) – Doechii ft. Kodak Black. ... |

### Latin - Pop (1 assets)

| Asset Name | Creator Description | Album Art | AI Metadata | Description |
|------------|-------------------|-----------|-------------|-------------|
| G.LAT.POP.001 | Missing | ❌ | ❌ | Try Everything by Shakira.
An energetic and upbeat... |

### Pop - Electro_Pop (1 assets)

| Asset Name | Creator Description | Album Art | AI Metadata | Description |
|------------|-------------------|-----------|-------------|-------------|
| G.POP.ELC.001 | Missing | ❌ | ❌ | Abracadabra by Lady Gaga. A high-energy pop anthem... |

### Pop - Global_Pop (2 assets)

| Asset Name | Creator Description | Album Art | AI Metadata | Description |
|------------|-------------------|-----------|-------------|-------------|
| G.POP.GLB.001 | Missing | ❌ | ❌ | Bluest Flame by Selena Gomez & Benny Blanco. A hau... |
| G.POP.GLB.002 | Missing | ❌ | ❌ | If You're Done With Your Ex by Gladdest. A catchy ... |

### Pop - Latin_Pop (1 assets)

| Asset Name | Creator Description | Album Art | AI Metadata | Description |
|------------|-------------------|-----------|-------------|-------------|
| G.POP.LAT.001 | Missing | ❌ | ❌ | Senorita by Shawn Mendes & Camila Cabello. A sultr... |

### Pop - Soul_Pop (1 assets)

| Asset Name | Creator Description | Album Art | AI Metadata | Description |
|------------|-------------------|-----------|-------------|-------------|
| G.POP.SOU.001 | Missing | ❌ | ❌ | Pretty Little Baby by Connie Francis. A vintage po... |

### Pop - Teen_Pop (3 assets)

| Asset Name | Creator Description | Album Art | AI Metadata | Description |
|------------|-------------------|-----------|-------------|-------------|
| G.POP.TEN.001 | Missing | ❌ | ❌ | test... |
| G.POP.TEN.002 | Missing | ❌ | ❌ | Espresso by Sabrina Carpenter. An upbeat pop track... |
| G.POP.TEN.003 | Missing | ❌ | ❌ | Manchild by Sabrina Carpenter. A sassy and playful... |

### POP - TSW (1 assets)

| Asset Name | Creator Description | Album Art | AI Metadata | Description |
|------------|-------------------|-----------|-------------|-------------|
| G.POP.TSW.001 | Missing | ❌ | ❌ | Test asset... |

### RnB - Modern (2 assets)

| Asset Name | Creator Description | Album Art | AI Metadata | Description |
|------------|-------------------|-----------|-------------|-------------|
| G.RNB.MOD.001 | Missing | ❌ | ❌ | APT by ROSÉ & Bruno Mars. A sultry collaboration b... |
| G.RNB.MOD.002 | Missing | ❌ | ❌ | Nasty by Tinashe. A bold and confident R&B track w... |

## Migration Recommendations

1. **Priority**: Focus on songs layer assets first (high impact, low count)
2. **Creator Descriptions**: Add meaningful descriptions with song/artist/album info
3. **Album Art**: Add album art URLs where available
4. **Testing**: Verify functionality after migration
5. **Bulk Migration**: Consider automated migration for visual assets later

## Migration Script Template

```javascript
// Migration script for songs layer assets
const songsAssets = [
  {
    _id: '686888aa0e93d8d76ca58ede',
    name: 'G.DNC.TEC.001',
    category: 'Dance_Electronic',
    subcategory: 'Techno',
    // TODO: Add creator description manually
    creatorDescription: '[MIGRATION NEEDED] G.DNC.TEC.001',
    albumArt: '',
    aiMetadata: '{}'
  },
  {
    _id: '686885a20e93d8d76ca58ea3',
    name: 'G.HIP.MOD.001',
    category: 'Hip_Hop',
    subcategory: 'Modern_Hip_Hop',
    // TODO: Add creator description manually
    creatorDescription: '[MIGRATION NEEDED] G.HIP.MOD.001',
    albumArt: '',
    aiMetadata: '{}'
  },
  {
    _id: '686889c70e93d8d76ca58ee4',
    name: 'G.HIP.TRP.001',
    category: 'Hip_Hop',
    subcategory: 'Trap',
    // TODO: Add creator description manually
    creatorDescription: '[MIGRATION NEEDED] G.HIP.TRP.001',
    albumArt: '',
    aiMetadata: '{}'
  },
  {
    _id: '686885140e93d8d76ca58e9d',
    name: 'G.LAT.POP.001',
    category: 'Latin',
    subcategory: 'Pop',
    // TODO: Add creator description manually
    creatorDescription: '[MIGRATION NEEDED] G.LAT.POP.001',
    albumArt: '',
    aiMetadata: '{}'
  },
  {
    _id: '686887470e93d8d76ca58ecf',
    name: 'G.POP.ELC.001',
    category: 'Pop',
    subcategory: 'Electro_Pop',
    // TODO: Add creator description manually
    creatorDescription: '[MIGRATION NEEDED] G.POP.ELC.001',
    albumArt: '',
    aiMetadata: '{}'
  },
  {
    _id: '686886f90e93d8d76ca58ec6',
    name: 'G.POP.GLB.001',
    category: 'Pop',
    subcategory: 'Global_Pop',
    // TODO: Add creator description manually
    creatorDescription: '[MIGRATION NEEDED] G.POP.GLB.001',
    albumArt: '',
    aiMetadata: '{}'
  },
  {
    _id: '686887b20e93d8d76ca58ed2',
    name: 'G.POP.GLB.002',
    category: 'Pop',
    subcategory: 'Global_Pop',
    // TODO: Add creator description manually
    creatorDescription: '[MIGRATION NEEDED] G.POP.GLB.002',
    albumArt: '',
    aiMetadata: '{}'
  },
  {
    _id: '6868848e0e93d8d76ca58e9a',
    name: 'G.POP.LAT.001',
    category: 'Pop',
    subcategory: 'Latin_Pop',
    // TODO: Add creator description manually
    creatorDescription: '[MIGRATION NEEDED] G.POP.LAT.001',
    albumArt: '',
    aiMetadata: '{}'
  },
  {
    _id: '687033a141a3f41f296f9309',
    name: 'G.POP.SOU.001',
    category: 'Pop',
    subcategory: 'Soul_Pop',
    // TODO: Add creator description manually
    creatorDescription: '[MIGRATION NEEDED] G.POP.SOU.001',
    albumArt: '',
    aiMetadata: '{}'
  },
  {
    _id: '68672c029a4d969d7de8f2b4',
    name: 'G.POP.TEN.001',
    category: 'Pop',
    subcategory: 'Teen_Pop',
    // TODO: Add creator description manually
    creatorDescription: '[MIGRATION NEEDED] G.POP.TEN.001',
    albumArt: '',
    aiMetadata: '{}'
  },
  {
    _id: '686886510e93d8d76ca58eb9',
    name: 'G.POP.TEN.002',
    category: 'Pop',
    subcategory: 'Teen_Pop',
    // TODO: Add creator description manually
    creatorDescription: '[MIGRATION NEEDED] G.POP.TEN.002',
    albumArt: '',
    aiMetadata: '{}'
  },
  {
    _id: '68705e0341a3f41f296f9953',
    name: 'G.POP.TEN.003',
    category: 'Pop',
    subcategory: 'Teen_Pop',
    // TODO: Add creator description manually
    creatorDescription: '[MIGRATION NEEDED] G.POP.TEN.003',
    albumArt: '',
    aiMetadata: '{}'
  },
  {
    _id: '6873dc1ff70b9e4857128690',
    name: 'G.POP.TSW.001',
    category: 'POP',
    subcategory: 'TSW',
    // TODO: Add creator description manually
    creatorDescription: '[MIGRATION NEEDED] G.POP.TSW.001',
    albumArt: '',
    aiMetadata: '{}'
  },
  {
    _id: '686886020e93d8d76ca58eb6',
    name: 'G.RNB.MOD.001',
    category: 'RnB',
    subcategory: 'Modern',
    // TODO: Add creator description manually
    creatorDescription: '[MIGRATION NEEDED] G.RNB.MOD.001',
    albumArt: '',
    aiMetadata: '{}'
  },
  {
    _id: '686886980e93d8d76ca58ebc',
    name: 'G.RNB.MOD.002',
    category: 'RnB',
    subcategory: 'Modern',
    // TODO: Add creator description manually
    creatorDescription: '[MIGRATION NEEDED] G.RNB.MOD.002',
    albumArt: '',
    aiMetadata: '{}'
  },
];

// Update each asset
for (const asset of songsAssets) {
  await Asset.updateOne(
    { _id: asset._id },
    {
      $set: {
        creatorDescription: asset.creatorDescription,
        albumArt: asset.albumArt,
        aiMetadata: asset.aiMetadata
      }
    }
  );
}
```

## Notes

- Total assets requiring migration: **15**
- Migration priority: Songs layer assets first
- Consider manual review for creator descriptions
- Test frontend display after migration

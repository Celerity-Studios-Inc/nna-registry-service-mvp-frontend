# Subcategory Display Fix Implementation

## Overview

We've implemented a frontend workaround to preserve the originally selected subcategory when displaying assets, even though the backend normalizes most subcategories to "BAS" (Base).

## Implementation Details

### 1. Track Original Subcategory

**File:** `TaxonomySelection.tsx`
- Added parameter to `onNNAAddressChange` to pass the original subcategory code
- Store the original subcategory code when generating NNA addresses
- Pass this value to parent components for later use

```typescript
// Store the original subcategory code to preserve it after backend normalization
const originalSubcategoryCode = subcategoryAlpha;
console.log(`Storing original subcategory code: ${originalSubcategoryCode} for display override`);

// Always pass the original 3-letter codes along with the MFA and HFN
onNNAAddressChange(hfnAddress, mfaAddress, sequentialNum, originalSubcategoryCode);
```

### 2. Store Original Subcategory in RegisterAssetPage

**File:** `RegisterAssetPage.tsx`
- Added state to track the original subcategory
- Updated `handleNNAAddressChange` to store the original subcategory

```typescript
// Track original subcategory for display override
const [originalSubcategoryCode, setOriginalSubcategoryCode] = useState<string>('');

// Handle NNA address change
const handleNNAAddressChange = (
  humanFriendlyName: string,
  machineFriendlyAddress: string,
  sequentialNumber: number,
  originalSubcategory?: string
) => {
  setValue('hfn', humanFriendlyName);
  setValue('mfa', machineFriendlyAddress);
  setValue('sequential', sequentialNumber.toString());
  
  // Store the original subcategory for display override in success screen
  if (originalSubcategory) {
    setOriginalSubcategoryCode(originalSubcategory);
    console.log(`Stored original subcategory code: ${originalSubcategory} for display override`);
  }
};
```

### 3. Override Display in Success Screen

**File:** `RegisterAssetPage.tsx`
- Added logic to replace "BAS" with the original subcategory code in the HFN display
- Added visual indicator (InfoIcon) to show when the display has been adjusted

```typescript
// Check if we need to override the display with original subcategory
if (originalSubcategoryCode && createdAsset.subcategory === 'Base' && createdAsset.layer === 'S') {
  // Parse the backend HFN (e.g., "S.POP.BAS.015")
  const parts = hfn.split('.');
  if (parts.length === 4 && parts[2] === 'BAS') {
    // Replace BAS with the original subcategory
    parts[2] = originalSubcategoryCode;
    const displayHfn = parts.join('.');
    console.log(`DISPLAY OVERRIDE: Replacing backend HFN ${hfn} with original subcategory version ${displayHfn}`);
    hfn = displayHfn;
  }
}
```

### 4. Add User Notification

**File:** `TaxonomySelection.tsx`
- Added warning alert for non-HPM subcategories that will be normalized
- Clearly explains the behavior to users

```typescript
{layerCode === 'S' && 
 selectedCategoryCode === 'POP' && 
 selectedSubcategoryCode && 
 selectedSubcategoryCode !== 'HPM' && 
 selectedSubcategoryCode !== 'BAS' && (
  <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
    <AlertTitle>Subcategory Compatibility Note</AlertTitle>
    While you've selected <strong>{selectedSubcategoryCode}</strong>, the system will internally use <strong>BAS</strong> for storage.
    Your selection will be preserved in the display. This is a temporary limitation that will be addressed in a future update.
  </Alert>
)}
```

## Testing

To verify this fix:

1. Create an asset with Layer=S, Category=POP, Subcategory=LGF (or any non-HPM subcategory)
2. Observe the alert explaining the backend behavior
3. After submission, verify the success screen shows S.POP.LGF.xxx (with the original LGF subcategory)
4. Note the InfoIcon indicating the display has been adjusted
5. The backend still stores it as S.POP.BAS.xxx, but users see their original selection

## Limitations

1. This is a display-only fix; the backend still stores assets with normalized subcategories
2. Search and filtering operations will still use the backend's BAS subcategory
3. The long-term solution requires the backend fix described in BACKEND_FIX_PLAN.md

## Next Steps

1. Monitor user feedback on this workaround
2. Implement the backend fix as described in BACKEND_FIX_PLAN.md
3. Once backend is fixed, remove this workaround code
# Feature Toggle System for UI Versions

This document explains the feature toggle system implemented to support side-by-side testing of the old and new UI implementations for the taxonomy selection components.

## Overview

The feature toggle system allows users to switch between the original and new implementations of the asset registration page. This enables easy comparison and testing of both versions during the development and validation phases.

## Implementation Details

### 1. Feature Toggle Utility (`src/utils/featureToggle.ts`)

The core utility provides functions for:

- Getting the current UI version preference
- Toggling between UI versions
- Persisting preferences in localStorage
- Reading preferences from URL parameters
- Creating URLs with version parameters

```typescript
export type UIVersion = 'old' | 'new';

// Get the current UI version preference
// Priority: URL > localStorage > Default
export const getUIVersion = (): UIVersion => {
  // URL parameter has highest priority
  const urlVersion = getUIVersionFromURL();
  if (urlVersion) {
    // Save to localStorage for persistence
    saveUIVersionPreference(urlVersion);
    return urlVersion;
  }

  // localStorage has second priority
  const storedVersion = getUIVersionFromStorage();
  if (storedVersion) {
    return storedVersion;
  }

  // Default version has lowest priority
  return DEFAULT_VERSION; // 'new'
};
```

### 2. UI Version Toggle Component (`src/components/common/UIVersionToggle.tsx`)

A floating toggle component that allows users to switch between UI versions at any time:

- Displays in the bottom-right corner of the screen
- Shows which version is currently active
- Persists the selection in localStorage
- Updates the URL parameter without page refresh
- Updates the UI immediately upon toggling

### 3. Register Asset Page Wrapper (`src/components/asset/RegisterAssetPageWrapper.tsx`)

A wrapper component that conditionally renders either:

- The original `RegisterAssetPage` for the 'old' version
- The new `RegisterAssetPageNew` for the 'new' version

Based on the user's preference as determined by the feature toggle utility.

### 4. Integration with App Routing

The wrapper is integrated with the main application routing in `App.tsx`:

```tsx
<Route
  path="/register-asset"
  element={
    <ProtectedRoute>
      <RegisterAssetPageWrapper />
    </ProtectedRoute>
  }
/>
```

The URL route remains the same (`/register-asset`), but the displayed implementation changes based on the UI version preference.

## User Experience

### Default Behavior

- New users will see the new UI implementation by default
- A toggle is visible in the corner of the screen showing "Classic UI" and "New UI" options
- The current selection is highlighted and a "Beta" badge appears next to the new UI option

### Version Selection

Users can change versions in several ways:

1. **Toggle Switch**: Click the toggle switch to change versions
2. **URL Parameter**: Add `?uiVersion=new` or `?uiVersion=old` to the URL
3. **Buttons on Test Page**: Use the "Force New UI Version" or "Force Old UI Version" buttons on the test page

### Persistence

- Once selected, the preference is stored in localStorage and persists across sessions
- URL parameters always take precedence over stored preferences
- The preference applies across all pages where both versions are available

## Testing Guide

When testing the toggle functionality:

1. Start at `/taxonomy-selector-test` page
2. Try the buttons to force new/old UI versions
3. Navigate to `/register-asset` to see the corresponding implementation
4. Use the toggle switch to change versions without refreshing
5. Refresh the page to verify the preference persists
6. Try adding URL parameters manually to override localStorage

## Considerations for Full Rollout

Once testing is complete and the new implementation is deemed stable:

1. Remove the wrapper component and feature toggle
2. Update App.tsx to use RegisterAssetPageNew directly
3. Remove the old implementation entirely
4. Clean up feature toggle code and related components

## Technical Notes

- The feature toggle is implemented as a fully client-side solution
- It does not require any server-side configuration
- The implementation ensures no flicker or page reload when toggling
- Event listeners properly clean up to prevent memory leaks
- The system handles URL parameter changes and browser navigation events
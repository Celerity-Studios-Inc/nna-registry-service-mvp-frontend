# Persistent Taxonomy Selection Implementation

This document describes the implementation of persisting taxonomy selections in the NNA Registry Service to prevent data loss during navigation or page refreshes.

## Overview

The SelectionStorage utility works with the existing RegisterAssetPage component to provide a seamless experience where the user's taxonomy selections (layer, category, subcategory) are preserved even if they navigate away from the registration page or refresh the browser.

## Components

### 1. SelectionStorage Utility

The `SelectionStorage` utility (in `src/utils/selectionStorage.ts`) provides methods for:

- Saving taxonomy selections to sessionStorage
- Retrieving saved selections
- Updating existing selections
- Clearing selections
- Managing stale data

### 2. EventCoordinator Integration

The EventCoordinator is used to ensure reliable sequencing of operations when restoring taxonomy selections. This helps address potential timing issues with asynchronous state updates.

### 3. Navigation Warnings

When a user has made changes to the form and attempts to navigate away, a warning dialog is shown using the React Router's `useBeforeUnload` hook.

## Key Features

1. **Automatic Saving**: Selections are automatically saved when:
   - The user selects a layer
   - The user selects a category
   - The user selects a subcategory
   - The user navigates between steps
   - The user attempts to leave the page with unsaved changes

2. **Automatic Restoration**: When the user returns to the registration page:
   - Previously selected taxonomy values are automatically restored
   - The form is pre-populated with saved values
   - The UI reflects the restored state

3. **Stale Data Management**: Selections older than 30 minutes (configurable) are considered stale and discarded.

4. **Multi-Form Support**: The system supports multiple independent forms by using form IDs (e.g., 'asset-registration').

5. **Cleanup After Submission**: Saved selections are automatically cleared after successful asset registration.

## Implementation Details

### Integration with RegisterAssetPage

The implementation adds the following capabilities to RegisterAssetPage:

1. **Initial State Check**:
   - On component mount, check for previously saved selections
   - Use stored values as initial form values if available

2. **State Persistence**:
   - Save state to sessionStorage when taxonomy selections change
   - Update stored state during navigation between steps

3. **State Restoration**:
   - Use EventCoordinator to sequence restoration operations
   - Ensure taxonomy context and form state are synchronized
   - Restore layer first, then category, then subcategory

4. **Navigation Warning**:
   - Track form changes to detect unsaved changes
   - Show browser warning dialog when navigating away with unsaved changes
   - Save current state before potential navigation

### Data Format

Taxonomy selections are stored in sessionStorage using the following structure:

```json
{
  "layer": "S",
  "categoryCode": "POP",
  "subcategoryCode": "HPM",
  "timestamp": 1631234567890
}
```

The timestamp is used to detect and discard stale data.

## Testing

Comprehensive tests have been added to verify the integration between SelectionStorage and EventCoordinator:

- State saving and retrieval
- Sequential event processing
- Update operations
- Stale data management
- Form reset functionality

## Future Improvements

1. **Cross-Tab Synchronization**: Consider using the Storage event to synchronize state across multiple tabs.

2. **LocalStorage Option**: For longer persistence, consider adding an option to use localStorage instead of sessionStorage.

3. **Backend Persistence**: For mission-critical forms, consider saving to backend (would require user authentication).

4. **Compression**: For larger forms, implement compression for the stored data.

5. **Extended Form Data**: Expand beyond taxonomy selections to include file selections and other form data.
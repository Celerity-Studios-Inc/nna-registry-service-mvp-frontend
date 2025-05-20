# Persistent Taxonomy Selection Implementation

This document describes the implementation of persisting taxonomy selections in the NNA Registry Service to prevent data loss during navigation or page refreshes.

## Overview

The SelectionStorage utility works with the existing RegisterAssetPage component to provide a seamless experience where the user's taxonomy selections (layer, category, subcategory) are preserved even if they navigate away from the registration page or refresh the browser.

## Components

### 1. Enhanced SelectionStorage Utility

The `SelectionStorage` utility (in `src/utils/selectionStorage.ts`) provides methods for:

- Saving taxonomy selections with automatic fallback between storage types
- Retrieving saved selections with stale data detection
- Updating existing selections with merge capabilities
- Clearing selections (individual or all)
- Managing stale data with customizable expiration times
- Cross-tab synchronization via the Storage event API
- Robust error handling with quota management
- Event system for operation feedback

### 2. Storage Class

The `Storage` class provides a robust wrapper around browser storage:

- Storage availability detection
- Automatic fallback between sessionStorage and localStorage
- Quota exceeded error handling with recovery
- Cross-tab event propagation
- Comprehensive error handling

### 3. EventCoordinator Integration

The EventCoordinator is used to ensure reliable sequencing of operations when restoring taxonomy selections. This helps address potential timing issues with asynchronous state updates.

### 4. StorageOperationFeedback Component

The `StorageOperationFeedback` component (in `src/components/feedback/StorageOperationFeedback.tsx`) provides user feedback for storage operations:

- Visual notifications for save, retrieve, update, and clear operations
- Appropriate severity levels for different operations
- Customizable display duration
- Optional enable/disable toggle

### 5. Navigation Warnings

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

## New Features Added in Version 2.0

### 1. Cross-Tab Synchronization

- Automatically synchronizes selections across multiple browser tabs
- Uses the Storage API's `storage` event to detect changes from other tabs
- Provides registration mechanism for components to listen for changes
- Applies changes in a controlled sequence using EventCoordinator
- Only updates if safe (e.g., not during active editing)

### 2. Storage Fallback Mechanism

- Primary storage (sessionStorage) with automatic fallback to localStorage
- Detects storage availability before operations
- Handles browser storage limitations gracefully
- Implements quota exceeded error handling
- Automatically cleans up old selections to free space when needed

### 3. Visual Feedback for Storage Operations

- User-visible notifications for storage events
- Feedback is provided for save, retrieve, update, and clear operations
- Color-coded by operation type (success, info, warning)
- Can be toggled on/off by the user
- Automatically fades after a configurable duration

### 4. Comprehensive Error Recovery

- Robust error handling for all storage operations
- Graceful degradation when storage is unavailable
- Automatic retry with fallback storage type
- Detailed logging for troubleshooting
- Events system to notify components of errors

### 5. Enhanced Testing

- Comprehensive unit tests for core functionality
- Mock implementations for both sessionStorage and localStorage
- Tests for cross-tab synchronization
- Error condition testing
- Quota exceeded handling tests

## Future Improvements

1. **Compression**: For larger forms, implement compression for the stored data using libraries like LZString.

2. **Full Form Persistence**: Expand beyond taxonomy selections to include file selections and other form data.

3. **Backend Persistence**: For mission-critical forms, consider saving to backend (requires authentication).

4. **Automatic Submission Recovery**: Implement ability to recover and retry submissions that fail due to network issues.

5. **Progressive Enhancement**: Add support for offline operation using IndexedDB and Service Workers.
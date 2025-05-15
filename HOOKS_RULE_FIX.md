# React Hooks Rule Fix for AssetCard Component

This document describes the fix for the React hooks rule violation in the AssetCard component.

## Issue

The build was failing with the following error:

```
[eslint] 
src/components/asset/AssetCard.tsx
  Line 42:34:  React Hook "useNavigate" is called conditionally. React Hooks must be called in the exact same order in every component render  react-hooks/rules-of-hooks
```

The issue was that the `useNavigate` hook was being used, but then its value was being checked conditionally in different parts of the component:

```typescript
// This violates the Rules of Hooks - can't use hooks conditionally
if ((asset.id || asset._id) && navigate) {
  navigate(`/assets/${asset.id || asset._id}`);
}

// Another violation - checking if navigate exists
if (navigate) {
  navigate(`/assets/${assetId}`);
} else {
  window.location.href = `/assets/${assetId}`;
}
```

## Fix

The fix involves:

1. Using the `useNavigate` hook unconditionally at the top of the component:
   ```typescript
   // Always use the hook unconditionally, as required by React rules of hooks
   const navigate = useNavigate();
   ```

2. Removing conditional checks for navigate's existence and instead only checking for a valid asset ID:
   ```typescript
   const assetId = asset.id || asset._id;
   if (assetId) {
     navigate(`/assets/${assetId}`);
   } else {
     console.warn('Navigation not possible - no asset ID available');
   }
   ```

3. Removing the fallback to `window.location.href` since we can always use the navigate function:
   ```typescript
   // Always use the navigate hook since we're using it unconditionally
   navigate(`/assets/${assetId}`);
   ```

## Why This Fix Works

React's [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html) require that:

1. Hooks must be called at the top level of your React function, not inside loops, conditions, or nested functions
2. Hooks must only be called from React function components or custom hooks

The fix ensures that the `useNavigate` hook is always called at the top level of the component, regardless of any conditions, maintaining the integrity of React's component lifecycle and hook system.

## Testing

After applying this fix, the build should successfully complete without hook-related errors. The functionality of the AssetCard component remains the same, allowing users to navigate to asset details pages.
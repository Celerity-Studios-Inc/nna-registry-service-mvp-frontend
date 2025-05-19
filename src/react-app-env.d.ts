/// <reference types="react-scripts" />

// CRITICAL FIX: Add global type declarations for event handler tracking and throttling
interface Window {
  __layerChangeHandlers?: Record<string, EventListener>;
  __layerSelectionLock?: boolean;
}
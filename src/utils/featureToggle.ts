/**
 * Feature Toggle utility for managing UI version preferences
 * Supports both URL parameters and localStorage for persistence
 */

export type UIVersion = 'old' | 'new';

const STORAGE_KEY = 'preferredUIVersion';
const DEFAULT_VERSION: UIVersion = 'new'; // Default to new UI

/**
 * Parse URL parameters to check for UI version preference
 */
export const getUIVersionFromURL = (): UIVersion | null => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const versionParam = urlParams.get('uiVersion');
    
    if (versionParam === 'old' || versionParam === 'new') {
      return versionParam;
    }
    return null;
  } catch (error) {
    console.error('Error parsing URL parameters:', error);
    return null;
  }
};

/**
 * Get UI version preference from localStorage
 */
export const getUIVersionFromStorage = (): UIVersion | null => {
  try {
    const storedVersion = localStorage.getItem(STORAGE_KEY);
    if (storedVersion === 'old' || storedVersion === 'new') {
      return storedVersion;
    }
    return null;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

/**
 * Save UI version preference to localStorage
 */
export const saveUIVersionPreference = (version: UIVersion): void => {
  try {
    localStorage.setItem(STORAGE_KEY, version);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Get the current UI version preference
 * Priority: URL > localStorage > Default
 */
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
  return DEFAULT_VERSION;
};

/**
 * Toggle between UI versions
 */
export const toggleUIVersion = (): UIVersion => {
  const currentVersion = getUIVersion();
  const newVersion = currentVersion === 'new' ? 'old' : 'new';
  
  saveUIVersionPreference(newVersion);
  return newVersion;
};

/**
 * Create URL with UI version parameter
 */
export const createURLWithUIVersion = (version: UIVersion): string => {
  const url = new URL(window.location.href);
  url.searchParams.set('uiVersion', version);
  return url.toString();
};

/**
 * Check if the new UI is enabled
 */
export const isNewUIEnabled = (): boolean => {
  return getUIVersion() === 'new';
};
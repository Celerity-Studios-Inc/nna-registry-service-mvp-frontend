/**
 * Feature Toggle System
 * 
 * A simple feature toggle mechanism for enabling/disabling features across the application.
 * Supports multiple toggle sources:
 * 1. URL parameters (highest priority)
 * 2. localStorage (persisted user preferences)
 * 3. Default values (fallback)
 */

export const FEATURE_TOGGLES = {
  TAXONOMY_V3: 'taxonomy_v3',
};

/**
 * Check if a feature is enabled
 * 
 * @param feature The feature key to check
 * @returns boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(feature: string): boolean {
  // Check URL parameters first (highest priority)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has(feature)) {
    return urlParams.get(feature) === 'true';
  }
  
  // Check for special URL parameters for specific features
  if (feature === FEATURE_TOGGLES.TAXONOMY_V3) {
    if (urlParams.has('taxonomyVersion')) {
      return urlParams.get('taxonomyVersion') === 'v3';
    }
  }
  
  // Then check localStorage (user preference)
  try {
    const storedValue = localStorage.getItem(`feature_${feature}`);
    if (storedValue) {
      return storedValue === 'true';
    }
  } catch (e) {
    console.warn('Error reading from localStorage:', e);
    // Continue to default values if localStorage fails
  }
  
  // Default values (lowest priority)
  const defaults: Record<string, boolean> = {
    [FEATURE_TOGGLES.TAXONOMY_V3]: false, // Default to V2 taxonomy for stability
  };
  
  return defaults[feature] || false;
}

/**
 * Enable or disable a feature
 * 
 * @param feature The feature key to modify
 * @param enabled Whether to enable or disable the feature
 */
export function setFeatureEnabled(feature: string, enabled: boolean): void {
  try {
    localStorage.setItem(`feature_${feature}`, enabled ? 'true' : 'false');
  } catch (e) {
    console.warn('Error writing to localStorage:', e);
  }
}
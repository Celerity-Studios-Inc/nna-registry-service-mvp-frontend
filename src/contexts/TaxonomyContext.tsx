import React, { createContext, useContext } from 'react';
import { useTaxonomy } from '../hooks/useTaxonomy';
import { logger, LogLevel } from '../utils/logger';

// Define the type for taxonomy options
interface TaxonomyOptions {
  autoLoad?: boolean;
  showFeedback?: boolean;
}

// Define the type for provider props
interface TaxonomyProviderProps {
  children: React.ReactNode;
  options?: TaxonomyOptions;
}

// Create a context with useTaxonomy return type
// The context will initially be null, but will be populated by the provider
// Helper function to log taxonomy state (for debugging)
export const logTaxonomyState = (
  source: string, 
  context: ReturnType<typeof useTaxonomy>,
  level: LogLevel = LogLevel.DEBUG
) => {
  logger.taxonomy(
    level,
    `[${source}] Taxonomy State: ` +
    `layer=${context.selectedLayer || 'none'}, ` +
    `category=${context.selectedCategory || 'none'}, ` +
    `subcategory=${context.selectedSubcategory || 'none'}, ` +
    `hfn=${context.hfn || 'none'}, ` +
    `mfa=${context.mfa || 'none'}`
  );
};

export const TaxonomyContext = createContext<ReturnType<typeof useTaxonomy> | null>(null);

/**
 * TaxonomyProvider - Provides a single shared instance of useTaxonomy hook
 * to all children in the component tree.
 * 
 * This prevents multiple instances of useTaxonomy which cause infinite loops
 * due to circular state updates between parent and child components.
 */
export const TaxonomyProvider: React.FC<TaxonomyProviderProps> = ({ 
  children, 
  options = { autoLoad: true, showFeedback: true } 
}) => {
  // Create a single instance of the useTaxonomy hook
  const taxonomyHook = useTaxonomy(options);
  
  // Log initial state and when it changes
  React.useEffect(() => {
    logTaxonomyState('TaxonomyProvider', taxonomyHook, LogLevel.INFO);
  }, [
    taxonomyHook.selectedLayer, 
    taxonomyHook.selectedCategory, 
    taxonomyHook.selectedSubcategory,
    taxonomyHook.hfn,
    taxonomyHook.mfa
  ]);

  return (
    <TaxonomyContext.Provider value={taxonomyHook}>
      {children}
    </TaxonomyContext.Provider>
  );
};

/**
 * Custom hook to use the taxonomy context
 * 
 * This provides a convenient way to access the shared taxonomy state
 * and ensures we're using the same instance across components.
 * 
 * @param options Additional options for the hook
 * @param options.componentName Optional component name for debugging logs
 * @param options.enableLogging Whether to enable automatic logging of state changes
 */
export const useTaxonomyContext = (options?: { 
  componentName?: string;
  enableLogging?: boolean;
}) => {
  const context = useContext(TaxonomyContext);
  const { componentName = 'UnnamedComponent', enableLogging = false } = options || {};
  
  if (context === null) {
    throw new Error(
      'useTaxonomyContext must be used within a TaxonomyProvider. ' +
      'Wrap your component tree with <TaxonomyProvider> to fix this issue.'
    );
  }
  
  // Set up logging of state changes if enabled
  React.useEffect(() => {
    if (enableLogging) {
      logTaxonomyState(componentName, context, LogLevel.DEBUG);
    }
  }, [
    componentName,
    enableLogging,
    context.selectedLayer,
    context.selectedCategory,
    context.selectedSubcategory,
    context.hfn,
    context.mfa
  ]);
  
  return context;
};
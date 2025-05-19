import React, { useState, useEffect, useCallback } from 'react';
import RegisterAssetPage from '../pages/RegisterAssetPage';
import { taxonomyService } from '../services/simpleTaxonomyService';
import { useFeedback } from '../contexts/FeedbackContext';
import ErrorBoundary from './ErrorBoundary';
import { useTaxonomy } from '../hooks/useTaxonomy';
import { TaxonomyProvider } from '../contexts/TaxonomyContext';
import { logger, LogLevel } from '../utils/logger';
import TaxonomyErrorRecovery from './TaxonomyErrorRecovery';
import { performFullRecovery } from '../utils/taxonomyErrorRecovery';

/**
 * This wrapper component ensures that the correct taxonomy service is used
 * throughout the asset registration process.
 *
 * Enhanced with robust error handling and verification of taxonomy data
 * using the useTaxonomy hook.
 */
const AssetRegistrationWrapper: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{
    message: string;
    technical?: string;
  }>({ message: '' });
  const { addFeedback } = useFeedback();

  // We now provide taxonomy through context, so we don't need a direct hook instance here

  // Test critical special case mappings to verify the taxonomy service
  const verifySpecialCaseMappings = useCallback(async () => {
    const criticalMappings = [
      {
        hfn: 'W.BCH.SUN.001',
        expectedMfa: '5.004.003.001',
        description: 'Beach World',
      },
      {
        hfn: 'S.POP.HPM.001',
        expectedMfa: '2.001.007.001',
        description: 'Pop Hipster Male Star',
      },
    ];

    const results = await Promise.all(
      criticalMappings.map(async mapping => {
        try {
          const actualMfa = taxonomyService.convertHFNtoMFA(mapping.hfn);
          const passed = actualMfa === mapping.expectedMfa;

          logger.taxonomy(
            passed ? LogLevel.INFO : LogLevel.ERROR,
            `Mapping test ${passed ? 'PASSED' : 'FAILED'}: ${
              mapping.hfn
            } -> ${actualMfa} ${
              passed ? '✓' : '✗ (expected ' + mapping.expectedMfa + ')'
            }`
          );

          return { ...mapping, actualMfa, passed };
        } catch (error) {
          logger.taxonomy(
            LogLevel.ERROR,
            `Exception testing mapping ${mapping.hfn}`,
            error
          );
          return { ...mapping, actualMfa: null, passed: false, error };
        }
      })
    );

    // Check if all tests passed
    const allPassed = results.every(r => r.passed);
    const failedTests = results.filter(r => !r.passed);

    return { allPassed, results, failedTests };
  }, []);

  // Verify layer categories exist
  const verifyLayerCategories = useCallback(async () => {
    const criticalLayers = [
      { code: 'W', name: 'World' },
      { code: 'S', name: 'Star' },
    ];

    const results = await Promise.all(
      criticalLayers.map(async layer => {
        try {
          const categories = taxonomyService.getCategories(layer.code);
          const hasCategories = categories.length > 0;

          logger.taxonomy(
            hasCategories ? LogLevel.INFO : LogLevel.ERROR,
            `${layer.name} layer has ${categories.length} categories ${
              hasCategories ? '✓' : '✗'
            }`
          );

          return { ...layer, categories, hasCategories };
        } catch (error) {
          logger.taxonomy(
            LogLevel.ERROR,
            `Exception loading categories for ${layer.name} layer`,
            error
          );
          return { ...layer, categories: [], hasCategories: false, error };
        }
      })
    );

    // Check if all layers have categories
    const allHaveCategories = results.every(r => r.hasCategories);
    const missingCategoryLayers = results.filter(r => !r.hasCategories);

    return { allHaveCategories, results, missingCategoryLayers };
  }, []);

  // Run all verification checks
  const runVerification = useCallback(async () => {
    // Don't set loading state in tests to avoid infinite render loops
    if (process.env.NODE_ENV !== 'test') {
      setIsLoaded(false);
    }
    setHasError(false);
    setErrorDetails({ message: '' });

    try {
      logger.taxonomy(LogLevel.INFO, 'Starting taxonomy service verification');
      addFeedback('info', 'Verifying taxonomy service...', 2000);

      // Step 1: Verify layer categories
      const layerCheck = await verifyLayerCategories();
      if (!layerCheck.allHaveCategories) {
        const missingLayers = layerCheck.missingCategoryLayers
          .map(l => l.name)
          .join(', ');
        addFeedback(
          'warning',
          `Missing categories for: ${missingLayers}`,
          5000
        );
      }

      // Step 2: Verify special case mappings
      const mappingCheck = await verifySpecialCaseMappings();
      if (!mappingCheck.allPassed) {
        const failedMappings = mappingCheck.failedTests
          .map(t => t.description)
          .join(', ');
        addFeedback(
          'warning',
          `Problematic special case mappings: ${failedMappings}`,
          5000
        );
      }

      // Final assessment
      if (layerCheck.allHaveCategories && mappingCheck.allPassed) {
        logger.taxonomy(
          LogLevel.INFO,
          'Taxonomy service verification completed successfully'
        );
        addFeedback('success', 'Taxonomy service loaded successfully', 3000);
        setIsLoaded(true);
      } else {
        // There are issues but we can still proceed with warnings
        logger.taxonomy(
          LogLevel.WARN,
          'Taxonomy service verification completed with warnings'
        );
        addFeedback(
          'warning',
          'Taxonomy service loaded with potential issues',
          5000
        );
        setIsLoaded(true);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.taxonomy(
        LogLevel.ERROR,
        'Taxonomy service verification failed',
        error
      );

      // Set error state but still allow loading with a warning
      setHasError(true);
      setErrorDetails({
        message: 'Error verifying taxonomy service',
        technical: errorMessage,
      });

      addFeedback(
        'error',
        'Error loading taxonomy data. Some features may not work correctly.',
        5000
      );
      setIsLoaded(true);
    }
  }, [addFeedback, verifyLayerCategories, verifySpecialCaseMappings]);

  // Create the ref outside the effect to fix ESLint rule violation
  const hasRunRef = React.useRef(false);

  useEffect(() => {
    // To prevent infinite loops, especially in tests, use a ref to track if we've already verified
    if (!hasRunRef.current) {
      hasRunRef.current = true;
      runVerification();
    }
  }, [runVerification]);

  // Handler for retry button - enhanced with full recovery
  const handleRetry = useCallback(async () => {
    console.log('[AssetRegistrationWrapper] Starting full recovery process...');
    
    // First perform a full recovery of taxonomy data
    const recoverySuccess = await performFullRecovery();
    console.log(`[AssetRegistrationWrapper] Recovery ${recoverySuccess ? 'succeeded' : 'failed'}`);
    
    // Then run the regular verification
    runVerification();
  }, [runVerification]);

  if (!isLoaded) {
    return (
      <div
        className="loading-container"
        style={{ padding: '40px', textAlign: 'center' }}
      >
        <div
          className="loading-spinner"
          style={{
            margin: '0 auto',
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        ></div>
        <p>Loading taxonomy data...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // If we've loaded but with errors, show an error state with retry option
  if (hasError) {
    return (
      <div
        className="error-container"
        style={{ padding: '40px', textAlign: 'center', color: '#d32f2f' }}
      >
        <h2>{errorDetails.message || 'Error Loading Taxonomy Data'}</h2>
        <p>
          There was a problem loading the taxonomy service required for asset
          registration.
        </p>
        {errorDetails.technical && (
          <details style={{ margin: '20px 0', textAlign: 'left' }}>
            <summary>Technical Details</summary>
            <pre
              style={{
                backgroundColor: '#f5f5f5',
                padding: '10px',
                borderRadius: '4px',
                overflow: 'auto',
              }}
            >
              {errorDetails.technical}
            </pre>
          </details>
        )}
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={handleRetry}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            Retry Loading
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={({error}) => (
        <div className="error-boundary" style={{ padding: '40px' }}>
          <TaxonomyErrorRecovery
            error="There was a problem with the asset registration form. This might be due to issues with the taxonomy service or data validation."
            onRetry={handleRetry}
          />
          
          {/* Show technical details for debugging in development */}
          {process.env.NODE_ENV === 'development' && error && (
            <details style={{ margin: '20px 0', textAlign: 'left' }}>
              <summary>Technical Details</summary>
              <pre
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '10px',
                  borderRadius: '4px',
                  overflow: 'auto',
                }}
              >
                {error.toString()}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </details>
          )}
        </div>
      )}
    >
      {/* Provide taxonomy context to RegisterAssetPage */}
      <TaxonomyProvider options={{ autoLoad: false, showFeedback: true }}>
        <RegisterAssetPage />
      </TaxonomyProvider>
    </ErrorBoundary>
  );
};

export default AssetRegistrationWrapper;

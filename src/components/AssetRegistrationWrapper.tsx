import React, { useState, useEffect } from 'react';
import RegisterAssetPage from '../pages/RegisterAssetPage';
import { taxonomyService } from '../services/simpleTaxonomyService';
import { useFeedback } from '../contexts/FeedbackContext';
import ErrorBoundary from './ErrorBoundary';

/**
 * This wrapper component ensures that the correct taxonomy service is used
 * throughout the asset registration process.
 */
const AssetRegistrationWrapper: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { addFeedback } = useFeedback();

  useEffect(() => {
    // Verify taxonomy service is working before rendering the main component
    try {
      const wCategories = taxonomyService.getCategories('W');
      const starCategories = taxonomyService.getCategories('S');

      console.log('AssetRegistrationWrapper: Verifying taxonomy service');
      console.log(`Found ${wCategories.length} categories for W layer`);
      console.log(`Found ${starCategories.length} categories for S layer`);

      // Test the W.BCH.SUN special case
      const testHfn = 'W.BCH.SUN.001';
      const testMfa = taxonomyService.convertHFNtoMFA(testHfn);
      console.log(`HFN to MFA test: ${testHfn} -> ${testMfa}`);

      if (testMfa === '5.004.003.001') {
        console.log('W.BCH.SUN test passed');
        addFeedback('success', 'Taxonomy service loaded successfully', 3000);
      } else {
        console.error('W.BCH.SUN test failed');
        addFeedback('warning', 'Taxonomy special case mapping not working correctly', 5000);
      }

      if (wCategories.length === 0 || starCategories.length === 0) {
        addFeedback('warning', 'Some taxonomy data may be missing', 5000);
      }

      setIsLoaded(true);
    } catch (error) {
      console.error('AssetRegistrationWrapper: Error verifying taxonomy service', error);
      addFeedback('error', 'Error loading taxonomy data', 5000);
      // Still set isLoaded to true to allow rendering, but with a warning in console
      setIsLoaded(true);
    }
  }, [addFeedback]);

  if (!isLoaded) {
    return (
      <div className="loading-container" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p>Loading taxonomy data...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={
      <div className="error-boundary">
        <h2>Error in Asset Registration</h2>
        <p>There was a problem loading the asset registration form. This might be due to issues with the taxonomy service.</p>
        <button
          onClick={() => window.location.reload()}
          className="error-retry-button"
        >
          Try Again
        </button>
      </div>
    }>
      <RegisterAssetPage />
    </ErrorBoundary>
  );
};

export default AssetRegistrationWrapper;
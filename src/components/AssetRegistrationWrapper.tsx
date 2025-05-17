import React, { useState, useEffect } from 'react';
import RegisterAssetPage from '../pages/RegisterAssetPage';
import { taxonomyService } from '../services/simpleTaxonomyService';

/**
 * This wrapper component ensures that the correct taxonomy service is used
 * throughout the asset registration process.
 */
const AssetRegistrationWrapper: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

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
      console.log(`Test passed: ${testMfa === '5.004.003.001'}`);
      
      setIsLoaded(true);
    } catch (error) {
      console.error('AssetRegistrationWrapper: Error verifying taxonomy service', error);
      // Still set isLoaded to true to allow rendering, but with a warning in console
      setIsLoaded(true);
    }
  }, []);

  if (!isLoaded) {
    return <div>Loading taxonomy data...</div>;
  }

  return <RegisterAssetPage />;
};

export default AssetRegistrationWrapper;
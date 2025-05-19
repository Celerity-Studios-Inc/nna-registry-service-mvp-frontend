import React from 'react';
import { TaxonomyDataProvider } from '../providers/taxonomy/TaxonomyDataProvider';
import TaxonomyDebugger from '../components/taxonomy/TaxonomyDebugger';

/**
 * Test page for the taxonomy system
 */
const TaxonomyTestPage: React.FC = () => {
  return (
    <div className="taxonomy-test-page">
      <h1>Taxonomy System Test</h1>
      <p>
        This page tests the new TaxonomyDataProvider that loads all taxonomy data
        at application startup. Use the debugger below to explore the taxonomy data.
      </p>
      
      <TaxonomyDataProvider>
        <TaxonomyDebugger />
      </TaxonomyDataProvider>
    </div>
  );
};

export default TaxonomyTestPage;
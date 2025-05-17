/**
 * TaxonomyInitProvider Component
 * 
 * This component wraps the application and ensures the taxonomy service
 * is properly initialized before rendering children components.
 */
import React, { useState, useEffect } from 'react';
import { initializeTaxonomy, isTaxonomyInitialized, getTaxonomyInitError } from '../../services/taxonomyInitializer';

interface TaxonomyInitProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const TaxonomyInitProvider: React.FC<TaxonomyInitProviderProps> = ({ 
  children, 
  fallback = <div className="taxonomy-loading">Loading taxonomy data...</div>
}) => {
  const [isInitialized, setIsInitialized] = useState<boolean>(isTaxonomyInitialized());
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const initializeTaxonomyData = async () => {
    try {
      const success = await initializeTaxonomy();
      setIsInitialized(success);
      
      if (!success) {
        setError(getTaxonomyInitError());
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsInitialized(false);
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (!isInitialized && !isRetrying) {
      setIsRetrying(true);
      initializeTaxonomyData();
    }
  }, [isInitialized, isRetrying]);

  if (error) {
    return (
      <div className="taxonomy-error">
        <h3>Error Loading Taxonomy Data</h3>
        <p>{error.message}</p>
        <button 
          onClick={() => {
            setError(null);
            setIsRetrying(true);
            initializeTaxonomyData();
          }}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isInitialized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default TaxonomyInitProvider;
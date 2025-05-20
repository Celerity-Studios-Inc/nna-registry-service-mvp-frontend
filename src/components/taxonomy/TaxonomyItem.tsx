import React, { useMemo } from 'react';
import { TaxonomyItem as TaxonomyItemType } from '../../providers/taxonomy/types';
import { debugLog, STANDARD_LAYER_NAMES } from '../../utils/logger';

interface TaxonomyItemProps {
  item: TaxonomyItemType;
  isActive: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  dataTestId: string;
}

/**
 * Renders a single taxonomy item (layer, category, or subcategory)
 * This is a pure presentational component with no state
 */
const TaxonomyItem: React.FC<TaxonomyItemProps> = ({
  item,
  isActive,
  onClick,
  onDoubleClick,
  dataTestId
}) => {
  // Ensure we have fallbacks for missing data
  const displayName = useMemo(() => {
    // Always log for debugging what's happening
    console.log(`[TaxonomyItem] Rendering item: code=${item.code}, name=${JSON.stringify(item.name)}, numeric=${item.numericCode}`);
    
    // Special handling for layer codes (single character)
    if (item.code.length === 1 && STANDARD_LAYER_NAMES[item.code]) {
      return STANDARD_LAYER_NAMES[item.code];
    }
    
    // If name is missing or empty, use code as fallback
    if (!item.name || item.name.trim() === '') {
      debugLog(`[TaxonomyItem] Missing name for item code ${item.code}, using code as fallback`);
      
      // Try to find category name patterns
      if (item.code.length === 3) {
        // Map some common category codes to names
        const categoryNameMap: Record<string, string> = {
          'POP': 'Pop',
          'RCK': 'Rock',
          'JZZ': 'Jazz',
          'HIP': 'Hip Hop',
          'BOL': 'Bollywood',
          'DSF': 'Disco Funk',
          'RNB': 'R&B',
          'ALT': 'Alternative',
          'WLD': 'World',
          'KPO': 'K-Pop'
        };
        
        return categoryNameMap[item.code] || item.code;
      }
      
      return item.code;
    }
    return item.name;
  }, [item.name, item.code]);

  // Create a different layout for better visibility
  return (
    <div
      className={`taxonomy-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      data-testid={dataTestId}
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center', 
        padding: '12px 8px',
        height: 'auto', 
        minHeight: '90px'
      }}
    >
      <div className="taxonomy-item-code" style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.code}</div>
      <div className="taxonomy-item-name" style={{ 
        fontWeight: 'bold', 
        color: '#000', 
        fontSize: '15px',
        margin: '8px 0',
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>{displayName}</div>
      <div className="taxonomy-item-numeric" style={{ fontSize: '12px', color: '#666' }}>{item.numericCode}</div>
    </div>
  );
};

// Create custom comparison function for optimized memoization
const arePropsEqual = (prevProps: TaxonomyItemProps, nextProps: TaxonomyItemProps) => {
  // Deep comparison of the item props to prevent unnecessary re-renders
  const itemEqual = 
    prevProps.item.code === nextProps.item.code &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.numericCode === nextProps.item.numericCode;
  
  const propsEqual = 
    itemEqual &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.dataTestId === nextProps.dataTestId;
  
  // Skip comparison of event handlers as they should be wrapped in useCallback in parent
  
  return propsEqual;
};

// Add displayName for debugging in React DevTools
TaxonomyItem.displayName = 'TaxonomyItem';

export default React.memo(TaxonomyItem, arePropsEqual);
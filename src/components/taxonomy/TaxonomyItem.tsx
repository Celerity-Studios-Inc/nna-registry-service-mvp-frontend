import React from 'react';
import { TaxonomyItem as TaxonomyItemType } from '../../providers/taxonomy/types';
import { debugLog } from '../../utils/logger';

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
  return (
    <div
      className={`taxonomy-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      data-testid={dataTestId}
    >
      <div className="taxonomy-item-code">{item.code}</div>
      <div className="taxonomy-item-numeric">{item.numericCode}</div>
      <div className="taxonomy-item-name">{item.name}</div>
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
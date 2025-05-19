import React from 'react';
import { TaxonomyItem as TaxonomyItemType } from '../../providers/taxonomy/types';

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

export default React.memo(TaxonomyItem);
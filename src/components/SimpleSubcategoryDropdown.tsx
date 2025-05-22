import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface SimpleSubcategoryDropdownProps {
  layer: string;
  categoryCode: string;
  value: string;
  onChange: (value: string) => void;
}

const SimpleSubcategoryDropdown: React.FC<SimpleSubcategoryDropdownProps> = ({ 
  layer, 
  categoryCode, 
  value, 
  onChange 
}) => {
  const getSubcategories = () => {
    if (layer === 'S' && categoryCode === 'DNC') {
      return ['DNC.BAS', 'DNC.PRD', 'DNC.HSE', 'DNC.TEC', 'DNC.TRN'];
    }
    if (layer === 'L' && categoryCode === 'PRF') {
      return ['PRF.BAS', 'PRF.LEO', 'PRF.SEQ', 'PRF.LED', 'PRF.ATH'];
    }
    if (layer === 'L' && categoryCode === 'URB') {
      return ['URB.BAS', 'URB.HIP', 'URB.GRF', 'URB.TEC', 'URB.SKT'];
    }
    return [];
  };

  const subcategories = getSubcategories();
  
  return (
    <FormControl fullWidth disabled={!layer || !categoryCode || subcategories.length === 0}>
      <InputLabel>Subcategory</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => onChange(e.target.value as string)}
        label="Subcategory"
      >
        <MenuItem value="">
          <em>Select Subcategory</em>
        </MenuItem>
        {subcategories.map((sub) => (
          <MenuItem key={sub} value={sub}>
            {sub}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SimpleSubcategoryDropdown;
import React, { useState } from 'react';

interface AssetSearchProps {
  onSearch: (searchValue: string) => void;
}

const AssetSearch: React.FC<AssetSearchProps> = ({ onSearch }) => {
  const [value, setValue] = useState('');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    onSearch(newValue);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search assets..."
        value={value}
        onChange={handleSearch}
        style={{ padding: '8px', width: '100%' }}
      />
    </div>
  );
};

export default AssetSearch;

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssetSearch from './AssetSearch';

describe('AssetSearch', () => {
  it('renders the search input', () => {
    const mockOnSearch = jest.fn();
    render(<AssetSearch onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search assets...');
    expect(input).toBeInTheDocument();
  });

  it('calls onSearch when input changes', () => {
    const mockOnSearch = jest.fn();
    render(<AssetSearch onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search assets...');
    fireEvent.change(input, { target: { value: 'test search' } });

    expect(mockOnSearch).toHaveBeenCalledWith('test search');
  });

  it('updates input value when typing', () => {
    const mockOnSearch = jest.fn();
    render(<AssetSearch onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search assets...');
    fireEvent.change(input, { target: { value: 'test search' } });

    expect(input).toHaveValue('test search');
  });
});

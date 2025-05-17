import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LayerSelectorV2 from '../LayerSelectorV2';

// Mock the useTaxonomy hook
jest.mock('../../../hooks/useTaxonomy', () => ({
  useTaxonomy: () => ({
    layers: ['G', 'S', 'W'],
    selectedLayer: null,
    selectLayer: jest.fn()
  })
}));

// Mock the logger
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('LayerSelectorV2', () => {
  const onLayerSelect = jest.fn();
  const onLayerDoubleClick = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders all layer cards', () => {
    render(<LayerSelectorV2 onLayerSelect={onLayerSelect} />);
    
    expect(screen.getByTestId('layer-card-G')).toBeInTheDocument();
    expect(screen.getByTestId('layer-card-S')).toBeInTheDocument();
    expect(screen.getByTestId('layer-card-W')).toBeInTheDocument();
  });
  
  it('calls onLayerSelect when a layer is clicked', () => {
    render(<LayerSelectorV2 onLayerSelect={onLayerSelect} selectedLayer="" />);

    fireEvent.click(screen.getByTestId('layer-card-S'));

    expect(onLayerSelect).toHaveBeenCalledWith('S', false);
  });

  it('calls onLayerDoubleClick when a layer is double-clicked', () => {
    render(<LayerSelectorV2
      onLayerSelect={onLayerSelect}
      onLayerDoubleClick={onLayerDoubleClick}
      selectedLayer=""
    />);

    fireEvent.doubleClick(screen.getByTestId('layer-card-S'));

    expect(onLayerSelect).toHaveBeenCalledWith('S', true);
    expect(onLayerDoubleClick).toHaveBeenCalledWith('S');
  });
  
  it('shows the selected layer information when a layer is selected', () => {
    render(<LayerSelectorV2 onLayerSelect={onLayerSelect} selectedLayer="" />);

    fireEvent.click(screen.getByTestId('layer-card-S'));

    expect(screen.getByText(/Selected Layer:/)).toBeInTheDocument();
    expect(screen.getByText(/Star/)).toBeInTheDocument();
  });

  it('applies the active class to the selected layer card', () => {
    render(<LayerSelectorV2 onLayerSelect={onLayerSelect} selectedLayer="S" />);

    const starCard = screen.getByTestId('layer-card-S');
    expect(starCard).toHaveClass('selected');

    const groundCard = screen.getByTestId('layer-card-G');
    expect(groundCard).not.toHaveClass('selected');
  });
});
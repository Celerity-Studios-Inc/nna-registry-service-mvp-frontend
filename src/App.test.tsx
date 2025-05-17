import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders taxonomy loading text', () => {
  render(<App />);
  const loadingElement = screen.getByText(/Loading taxonomy data/i);
  expect(loadingElement).toBeInTheDocument();
});

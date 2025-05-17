import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { checkEnv } from './api/envCheck';

// Pre-load taxonomy data
import './taxonomyLookup';
console.log('Taxonomy data pre-loaded in index.tsx');

// Log environment variables on startup
console.log('Application starting with environment:', checkEnv());

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

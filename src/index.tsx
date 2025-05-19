import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/providers.css';
import App from './App';
import { checkEnv } from './api/envCheck';
import { logger } from './utils/logger';

// Pre-load taxonomy data - note that the actual initialization will be handled by TaxonomyInitProvider
import './taxonomyLookup';
logger.info('Application startup: Taxonomy lookups imported in index.tsx');

// Log environment variables on startup
logger.info('Application starting with environment:', checkEnv());

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

# Project Organization

This document describes the organization of the NNA Registry Service MVP Frontend project.

## Directory Structure

The project follows a structured organization to improve maintainability and code navigation:

```
nna-registry-service-mvp-frontend/
├── docs/                   # Documentation
│   ├── archive/            # Archived documentation files
│   ├── review/             # Documentation for code review
│   └── taxonomy/           # Taxonomy-specific documentation
├── public/                 # Public assets and static files
├── scripts/                # Utility scripts
│   ├── backend/            # Backend-related scripts
│   ├── deployment/         # Deployment scripts
│   └── testing/            # Testing scripts
├── src/                    # Source code
│   ├── api/                # API integration
│   ├── assets/             # Static assets (images, taxonomy data)
│   ├── components/         # React components
│   ├── contexts/           # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── providers/          # Provider components
│   ├── services/           # Business logic services
│   ├── styles/             # CSS and styling
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── temp/                   # Temporary resources and backups
│   ├── clones/             # Repository clones
│   └── backups/            # Backup files
└── test-assets/            # Assets for testing
```

## Key Files

- `README.md` - Main project documentation
- `CLAUDE.md` - Instructions for Claude.ai/code
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `src/App.tsx` - Application entry point
- `src/index.tsx` - React entry point

## Documentation Organization

The documentation is organized into subdirectories:

1. `/docs/review/` - Contains current documentation for code review
2. `/docs/archive/` - Contains historical documentation
3. `/docs/taxonomy/` - Contains taxonomy-specific documentation

A comprehensive documentation index is provided in each directory's README.md file.

## Script Organization

Scripts are organized by their function:

1. `/scripts/backend/` - Scripts for interacting with the backend
2. `/scripts/deployment/` - Scripts for deployment
3. `/scripts/testing/` - Scripts for testing

## Temporary Resources

Temporary resources and backups are stored in `/temp/` to avoid cluttering the main directories:

1. `/temp/clones/` - Repository clones
2. `/temp/backups/` - Backups of important files

## Best Practices

When working with this project:

1. Add new documentation to the appropriate directory based on its purpose
2. Place scripts in the correct subdirectory based on their function
3. Avoid adding files to the root directory
4. Document code and scripts with clear comments
5. Keep the project organized and clean
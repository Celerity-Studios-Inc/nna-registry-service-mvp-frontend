# NNA Registry Service - Project Overview

## Introduction

The NNA Registry Service is a platform for managing digital assets within a Naming, Numbering, and Addressing (NNA) Framework. It implements a dual addressing system that provides both Human-Friendly Names (HFN) and Machine-Friendly Addresses (MFA) for digital assets across various layers.

## Key Components

The system consists of:

1. **Backend Service** (NestJS-based REST API with MongoDB)
   - Asset registration and management
   - User authentication and authorization
   - Taxonomy validation
   - File storage handling
   - Dual addressing system implementation

2. **Frontend UI** (React/TypeScript with Material UI)
   - Asset registration workflow
   - Taxonomy selection interface
   - File upload and management
   - Asset search and browsing
   - Dashboard for asset management

## NNA Framework Layers

The system supports multiple layers for different types of digital assets:

- **S Layer**: Stars (individual personalities)
- **L Layer**: Looks (visual appearance/styles)
- **M Layer**: Moves (dance/movement patterns)
- **W Layer**: Worlds (environments/settings)
- **B Layer**: Beats (music/sound)
- **P Layer**: Places (locations)
- **T Layer**: Things (objects)
- **C Layer**: Concepts (abstract ideas)
- **R Layer**: Realms (narrative worlds)
- **G Layer**: Generics (multi-purpose assets)

## Dual Addressing System

Each asset in the system is assigned two types of addresses:

1. **Human-Friendly Name (HFN)**: Format like `S.POP.BAS.001`
   - Layer code (S)
   - Category code (POP)
   - Subcategory code (BAS)
   - Sequential number (001)

2. **Machine-Friendly Address (MFA)**: Format like `2.001.001.001`
   - Layer numeric code (2)
   - Category numeric code (001)
   - Subcategory numeric code (001)
   - Sequential number (001)

## Key Features

- **Taxonomy-based Organization**: Assets are categorized using a standardized taxonomy of layers, categories, and subcategories
- **Dual Addressing**: Both human-readable and machine-optimized addressing
- **File Management**: Upload, storage, and retrieval of digital assets
- **Search Capabilities**: Find assets using various criteria
- **User Authentication**: Secure access control
- **Asset Metadata**: Store and manage comprehensive asset information

## Development Status

The project is in active development with the following major components:

- **Asset Registration**: Implemented and functional
- **Taxonomy System**: Implemented with enhanced error handling
- **File Upload**: Implemented and functional
- **Authentication**: Implemented
- **Asset Search**: Partially implemented
- **Browse Assets**: Partially implemented
- **Composite Assets**: Planned but not fully implemented

## Repository Structure

The frontend repository is organized as follows:

- `/src`: Source code
  - `/api`: API integration
  - `/components`: React components
  - `/contexts`: React contexts for state management
  - `/hooks`: Custom React hooks
  - `/pages`: Page components
  - `/providers`: Data providers
  - `/services`: Business logic services
  - `/utils`: Utility functions
  - `/types`: TypeScript type definitions
- `/public`: Static assets
- `/docs`: Documentation
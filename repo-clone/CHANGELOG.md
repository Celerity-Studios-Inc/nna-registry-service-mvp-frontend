# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Environment-specific storage service configuration
- Local development storage setup with automatic directory creation
- Improved environment variable validation
- Production mode support for Google Cloud Storage

### Fixed
- Storage service initialization based on NODE_ENV
- Environment variable validation and error handling
- Local storage path configuration

### Changed
- Updated storage service to handle both development and production environments
- Improved error messages for missing environment variables
- Enhanced logging for service initialization

### Tested
- Complete user registration flow
- Authentication and login functionality
- Asset registration process (S.POP.BAS.001)
- Local storage functionality in development mode

## [1.0.0] - 2024-04-27
### Added
- Local development environment setup
- Environment-specific configuration support
- Sentry integration with proper DSN configuration
- Port management (3000 for backend, 3001 for frontend)
- Storage service configuration for local and GCP environments
- Swagger documentation endpoint (/api/docs)

### Changed
- Updated backend service to support both local and production deployments
- Modified frontend build process for environment-specific configurations
- Improved error handling and logging
- Enhanced environment variable validation

### Fixed
- Sentry DSN configuration and initialization
- Port conflict resolution in local development
- OpenTelemetry API registration conflicts
- Repository separation and management

### Security
- Environment variable validation for sensitive configurations
- Proper handling of GCP and Vercel credentials
- Secure storage of production environment variables

### Development Process
- Implemented separate terminal instances for backend and frontend services
- Added documentation for local development setup
- Created environment-specific configuration templates

## [0.1.0] - 2025-04-26

### Added
- Basic authentication system
  - User registration with email, username, and password
  - Login functionality (currently email-only login)
  - JWT-based authentication
- Asset management system
  - Asset registration endpoint
  - Asset retrieval endpoints
  - Batch upload functionality
  - Asset curation endpoint
- Storage system
  - Local storage configuration for development
  - GCP storage configuration for production
- Documentation
  - Swagger API documentation at `/api/docs`
  - Project setup documentation

### Working Features
- User Registration (/auth/register)
- User Login (/auth/login)
- Asset Management APIs (/assets/*)
- MongoDB Connection
- Local Storage Setup

### Environment Setup
- Backend running on port 3000
- Frontend running on port 3001
- MongoDB connection established
- Local storage path: `/storage`
- JWT authentication configured

### Known Issues
- Login endpoint doesn't accept username (only email)
- Need to verify CI/CD pipeline
- Need to consolidate project structure 

## [0.1.1] - 2025-04-26

### Changed
- Project restored to a clean, working state.
- Backend running on http://localhost:3000
- Frontend running on http://localhost:3001
- Both servers start independently with no port conflicts.
- Documented this baseline for future reference. 
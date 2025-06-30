# Prompts to Implement the Backend of theNNA Registry Service  Plan  with Claude Code

## Project Overview

The NNA Registry Service is a crucial component of the NNA Framework for ReViz's AI-powered video remixing platform. It implements a dual addressing system (Human-Friendly Names and NNA Addresses) for digital assets across various layers (Songs, Stars, Looks, Moves, Worlds, Branded, Personalize, etc.). It will be implemented using Nest.js for the backend, MongoDB for metadata storage, and GCP Storage for file management, with enhanced support for training data, rights management, and new layer types.

### Key Features (MVP Scope)

1. **Asset Registration**: Register assets with proper taxonomy classification and training data
1. **Asset Retrieval**: Look up assets by friendly name or NNA address
1. **Asset Management**: Update, delete, search, and curate assets
1. **Authentication**: Secure access with JWT-based authentication and role-based authorization
1. **Google Cloud Storage Integration**: Store and retrieve asset files with organized folder structure
1. **Taxonomy Validation**: Validate assets against the enhanced NNA Layer Taxonomy v1.2
1. **API Documentation**: Comprehensive Swagger documentation
1. **Error Tracking**: Integration with Sentry for monitoring and error tracking

## Implementation Strategy for Non-Programmers Using Claude Code

This implementation plan is specifically designed for non-programmers to build the NNA Registry Service with Claude Code. Each step includes:

- Clear explanation of what we're building
- Step-by-step instructions
- Ready-to-use prompts for Claude Code
- Expected outcomes for verification

## Step 1: Development Environment Setup

### 1.1 Install Required Software

First, we need to set up the development environment on your MacBook Pro.

**Prompt for Claude Code:**

```
I need to set up the development environment for an NNA Registry Service built with Nest.js and MongoDB. Please give me the exact terminal commands I should run to:

1. Install Node.js and npm using Homebrew
2. Install MongoDB using Homebrew
3. Install Google Cloud SDK
4. Install the Nest.js CLI globally

Also, how do I verify each installation was successful?
```

**Expected output**: Commands for installing Node.js, MongoDB, Google Cloud SDK, and Nest.js CLI.

**Follow-up actions**:

1. Open Terminal on your MacBook
1. Copy and paste each command from Claude's response
1. Run the verification commands to ensure everything is installed correctly

### 1.2 Create GitHub Repository and Project Structure

**Prompt for Claude Code:**

```
I want to create a new GitHub repository for the NNA Registry Service and clone it to my local machine. Please give me:

1. Step-by-step instructions for creating the repository on GitHub
2. The terminal commands to clone it locally
3. A basic folder structure I should create for a Nest.js project that will handle:
   - Asset registration and management
   - MongoDB integration
   - GCP Bucket storage
   - JWT authentication
   - Swagger documentation
   - Sentry for error tracking

For the folder structure, please include all necessary directories and placeholder files I should create.
```

**Expected output**: Instructions for GitHub repository creation, cloning commands, and detailed folder structure.

## Step 2: Project Setup with Nest.js

### 2.1 Initialize Nest.js Project

**Prompt for Claude Code:**

```
I need to initialize a Nest.js project for the NNA Registry Service. Please provide:

1. The exact command to create a new Nest.js project with npm as the package manager
2. A package.json file with all necessary dependencies for:
   - Nest.js core (@nestjs/common, @nestjs/core, etc.)
   - MongoDB integration (@nestjs/mongoose, mongoose)
   - JWT authentication (@nestjs/jwt, passport, passport-jwt)
   - GCP Storage (@google-cloud/storage)
   - Validation (class-validator, class-transformer)
   - Swagger (@nestjs/swagger)
   - Sentry (@sentry/node, @sentry/tracing)
   - Development tools (eslint, prettier, etc.)

Please format the package.json file so I can directly copy it into my project.
```

**Expected output**: Nest.js initialization command and a complete package.json.

**Follow-up actions**:

1. Run the initialization command in your terminal
1. Replace the generated package.json with the one provided by Claude
1. Run `npm install` to install all dependencies

### 2.2 Configure Environment Variables

**Prompt for Claude Code:**

```
I need to set up environment variables for my NNA Registry Service. Please create:

1. A .env file with placeholders for all necessary variables:
   - MongoDB connection string
   - JWT secret
   - GCP project ID and bucket name
   - Sentry DSN
   - Other necessary configuration values

2. A .env.example file that I can check into GitHub (without sensitive values)

3. The necessary updates to .gitignore to ensure the .env file is not committed

Please format these files so I can directly copy them into my project.
```

**Expected output**: .env, .env.example, and .gitignore file contents.

## Step 3: Implement Core Data Models

### 3.1 Create MongoDB Schemas with Mongoose

**Prompt for Claude Code:**

```
I need to create MongoDB schemas for the NNA Registry Service using Mongoose and NestJS. Please provide the complete code for the following schemas:

1. Asset Schema: A comprehensive schema that stores:
   - Basic fields: layer, category, subcategory, name, nna_address
   - Storage information: gcpStorageUrl
   - Metadata: source, tags, description
   - Training data: prompts, images, videos
   - Rights information: source, rights_split
   - Components (for composite assets)
   - Created/updated timestamps

2. User Schema: Stores user information with:
   - Email (with validation)
   - Password (with bcrypt hashing)
   - Role (user/admin)
   - Created/updated timestamps
   - A method to compare passwords

Please implement these using the NestJS schema approach (@Prop, SchemaFactory) with TypeScript and Mongoose. Include proper indexes for efficient querying, especially for full-text search on name, description, and tags.
```

**Expected output**: Complete schema definitions for Asset and User models with proper indexing and validation.

**Follow-up actions**:

1. Create a `src/models` directory
1. Create a file for each schema
1. Copy the provided code into each file

## Step 4: Implement GCP Storage Service

### 4.1 Create GCP Storage Service

**Prompt for Claude Code:**

```
I need to create a GCP Storage service for the NNA Registry Service using NestJS. Please provide the complete code for:

1. A StorageService class that:
   - Connects to GCP Storage
   - Uploads files to a bucket with a path structure based on taxonomy (layer/category/subcategory)
   - Makes uploaded files publicly accessible
   - Returns the public URL for uploaded files
   - Includes a method to delete files

2. A StorageModule to make this service available throughout the application

Please include all necessary imports, error handling, and TypeScript types. The service should be implemented using dependency injection and the NestJS architecture patterns.
```

**Expected output**: Complete StorageService and StorageModule implementation.

**Follow-up actions**:

1. Create a `src/modules/storage` directory
1. Create `storage.service.ts` and `storage.module.ts` files
1. Copy the provided code into each file

### 4.2 Configure Swagger and Sentry

**Prompt for Claude Code:**

```
I need to set up configuration files for Swagger documentation and Sentry error tracking. Please provide the complete code for:

1. A swagger.config.ts file that sets up the Swagger documentation:
   - Title: "NNA Registry Service API"
   - Description: "API for managing digital assets in the NNA Framework"
   - Version information
   - Bearer authentication
   - Tags for organizing endpoints

2. A sentry.config.ts file that:
   - Initializes Sentry with DSN from environment variables
   - Configures tracing and profiling
   - Provides methods for capturing exceptions and messages
   - Includes user context setting for better error tracking

3. A gcp.config.ts file for GCP configuration

Please include all necessary imports and ensure the configurations follow NestJS best practices for integration.
```

**Expected output**: Configuration files for Swagger, Sentry, and GCP.

**Follow-up actions**:

1. Create a `src/config` directory
1. Create the configuration files
1. Copy the provided code into each file

## Step 5: Implement Authentication Module

### 5.1 Create Authentication Module

**Prompt for Claude Code:**

```
I need to implement JWT authentication for the NNA Registry Service using NestJS. Please provide the complete code for:

1. DTOs for authentication:
   - RegisterDto with email and password validation
   - LoginDto with validation

2. Guards for protecting routes:
   - JwtAuthGuard for authentication
   - RolesGuard for authorization

3. Strategy for JWT authentication:
   - JwtStrategy that extracts and validates tokens

4. Auth Service with methods for:
   - User registration
   - User login and token generation
   - Making a user an admin
   - Getting user profile

5. Auth Controller with endpoints for:
   - Registration (/auth/register)
   - Login (/auth/login)
   - Making a user an admin (/auth/make-admin)
   - Getting user profile (/auth/profile)

6. Auth Module that ties everything together

Please include Swagger documentation annotations, proper validation, error handling, and NestJS best practices.
```

**Expected output**: Complete authentication implementation with DTOs, guards, strategy, service, controller, and module.

**Follow-up actions**:

1. Create a `src/modules/auth` directory with appropriate subdirectories
1. Create files for each component
1. Copy the provided code into each file

## Step 6: Implement Assets Module

### 6.1 Create Assets Service and Controller

**Prompt for Claude Code:**

```
I need to implement the Assets module for the NNA Registry Service using NestJS. Please provide the complete code for:

1. An AssetsService that:
   - Creates new assets with proper taxonomy validation
   - Supports batch asset creation from CSV data
   - Finds assets by name or NNA address
   - Searches assets with filtering, pagination, and full-text search
   - Updates existing assets
   - Deletes assets (with admin authorization)
   - Supports asset curation workflow

2. An AssetsController that:
   - Exposes RESTful endpoints for all asset operations
   - Handles file uploads with FileInterceptor
   - Implements proper request validation with DTOs
   - Uses guards for authentication and role-based access
   - Includes comprehensive Swagger documentation
   - Returns standardized response formats

3. Three DTOs:
   - CreateAssetDto with validation for asset registration
   - UpdateAssetDto for partial updates
   - SearchAssetDto for filtering and pagination

4. An AssetsModule that ties everything together with proper imports

Please include proper error handling, authentication guards, and role-based access control, especially for operations like deletion and curation that should be admin-only.
```

**Expected output**: Complete assets module implementation with service, controller, DTOs, and module configuration.

**Follow-up actions**:

1. Create a `src/modules/assets` directory with appropriate subdirectories
1. Create files for each component
1. Copy the provided code into each file

## Step 7: Implement Taxonomy Module

### 7.1 Create Taxonomy Service

**Prompt for Claude Code:**

```
I need to implement a Taxonomy module for validating assets against the enhanced NNA Layer Taxonomy (v1.2). Please provide the complete code for:

1. A TaxonomyService that:
   - Loads the taxonomy data from the JSON file (enriched_nna_layer_taxonomy_v1.2.json)
   - Validates layer, category, and subcategory combinations
   - Supports the enhanced taxonomy structure with aliases and mappings
   - Provides methods to get layer names and categories
   - Handles taxonomy validation errors with proper HTTP exceptions

2. A TaxonomyModule that makes this service available to other modules

3. A utility function to load the taxonomy JSON file

Please include proper error handling and make the service injectable according to NestJS dependency injection patterns.
```

**Expected output**: Complete taxonomy module implementation with service, module, and utility function.

**Follow-up actions**:

1. Create a `src/modules/taxonomy` directory
1. Create the necessary files
1. Copy the provided code into each file
1. Create a `taxonomy` directory in the project root
1. Copy the `enriched_nna_layer_taxonomy_v1.2.json` file there

## Step 8: Implement Common Utilities and Filters

### 8.1 Create HTTP Exception Filter and Logging Interceptor

**Prompt for Claude Code:**

```
I need to create common utilities and filters for the NNA Registry Service. Please provide the complete code for:

1. An HttpExceptionFilter that:
   - Catches all HTTP exceptions
   - Formats error responses in a standardized format with success flag, error details, and metadata
   - Integrates with Sentry for error tracking
   - Includes request path and timestamp in the response

2. A LoggingInterceptor that:
   - Logs incoming requests with method and path
   - Measures response time
   - Logs completed requests with duration
   - Uses NestJS Logger for consistent log formatting

3. A Roles decorator for role-based access control

Please include all necessary imports and explain how to register these globally in the application.
```

**Expected output**: Complete implementation of exception filter, logging interceptor, and roles decorator.

**Follow-up actions**:

1. Create a `src/common` directory with appropriate subdirectories
1. Create files for each component
1. Copy the provided code into each file

## Step 9: Application Entry Point and Integration

### 9.1 Create Main Application Files and Integration

**Prompt for Claude Code:**

```
I need to create the main application entry point files and integrate all modules for the NNA Registry Service. Please provide the complete code for:

1. app.module.ts - The main application module that:
   - Imports ConfigModule with environment variables
   - Sets up MongooseModule with async configuration
   - Imports AuthModule, AssetsModule, StorageModule, and TaxonomyModule
   - Provides SentryService globally

2. main.ts - The entry point that:
   - Creates the NestJS application
   - Registers global filters (HttpExceptionFilter)
   - Registers global interceptors (LoggingInterceptor)
   - Sets up Swagger documentation
   - Enables CORS
   - Listens on the configured port

Please ensure all components are properly integrated and the application is configured for both development and production use.
```

**Expected output**: Complete application entry point files with proper integration of all components.

**Follow-up actions**:

1. Create or update `src/app.module.ts` and `src/main.ts` files
1. Copy the provided code into each file

## Step 10: Testing Implementation

### 10.1 Implement Unit Tests for Assets Service

**Prompt for Claude Code:**

```
I need to implement unit tests for the AssetsService in the NNA Registry Service. Please provide the complete code for:

1. A test file (assets.service.spec.ts) that:
   - Sets up TestingModule with mocks for dependencies (AssetModel, StorageService, TaxonomyService)
   - Tests asset creation with valid inputs
   - Tests asset creation with invalid taxonomy (should throw error)
   - Tests finding an asset by name
   - Tests searching assets with various filters
   - Tests updating an asset
   - Tests deleting an asset
   - Tests batch asset creation

Please include all necessary imports, proper mocking techniques, and explain how to run the tests.
```

**Expected output**: Complete unit tests for AssetsService.

**Follow-up actions**:

1. Create a test file in the assets module directory
1. Copy the provided code
1. Run the tests with `npm run test`

### 10.2 Implement Controller Tests

**Prompt for Claude Code:**

```
I need to implement tests for the AssetsController in the NNA Registry Service. Please provide the complete code for:

1. A test file (assets.controller.spec.ts) that:
   - Sets up TestingModule with mocks for AssetsService
   - Overrides guards for testing
   - Tests the create endpoint with file upload
   - Tests the batch create endpoint
   - Tests the search endpoint
   - Tests the findByName endpoint
   - Tests the update endpoint
   - Tests the delete endpoint (admin-only)
   - Tests the curate endpoint (admin-only)

Please include all necessary imports, proper mocking techniques, and explain how to run the tests.
```

**Expected output**: Complete tests for AssetsController.

**Follow-up actions**:

1. Create a test file in the assets module directory
1. Copy the provided code
1. Run the tests with `npm run test`

## Step 11: API Documentation Enhancement

### 11.1 Enhance Swagger Documentation

**Prompt for Claude Code:**

```
I need to enhance the Swagger documentation for the NNA Registry Service API. Please provide:

1. Updated controller decorators with:
   - Detailed operation summaries and descriptions
   - Response examples for success and error scenarios
   - Clear parameter descriptions
   - File upload documentation

2. Enhanced DTO decorators with:
   - Example values
   - Detailed property descriptions
   - Required/optional markers

3. Explanation of how to organize the documentation with tags

Please provide specific code examples that I can add to my existing controllers and DTOs to improve the API documentation.
```

**Expected output**: Enhanced Swagger documentation decorators and examples.

**Follow-up actions**:

1. Update controllers and DTOs with the enhanced documentation
1. Run the application and check the Swagger UI

## Step 12: Scripts and Deployment Configuration

### 12.1 Configure Scripts and Deployment

**Prompt for Claude Code:**

```
I need to configure scripts and deployment for the NNA Registry Service. Please provide:

1. Updated package.json scripts for:
   - Development with hot reloading
   - Production build and start
   - Testing (unit, e2e)
   - Linting and formatting

2. A Dockerfile for containerizing the application

3. Docker Compose configuration for local development with MongoDB

4. Basic deployment instructions for:
   - Google Cloud Run
   - Kubernetes

Please include explanations for each configuration and step-by-step deployment instructions.
```

**Expected output**: Scripts, Dockerfile, Docker Compose, and deployment instructions.

**Follow-up actions**:

1. Update package.json with the provided scripts
1. Create Dockerfile and docker-compose.yml
1. Test the Docker setup locally

## Step 13: Project Documentation

### 13.1 Create README and Documentation

**Prompt for Claude Code:**

```
I need to create comprehensive documentation for the NNA Registry Service. Please provide:

1. A complete README.md with:
   - Project overview and features
   - Technology stack and architecture diagram (in Mermaid format)
   - Installation and setup instructions
   - Environment configuration guide
   - API overview (with links to Swagger)
   - Development workflow
   - Testing instructions
   - Deployment guide
   - Troubleshooting section

2. API examples for key endpoints, showing:
   - Request format (including headers)
   - Expected response
   - Possible error scenarios
   - Curl commands for testing

Please format the documentation in a way that is clear and accessible for both technical and non-technical users.
```

**Expected output**: Complete README.md and API documentation.

**Follow-up actions**:

1. Create or update README.md
1. Add additional documentation as needed

## Step 14: Testing and Quality Assurance

### 14.1 Implement E2E Tests

**Prompt for Claude Code:**

```
I need to implement end-to-end (E2E) tests for the NNA Registry Service. Please provide:

1. A complete E2E test suite that:
   - Sets up a test database with MongoDB Memory Server
   - Creates a test user and gets authentication token
   - Tests the complete asset registration workflow
   - Tests search functionality
   - Tests update and delete operations
   - Tests authentication and authorization

2. Configuration for E2E testing with:
   - Jest setup
   - Test environment variables
   - Utility functions for auth and cleanup

Please include detailed explanations and instructions for running the tests.
```

**Expected output**: Complete E2E test suite and configuration.

**Follow-up actions**:

1. Create test files in the appropriate directories
1. Set up test configuration
1. Run the E2E tests

## Step 15: Finalization and Deployment

### 15.1 Final Verification and Deployment

**Prompt for Claude Code:**

```
I need to perform final verification and deploy the NNA Registry Service. Please provide:

1. A comprehensive checklist for verifying:
   - All features are implemented correctly
   - All tests pass
   - API documentation is complete
   - Error handling works properly
   - Security measures are in place
   - Performance is acceptable

2. Step-by-step deployment instructions for:
   - Setting up production environment variables
   - Building for production
   - Deploying to a hosting service (e.g., Google Cloud Run)
   - Verifying the deployment
   - Monitoring and logging setup

Please include troubleshooting tips for common deployment issues.
```

**Expected output**: Verification checklist and detailed deployment instructions.

**Follow-up actions**:

1. Go through the verification checklist
1. Follow the deployment instructions
1. Verify the application is running correctly in production

## Verification & Testing Checklist

After each implementation step, verify that:

- The code compiles without errors
- The tests pass
- The API endpoints work as expected
- Swagger documentation is accurate
- Error handling works properly
- Sentry captures errors correctly

Use the following command to start the application in development mode:

```bash
npm run start:dev
```

Then access:

- API at http://localhost:3000
- Swagger UI at http://localhost:3000/api/docs

## Final Configuration

Once all components are implemented and tested, make sure to:

1. Update environment variables for production
1. Finalize the documentation
1. Run a complete test suite
1. Deploy the application to your hosting environment

This step-by-step guide should enable you to build the NNA Registry Service with Claude Code's assistance, even with minimal programming knowledge. Each prompt is designed to generate complete, working code that you can copy and paste into your project.

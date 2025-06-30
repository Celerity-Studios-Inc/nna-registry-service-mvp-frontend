# NNA Registry Service

Last verified: April 25, 2024

A service for managing the Naming, Numbering, and Addressing (NNA) Framework for ReViz's AI-powered video remixing platform.

## Description

The NNA Registry Service is a crucial component of the NNA Framework for ReViz's AI-powered video remixing platform. It implements a dual addressing system (Human-Friendly Names and NNA Addresses) for digital assets across various layers (Songs, Stars, Looks, Moves, Worlds, etc.).

## Documentation

- **[Project Documentation](PROJECT_DOCUMENTATION.md)**: Complete overview of the project architecture, modules, and APIs
- **[Docker Installation Guide](INSTALL_DOCKER.md)**: Instructions for installing Docker on macOS
- **[Docker Deployment Guide](DOCKER_DEPLOYMENT.md)**: Guide for deploying the service with Docker
- **[Google Cloud Run Deployment Guide](GCP_DEPLOYMENT.md)**: Guide for deploying to Google Cloud Run
- **[API Testing Guide](test/README.md)**: Documentation for the automated API test tools
- **[Swagger Usage Guide](swagger-asset-example.md)**: Step-by-step guide for using Swagger UI

## Architecture

```mermaid
graph TD
    Client[Client Applications] --> API[NNA Registry Service API]
    API --> Auth[Authentication Module]
    API --> Assets[Assets Module]
    API --> Taxonomy[Taxonomy Module]
    Auth --> MongoDB[(MongoDB Database)]
    Assets --> MongoDB
    Assets --> Storage[Storage Module]
    Storage --> GCP[Google Cloud Storage]
    Taxonomy --> TaxonomyFile[Taxonomy JSON File]
    API --> Sentry[Sentry Error Monitoring]
```

## Features

- Asset registration with taxonomy classification
- Asset retrieval by friendly name or NNA address
- Asset management (update, delete, search, curate)
- Google Cloud Storage integration for asset files
- JWT-based authentication and role-based authorization
- Taxonomy validation against NNA Layer Taxonomy v1.3
- API documentation with Swagger
- Error monitoring with Sentry

## Tech Stack

- NestJS for backend API
- MongoDB for metadata storage
- Google Cloud Storage for asset file management
- JWT authentication
- Swagger for API documentation
- Sentry for error tracking
- Docker for containerization
- Jest for testing

## Prerequisites

- Node.js 18+
- MongoDB
- Google Cloud Platform account with Storage API enabled
- Sentry account for error monitoring
- Docker (optional, for containerized deployment)

## Local Development Environment

The NNA Registry Service consists of two main components:

### Backend Service
- Running on: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs
- MongoDB Connection: Connected to MongoDB Atlas
- Environment: Development mode with local storage

### Frontend Service
- Running on: http://localhost:3001
- Main Dashboard: http://localhost:3001/dashboard
- Connected to backend API at http://localhost:3000

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - Copy `.env.example` to `.env.development` for local development
   - Copy `.env.example` to `.env.production` for production setup
4. Start the service:
   - Development: `npm run start:dev`
   - Production: `npm run start:prod`

## Environment Configuration

The service supports two environments:

### Development Mode
- Set `NODE_ENV=development`
- Uses local file storage at `./storage`
- No GCP credentials required
- Automatically creates storage directory

### Production Mode
Required environment variables:
- `NODE_ENV=production`
- `GCP_PROJECT_ID`
- `GCP_BUCKET_NAME`
- `GOOGLE_APPLICATION_CREDENTIALS`

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get a JWT token
- `POST /auth/make-admin` - Make a user an admin (admin only)
- `GET /auth/profile` - Get user profile

### Assets

- `POST /assets` - Register a new asset
- `POST /assets/batch` - Batch register assets via CSV
- `GET /assets` - Search assets with filtering
- `GET /assets/:name` - Get asset by name
- `PUT /assets/:name` - Update an asset
- `DELETE /assets/:name` - Delete an asset (admin only)
- `POST /assets/curate/:name` - Curate an asset (admin only)

## Available Scripts

```bash
# Development
npm run start           # Start the application
npm run start:dev       # Start the application with watch mode
npm run start:debug     # Start the application with debugging
npm run lint            # Run ESLint
npm run format          # Run Prettier to format code

# Testing
npm run test            # Run unit tests
npm run test:watch      # Run unit tests in watch mode
npm run test:cov        # Run tests with coverage report
npm run test:e2e        # Run end-to-end tests

# Production
npm run build           # Build the application
npm run start:prod      # Run the production build
npm run docker:build    # Build Docker image
npm run docker:run      # Run Docker container
```

## Project Structure

```
nna-registry-service/
├── src/
│   ├── config/           # Configuration files (Swagger, Sentry, MongoDB, GCP)
│   │   ├── auth/         # Authentication module
│   │   │   ├── dto/      # Data Transfer Objects
│   │   │   ├── guards/   # Authentication guards
│   │   │   ├── strategies/ # JWT strategy
│   │   ├── assets/       # Assets module
│   │   │   ├── dto/      # Data Transfer Objects
│   │   ├── storage/      # GCP Storage module
│   │   ├── taxonomy/     # Taxonomy validation module
│   │   ├── models/       # MongoDB schemas
│   │   ├── common/       # Common utilities, filters, interceptors, decorators
│   │   │   ├── decorators/   # Custom decorators
│   │   │   ├── filters/      # HTTP filters
│   │   │   ├── interceptors/ # Request/response interceptors
│   │   │   ├── utils/        # Utility functions
│   │   │   ├── app.module.ts     # Main application module
│   │   │   ├── main.ts           # Application entry point
│   │   ├── taxonomy/             # Taxonomy JSON files
│   │   ├── test/                 # Tests
│   │   │   ├── api-tests.sh     # Automated API test script
│   │   │   ├── nna-registry-service.postman_collection.json # Postman collection
│   │   │   ├── nna-registry-service.postman_environment.json # Postman environment
│   │   │   ├── jest-e2e.json    # E2E test configuration
│   │   │   ├── app.e2e-spec.ts  # E2E test for app
│   │   │   ├── auth.e2e-spec.ts # E2E test for auth module
│   │   ├── docker/               # Docker configuration
│   │   ├── .env.example          # Environment variables template
│   │   ├── Dockerfile            # Docker build instructions
│   │   ├── docker-compose.yml    # Docker Compose configuration
```

## Deployment

### Google Cloud Run

1. Build the Docker image
```bash
npm run build
docker build -t gcr.io/your-project-id/nna-registry-service:latest .
```

2. Push the image to Google Container Registry
```bash
docker push gcr.io/your-project-id/nna-registry-service:latest
```

3. Deploy to Cloud Run
```bash
gcloud run deploy nna-registry-service \
  --image gcr.io/your-project-id/nna-registry-service:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/nna-registry,JWT_SECRET=your-secret,GCP_PROJECT_ID=your-project-id,GCP_BUCKET_NAME=your-bucket-name,SENTRY_DSN=your-sentry-dsn"
```

### Kubernetes

1. Create a Kubernetes deployment file (kubernetes.yaml)
2. Apply the configuration
```bash
kubectl apply -f kubernetes.yaml
```

3. Verify the deployment
```bash
kubectl get deployments
kubectl get services
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| PORT | Application port | No | 3000 |
| MONGODB_URI | MongoDB connection string | Yes | - |
| JWT_SECRET | Secret for JWT token generation | Yes | - |
| GCP_PROJECT_ID | Google Cloud project ID | Yes | - |
| GCP_BUCKET_NAME | GCP storage bucket name | Yes | - |
| GOOGLE_APPLICATION_CREDENTIALS | Path to GCP credentials file | Yes | - |
| SENTRY_DSN | Sentry DSN for error tracking | No | - |
| NODE_ENV | Environment (development/production) | No | development |

## Troubleshooting

- **MongoDB Connection Failed**: Check if MongoDB is running and ensure the `MONGODB_URI` in `.env` is correct.
- **GCP Storage Upload Failed**: Verify the `GOOGLE_APPLICATION_CREDENTIALS` path and ensure the service account has access to the bucket.
- **Sentry Not Capturing Errors**: Ensure the `SENTRY_DSN` in `.env` is correct.
- **Docker Issues**: Make sure Docker is running and you have the right permissions.
- **JWT Authentication Failed**: Verify the JWT_SECRET is properly set and consistent.

## Testing

The service includes comprehensive unit tests, E2E tests, and automated API tests:

1. **Unit Tests**: Tests for individual components, services, and controllers
2. **E2E Tests**: End-to-end tests for authentication and asset management flows
3. **Automated API Tests**: Shell script and Postman collection for API testing

Run tests with:
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov

# Automated API tests (requires running service)
npm run test:api
```

### Postman Collection

For interactive API testing, a Postman collection is included:

1. Import `test/nna-registry-service.postman_collection.json` into Postman
2. Import the environment file `test/nna-registry-service.postman_environment.json`
3. Select the "NNA Registry Service" environment from the dropdown
4. Run individual requests or use the Collection Runner

See `test/README.md` for detailed testing instructions.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is [MIT licensed](LICENSE).
# Trigger build

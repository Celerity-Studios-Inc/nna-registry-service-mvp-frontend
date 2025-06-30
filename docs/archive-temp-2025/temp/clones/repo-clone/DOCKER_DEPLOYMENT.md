# Docker Deployment Guide for NNA Registry Service

This guide will help you deploy the NNA Registry Service using Docker and Docker Compose.

## Prerequisites

1. Docker installed on your machine
2. Docker Compose installed on your machine
3. Git repository cloned locally

## Development Deployment

The development deployment uses local file storage instead of GCP Storage and comes with a MongoDB container.

### Steps to Deploy in Development Mode

1. Navigate to the project directory:
   ```bash
   cd nna-registry-service
   ```

2. Make sure you have the mock GCP credentials file:
   ```bash
   # Check if the file exists
   ls -la gcp-credentials.json
   
   # If it doesn't exist, create it using the template from the README
   # or re-run the setup command
   ```

3. Create a local storage directory:
   ```bash
   mkdir -p storage
   ```

4. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

5. Check that the containers are running:
   ```bash
   docker-compose ps
   ```

6. Access the API and Swagger documentation:
   - API: http://localhost:3000
   - Swagger: http://localhost:3000/api/docs

7. To view logs:
   ```bash
   docker-compose logs -f
   ```

8. To stop the containers:
   ```bash
   docker-compose down
   ```

## Production Deployment

For production deployment, you'll need to set up real GCP credentials and configure the environment for production.

### Steps to Deploy in Production Mode

1. Create a GCP service account and download the credentials file.

2. Create a `.env` file in the project root with the following variables:
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   GCP_PROJECT_ID=<your-gcp-project-id>
   GCP_BUCKET_NAME=<your-gcp-bucket-name>
   GOOGLE_APPLICATION_CREDENTIALS=/app/google-credentials.json
   SENTRY_DSN=<your-sentry-dsn>
   ```

3. Build the production Docker image:
   ```bash
   docker build -t nna-registry-service:production .
   ```

4. Run the container (with MongoDB running separately):
   ```bash
   docker run -d \
     --name nna-registry-service \
     -p 3000:3000 \
     --env-file .env \
     -v /path/to/your/credentials.json:/app/google-credentials.json:ro \
     nna-registry-service:production
   ```

5. Access the API and Swagger documentation:
   - API: http://localhost:3000
   - Swagger: http://localhost:3000/api/docs

## Using Docker with External MongoDB

If you want to use an external MongoDB instance (like MongoDB Atlas) instead of the Docker container:

1. Update the `.env` file with your MongoDB connection string.

2. Remove the MongoDB service from the docker-compose file or use a modified file:
   ```yaml
   version: '3.8'
   
   services:
     api:
       build:
         context: .
         dockerfile: Dockerfile
       container_name: nna-registry-service
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - PORT=3000
         - MONGODB_URI=<your-mongodb-connection-string>
         - JWT_SECRET=<your-jwt-secret>
         - GCP_PROJECT_ID=<your-gcp-project-id>
         - GCP_BUCKET_NAME=<your-gcp-bucket-name>
         - GOOGLE_APPLICATION_CREDENTIALS=/app/google-credentials.json
         - SENTRY_DSN=<your-sentry-dsn>
       volumes:
         - /path/to/your/credentials.json:/app/google-credentials.json:ro
   ```

3. Start the service:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Troubleshooting

### Container fails to start

1. Check the logs:
   ```bash
   docker-compose logs
   ```

2. Verify environment variables:
   ```bash
   docker-compose config
   ```

3. Check if MongoDB is accessible:
   ```bash
   docker exec -it nna-registry-service ping mongo
   ```

### API returns 500 errors

1. Check the logs for specific error messages:
   ```bash
   docker-compose logs api
   ```

2. Verify the MongoDB connection:
   ```bash
   docker exec -it nna-mongodb mongo
   ```

### GCP Storage issues

1. Check if the credentials file is properly mounted:
   ```bash
   docker exec -it nna-registry-service ls -la /app/gcp-credentials.json
   ```

2. Validate environment variables:
   ```bash
   docker exec -it nna-registry-service env | grep GCP
   ```

## Backup and Restore

### Backup MongoDB Data

```bash
docker exec -it nna-mongodb sh -c 'mongodump --archive' > nna-mongodb-backup.archive
```

### Restore MongoDB Data

```bash
docker exec -it nna-mongodb sh -c 'mongorestore --archive' < nna-mongodb-backup.archive
```

## Next Steps

- Set up a reverse proxy with Nginx or Traefik
- Configure HTTPS with Let's Encrypt
- Set up automatic backups for MongoDB
- Implement monitoring with Prometheus and Grafana
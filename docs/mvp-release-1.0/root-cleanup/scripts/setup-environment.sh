#!/bin/bash
# Script to set up environment for testing with the provided MongoDB connection

BACKEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-backend"

# Navigate to backend directory
cd "$BACKEND_DIR" || exit 1

# Create or update .env file with MongoDB connection string
echo "Creating .env file with MongoDB connection..."
cat > .env << 'EOL'
MONGODB_URI=mongodb+srv://registryservice.xhmyito.mongodb.net/
PORT=3000
NODE_ENV=development
EOL

echo "Environment file created with MongoDB connection."
echo "Starting the backend service..."

# Run with the local NestJS CLI
echo "Starting backend with: npm run start:dev"
./node_modules/.bin/nest start --watch
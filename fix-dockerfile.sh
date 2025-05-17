#!/bin/bash
# Script to update Dockerfile in the backend repository to a simpler version

BACKEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-backend"
SCRIPT_DIR="$(pwd)"

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
  echo "Backend directory not found at $BACKEND_DIR"
  exit 1
fi

# Create a simple Dockerfile that just copies files and starts the app
cat > "$BACKEND_DIR/Dockerfile" << 'EOL'
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Copy package.json files
COPY package*.json ./

# Install dependencies
RUN npm install --production --legacy-peer-deps

# Copy source code
COPY . .

# Start the application
CMD ["node", "src/main.js"]
EOL

echo "Dockerfile has been simplified to a basic Node.js container configuration"

# Commit and push changes
cd "$BACKEND_DIR"
git add Dockerfile
git commit -m "Simplify Dockerfile for more reliable builds"
git push origin main

echo "Updated Dockerfile has been pushed to the backend repository"

# Return to original directory
cd "$SCRIPT_DIR" || exit 1
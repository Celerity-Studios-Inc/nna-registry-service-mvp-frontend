#!/bin/bash

# Script to copy CI/CD setup files from the working branch to the backend repository

BACKEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-backend"
TEMP_DIR="/tmp/nna-working-branch"

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
  echo "Backend directory not found at $BACKEND_DIR"
  exit 1
fi

# Create temp directory
echo "Creating temporary directory..."
mkdir -p "$TEMP_DIR"

# Clone the working branch
echo "Cloning the working branch..."
git clone -b stable-backend-new-key --depth 1 https://github.com/EqualsAjayMadhok/nna-registry-service.git "$TEMP_DIR"

# Check if clone was successful
if [ ! -d "$TEMP_DIR" ]; then
  echo "Failed to clone the working branch"
  exit 1
fi

# Copy the necessary files
echo "Copying files from working branch to backend repository..."

# Copy CI/CD workflow if it exists
if [ -d "$TEMP_DIR/.github/workflows" ]; then
  echo "Copying GitHub Actions workflow..."
  mkdir -p "$BACKEND_DIR/.github/workflows"
  cp -f "$TEMP_DIR/.github/workflows"/*.yml "$BACKEND_DIR/.github/workflows/"
fi

# Copy Dockerfile if it exists
if [ -f "$TEMP_DIR/Dockerfile" ]; then
  echo "Copying Dockerfile..."
  cp -f "$TEMP_DIR/Dockerfile" "$BACKEND_DIR/"
fi

# Copy package.json and package-lock.json if they exist
if [ -f "$TEMP_DIR/package.json" ]; then
  echo "Copying package.json..."
  cp -f "$TEMP_DIR/package.json" "$BACKEND_DIR/"
fi

if [ -f "$TEMP_DIR/package-lock.json" ]; then
  echo "Copying package-lock.json..."
  cp -f "$TEMP_DIR/package-lock.json" "$BACKEND_DIR/"
fi

# Copy any other necessary CI/CD files
for file in tsconfig.json .dockerignore; do
  if [ -f "$TEMP_DIR/$file" ]; then
    echo "Copying $file..."
    cp -f "$TEMP_DIR/$file" "$BACKEND_DIR/"
  fi
done

# Clean up temp directory
echo "Cleaning up..."
rm -rf "$TEMP_DIR"

# Commit and push the changes
echo "Committing and pushing changes..."
cd "$BACKEND_DIR"
git add .
git commit -m "Copy CI/CD setup from working branch"
git push origin main

echo "Files have been copied from the working branch and pushed to GitHub!"
echo "The GitHub Actions workflow should now run successfully."
#!/bin/bash

# Run a clean build with CI=false to allow warnings but fail on errors

echo "=== Running clean build with CI=false ==="
echo "This will build the project ignoring TypeScript warnings but failing on errors"

# Clean up previous build artifacts
echo "Cleaning up previous build..."
rm -rf build

# Run the build with CI=false
echo "Building project..."
CI=false npm run build

# Check build status
if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  echo "Build output is in the 'build' directory"
else
  echo "❌ Build failed!"
  echo "Please check the error messages above"
fi
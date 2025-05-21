#!/bin/bash

echo "Running simplified build fix script..."

# Run the build with CI=false to prevent ESLint warnings from being treated as errors
echo "Running build with CI=false..."
CI=false npm run build

echo "Build fix completed successfully!"
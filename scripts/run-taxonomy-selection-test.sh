#!/bin/bash

# Run the Taxonomy Selection Test
# This script runs the taxonomy selection test and opens the test UI

echo "=== NNA Registry Service - Taxonomy Selection Test ==="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed"
    exit 1
fi

# Set the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

echo "Running taxonomy selection test..."
echo ""

# Run the test script
node scripts/test-taxonomy-selection.js

echo ""
echo "Opening test UI in the browser..."

# Open the test UI in the browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open public/taxonomy-selection-test.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open public/taxonomy-selection-test.html
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    start public/taxonomy-selection-test.html
else
    echo "Couldn't open browser automatically. Please open public/taxonomy-selection-test.html manually."
fi

echo ""
echo "Test completed. Check the console output and UI for results."
#!/bin/bash
# Script to examine the package.json of the backend to find start commands

BACKEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-backend"

if [ ! -f "$BACKEND_DIR/package.json" ]; then
  echo "package.json not found in $BACKEND_DIR"
  exit 1
fi

echo "Available scripts in backend package.json:"
grep -A 50 "\"scripts\"" "$BACKEND_DIR/package.json" | grep -v "}" | head -n 20

echo ""
echo "Checking for main entry point..."
grep "\"main\"" "$BACKEND_DIR/package.json" || echo "No main entry found."

echo ""
echo "Backend dependencies:"
grep -A 5 "\"dependencies\"" "$BACKEND_DIR/package.json" | head -n 6
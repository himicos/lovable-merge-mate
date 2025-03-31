#!/usr/bin/env bash
# exit on error
set -o errexit

# Clean up previous build
echo "Cleaning up previous build..."
rm -rf dist

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build TypeScript
echo "Building TypeScript..."
npm run build

# Copy necessary files
echo "Copying configuration files..."
cp package*.json dist/
cp .env dist/ 2>/dev/null || :

echo "Build completed successfully!"

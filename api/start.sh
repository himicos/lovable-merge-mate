#!/usr/bin/env bash
# exit on error
set -o errexit

# Change to dist directory
cd dist

# Start the server
echo "Starting server..."
node index.js

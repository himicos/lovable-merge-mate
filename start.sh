#!/bin/bash

# Get the port from environment or default to 10000
PORT=${PORT:-10000}

# Start Nginx in the background
echo "Starting Nginx..."
nginx &

# Start the API server in the foreground from the correct directory
echo "Starting API server on port $PORT..."
cd /api
# Use the PORT env var (set by Render or defaulted above) and run the 'start' script from api/package.json
PORT=$PORT npm start

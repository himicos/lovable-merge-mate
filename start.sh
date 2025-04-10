#!/bin/bash

# Get the port from environment or default to 10000
PORT=${PORT:-10000}

# Build frontend
cd "$(dirname "$0")"
npm run build

# Copy dist to server directory
cp -r dist server/

# Start backend server
cd "$(dirname "$0")/server"
PORT=$PORT npm run start

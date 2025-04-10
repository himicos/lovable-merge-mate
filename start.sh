#!/bin/bash

# Get the port from environment or default to 10000
PORT=${PORT:-10000}

# Build frontend
cd "$(dirname "$0")"
npm run build

# Start backend server
cd "$(dirname "$0")/server"
PORT=$PORT npm run start

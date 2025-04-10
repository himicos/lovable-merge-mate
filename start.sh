#!/bin/bash

# Get the port from environment or default to 10000
PORT=${PORT:-10000}

# Calculate frontend port (PORT + 1)
FRONTEND_PORT=$((PORT + 1))

# Start frontend preview
cd "$(dirname "$0")"
PORT=$FRONTEND_PORT npm run preview &

# Start backend server
cd "$(dirname "$0")/server"
PORT=$PORT npm run start

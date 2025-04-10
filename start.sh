#!/bin/bash
# Start frontend preview
cd "$(dirname "$0")"
npm run preview &

# Start backend server
cd "$(dirname "$0")/server"
npm run start

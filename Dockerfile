# Use an official Node.js runtime as a parent image
FROM node:20 AS build

# Set the working directory in the container
WORKDIR /

# Copy package.json and package-lock.json for root and workspaces (for cache optimization)
COPY package.json package-lock.json ./
COPY app/package.json ./app/
COPY api/package.json ./api/
COPY www/package.json ./www/

# Install dependencies for all workspaces
RUN npm install

# Copy the rest of the source code
COPY . .

# Build each workspace
# Assuming 'build' scripts are correctly defined in each workspace's package.json
# Based on previous logs: www uses 'next build', app uses 'vite build', api uses 'tsc'
RUN npm run build -w www
RUN npm run build -w app
RUN npm run build -w api

# Use a smaller base image for the final stage
FROM node:20-slim

# Set the working directory
WORKDIR /

# Install nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Copy built artifacts from the build stage
COPY --from=build /www/dist /www/dist
COPY --from=build /app/dist /app/dist # Assuming app builds to 'dist'
COPY --from=build /api/dist /api/dist

# Copy runtime dependencies and necessary config files
COPY --from=build /node_modules /node_modules
COPY --from=build /package.json /package.json
COPY --from=build /package-lock.json /package-lock.json
# We might need workspace package.jsons if start script relies on them? Let's omit for now.
# COPY --from=build /api/package.json /api/package.json

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose port (if your app listens on a specific port)
EXPOSE 10000

# Define the command to run your application
# start.sh likely runs nginx and starts the API from the /api directory
CMD ["sh", "/start.sh"]

# Optional: Set WORKDIR just before CMD if start.sh relies on it
# WORKDIR /api # Set WORKDIR to /api if 'npm start' inside start.sh needs it
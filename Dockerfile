# syntax=docker/dockerfile:1

# Base image with Node.js
FROM node:20 AS base
WORKDIR /

# Builder stage: Copy source, install dependencies, and build
FROM base AS builder
# Copy the entire source code first
COPY . .

# Install dependencies using the lock file
RUN npm install

# Build each workspace by changing directory
RUN cd www && npm run build
RUN cd app && npm run build
RUN cd api && npm run build

# Production image, copy build artifacts and necessary files
FROM node:20-slim AS runner
WORKDIR /

# Install nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Copy necessary files from the builder stage
COPY --from=builder /package.json /package.json
COPY --from=builder /package-lock.json /package-lock.json
# Ensure node_modules are copied for production dependencies if any are needed at runtime
# If only devDependencies were needed for build, this might be optimized
COPY --from=builder /node_modules /node_modules 

# Copy built applications
COPY --from=builder /www/dist /www/dist
COPY --from=builder /app/dist /app/dist
COPY --from=builder /api/dist /api/dist
# Copy the API's package.json needed to run 'npm start' correctly from /api
COPY --from=builder /api/package.json /api/package.json

# Copy Nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose port 10000
EXPOSE 10000

# Define the command to run your application
# start.sh likely runs nginx and starts the API from the /api directory
CMD ["sh", "/start.sh"]
# 1. Build all assets and install dependencies
FROM node:20 as build

WORKDIR /

COPY . .

RUN npm install
WORKDIR /www
RUN npm install
RUN npm run build

WORKDIR /app
RUN npm install
RUN npm run build

WORKDIR /api
RUN npm install
RUN npm run build

WORKDIR /
RUN ls -l /

# 2. Set up NGINX and Node server in the final image
FROM node:20 as runner

COPY --from=build /www /www
COPY --from=build /app /app
COPY --from=build /api /api
COPY --from=build /package.json /package.json
COPY --from=build /package-lock.json /package-lock.json

# Install NGINX
RUN apt-get update && apt-get install -y nginx

# Copy nginx config
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Expose HTTP port
EXPOSE 80

# Expose backend port (for internal health checks, optional)
EXPOSE 13337

# Start NGINX and Node backend
WORKDIR /api
CMD service nginx start && npm start
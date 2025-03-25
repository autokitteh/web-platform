# Build stage
FROM --platform=linux/amd64 node:21-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --ignore-scripts --include=dev

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build:prod

# Production stage
FROM --platform=linux/amd64 node:21-alpine AS production

# Set working directory
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Install only necessary dependencies
RUN npm install -g --only=production http-server

# Copy built assets from the build stage
COPY --from=build /app/dist ./dist

# Create config directory & default config.json in a single command
RUN mkdir -p /app/dist/config && echo '{"apiBaseUrl": "http://localhost:9980"}' > /app/dist/config/config.json

# Expose port
EXPOSE 80

# Set environment variable for runtime override
ENV VITE_HOST_URL=http://localhost:9980

# Create an entrypoint script
RUN printf '#!/bin/sh\nsed -i "s|http://localhost:9980|$VITE_HOST_URL|g" /app/dist/config/config.json\nexec http-server ./dist -p 80 --spa' > /app/entrypoint.sh \
    && chmod +x /app/entrypoint.sh

# Use the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]

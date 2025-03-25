# Stage 1: Build
FROM node:21.7.1-alpine AS builder

# Build arguments
ARG GITHUB_REPO=autokitteh/web-platform
ARG RELEASE_VERSION=latest
ARG VITE_HOST_URL=
ARG VITE_API_PROXY_PATH=
ARG VITE_DESCOPE_PROJECT_ID=
ARG USE_LOCAL_FILES=false
ARG BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
ARG VITE_ALLOWED_HOSTS

# Set as environment variables for the build stage
ENV GITHUB_REPO=${GITHUB_REPO} \
    RELEASE_VERSION=${RELEASE_VERSION} \
    VITE_HOST_URL=${VITE_HOST_URL} \
    VITE_API_PROXY_PATH=${VITE_API_PROXY_PATH} \
    VITE_DESCOPE_PROJECT_ID=${VITE_DESCOPE_PROJECT_ID} \
    USE_LOCAL_FILES=${USE_LOCAL_FILES} \
    NODE_ENV=production \
    HUSKY=0 \
    npm_config_update_notifier=false \
    PATH="/app/node_modules/.bin:${PATH}"

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    jq \
    unzip \
    git

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install -g npm@10.6.0 && \
    # Completely disable husky in Docker
    npm pkg delete scripts.prepare && \
    npm pkg delete scripts.postinstall && \
    # Disable all git hooks during install
    npm ci --ignore-scripts --include=dev

# Around line 37-49 (after the COPY . . line):

# Copy source files
COPY . .

# Build the application if using local files
RUN if [ "$USE_LOCAL_FILES" = "true" ]; then \
    npm run build; \
    else \
    # Create an empty dist directory to avoid COPY errors \
    mkdir -p /app/dist; \
fi

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine

# Pass build arguments to runtime stage
ARG GITHUB_REPO
ARG RELEASE_VERSION
ARG VITE_HOST_URL
ARG VITE_API_PROXY_PATH
ARG VITE_DESCOPE_PROJECT_ID
ARG USE_LOCAL_FILES
ARG BUILD_DATE
ARG VITE_ALLOWED_HOSTS="localhost"


# Add labels
LABEL org.opencontainers.image.title="AutoKitteh Web UI" \
      org.opencontainers.image.description="Web interface for AutoKitteh automation platform" \
      org.opencontainers.image.source="https://github.com/autokitteh/web-platform" \
      org.opencontainers.image.version="${RELEASE_VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}"

# Set runtime environment variables
ENV GITHUB_REPO=${GITHUB_REPO} \
    RELEASE_VERSION=${RELEASE_VERSION} \
    VITE_HOST_URL=${VITE_HOST_URL} \
    VITE_API_PROXY_PATH=${VITE_API_PROXY_PATH} \
    VITE_DESCOPE_PROJECT_ID=${VITE_DESCOPE_PROJECT_ID} \
    VITE_ALLOWED_HOSTS=${VITE_ALLOWED_HOSTS} \
    USE_LOCAL_FILES=${USE_LOCAL_FILES}
    

# Configure nginx and set proper permissions
COPY nginx.conf /etc/nginx/nginx.conf
RUN chmod 644 /etc/nginx/nginx.conf && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Copy build artifacts and entrypoint script
COPY --from=builder /app/dist /usr/share/nginx/html
# Use absolute path for the source file to ensure it's found
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && \
    # Verify the script exists
    ls -la /docker-entrypoint.sh

# Set up logging
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log
	

	RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Copy build artifacts and entrypoint script
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && \
    # Verify the script exists
    ls -la /docker-entrypoint.sh

RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/access.log /var/log/nginx/error.log && \
    chmod 644 /var/log/nginx/access.log /var/log/nginx/error.log && \
    chown -R nginx:nginx /var/log/nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

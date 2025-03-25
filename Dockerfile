# Stage 1: Build
FROM node:20-alpine AS builder

# Build arguments
ARG GITHUB_REPO=autokitteh/web-platform
ARG RELEASE_VERSION=latest
ARG VITE_HOST_URL
ARG VITE_API_PROXY_PATH
ARG VITE_DESCOPE_PROJECT_ID
ARG USE_LOCAL_FILES=false
ARG BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
ARG VITE_ALLOWED_HOSTS
ARG VITE_APP_DOMAIN
ARG VITE_LOCAL_SSL_CERT

# Set as environment variables for the build stage
ENV GITHUB_REPO=${GITHUB_REPO} \
    RELEASE_VERSION=${RELEASE_VERSION} \
    VITE_HOST_URL=${VITE_HOST_URL} \
    VITE_API_PROXY_PATH=${VITE_API_PROXY_PATH} \
    VITE_DESCOPE_PROJECT_ID=${VITE_DESCOPE_PROJECT_ID} \
    USE_LOCAL_FILES=${USE_LOCAL_FILES} \
    VITE_APP_DOMAIN=${VITE_APP_DOMAIN} \
    VITE_LOCAL_SSL_CERT=${VITE_LOCAL_SSL_CERT} \
    NODE_ENV=production \
    HUSKY=0 \
    npm_config_update_notifier=false \
    PATH="/app/node_modules/.bin:${PATH}"

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install -g npm@10.6.0 && \
    npm pkg delete scripts.prepare && \
    npm pkg delete scripts.postinstall && \
    npm ci --ignore-scripts --include=dev

# Copy source files
COPY . .

# Build the application if using local files
RUN if [ "$USE_LOCAL_FILES" = "true" ]; then \
    npm run build; \
    else \
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
ARG VITE_APP_DOMAIN
ARG VITE_LOCAL_SSL_CERT

# Install mkcert and its dependencies for local SSL
RUN apk add --no-cache --virtual build-deps \
    wget \
    go \
    git \
    gcc \
    musl-dev \
    && go install filippo.io/mkcert@latest \
    && mv /root/go/bin/mkcert /usr/local/bin/ \
    && apk add --no-cache nss-tools \
    && apk del build-deps \
    && mkdir -p /etc/nginx/ssl

# Configure nginx and set proper permissions
COPY nginx.conf /etc/nginx/nginx.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod 644 /etc/nginx/nginx.conf && \
    chmod +x /docker-entrypoint.sh && \
    mkdir -p /etc/nginx/ssl && \
    chown -R nginx:nginx /etc/nginx/ssl && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html/

# Set up logging
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
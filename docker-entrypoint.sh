#!/bin/sh
set -e

# Install required dependencies if they're missing
ensure_dependencies() {
  # Check if jq is installed
  if ! command -v jq >/dev/null 2>&1; then
    echo "Installing jq..."
    apk add --no-cache jq
  fi
}

# Make sure we have all dependencies needed
ensure_dependencies

# Function to download the latest release if no specific version
download_latest_release() {
  echo "Fetching latest release from GitHub repository: $GITHUB_REPO"
  LATEST_RELEASE_URL=$(curl -s "https://api.github.com/repos/$GITHUB_REPO/releases/latest" | jq -r '.assets[] | select(.name | endswith(".zip")) | .browser_download_url' | head -n 1)
  
  if [ -z "$LATEST_RELEASE_URL" ]; then
    echo "Error: Could not find latest release ZIP asset"
    exit 1
  fi
  
  echo "Downloading latest release from: $LATEST_RELEASE_URL"
  curl -L -o /tmp/release.zip "$LATEST_RELEASE_URL"
}


# Function to download a specific version
download_specific_release() {
  VERSION=$1
  echo "Fetching release $VERSION from GitHub repository: $GITHUB_REPO"
  
  # Find the specific release
  RELEASE_URL=$(curl -s "https://api.github.com/repos/$GITHUB_REPO/releases" | jq -r ".[] | select(.tag_name==\"v$VERSION\" or .tag_name==\"$VERSION\") | .assets[] | select(.name | endswith(\".zip\")) | .browser_download_url" | head -n 1)
  
  if [ -z "$RELEASE_URL" ]; then
    echo "Error: Could not find release $VERSION. Check if it exists and has a zip asset."
    exit 1
  fi
  
  echo "Downloading release $VERSION from: $RELEASE_URL"
  curl -L -o /tmp/release.zip "$RELEASE_URL"
}

# Function to create .env file
create_env_file() {
  echo "Creating .env file with provided environment variables"
  cat > .env << EOF
VITE_HOST_URL=${VITE_HOST_URL}
VITE_DESCOPE_PROJECT_ID=${VITE_DESCOPE_PROJECT_ID}
VITE_ALLOWED_HOSTS=${VITE_ALLOWED_HOSTS}
VITE_APP_DOMAIN=${VITE_APP_DOMAIN}
VITE_LOCAL_SSL_CERT=${VITE_LOCAL_SSL_CERT}
EOF
  echo "Environment variables set:"
  cat .env
}

# Function to build from local files
build_from_local() {
  echo "Building from local project files"
  
  # Check if source files exist
  if [ -d "/src" ] && [ "$(ls -A /src 2>/dev/null)" ]; then
    # Create directory structure if it doesn't exist
    mkdir -p /app
    
    # Copy source files to app directory
    echo "Copying source files to app directory"
    cp -r /src/* /app/
    
    # Create .env file with environment variables
    cd /app
    create_env_file
    
    # Install dependencies
    npm ci
    
    # Build the project
    echo "Building the project with VITE_HOST_URL=${VITE_HOST_URL} and VITE_DESCOPE_PROJECT_ID=${VITE_DESCOPE_PROJECT_ID}"
    VITE_HOST_URL=${VITE_HOST_URL} VITE_DESCOPE_PROJECT_ID=${VITE_DESCOPE_PROJECT_ID} npm run build
    
    # Move build output to proper location for nginx
    if [ -d "dist" ]; then
      cp -r dist/* /usr/share/nginx/html/
    fi
  else
    echo "No source files found in /src - assuming pre-built container"
    # Optional: create .env file directly in nginx html dir if needed
    # cd /usr/share/nginx/html
    # create_env_file
  fi
}

# Main process
echo "Starting AutoKitteh web platform setup"

# Check if we should use local files
if [ "$USE_LOCAL_FILES" = "true" ]; then
  build_from_local
# Check if we're using local files or downloading a release
elif [ -f "package.json" ] && [ "$RELEASE_VERSION" = "local" ]; then
  echo "Using local source code"
  
  # Create .env file with environment variables
  create_env_file
  
  # Install dependencies
  npm ci
  
  # Copy remaining source files if they exist
  if [ -d "/src" ]; then
    cp -r /src/* .
  fi
  
  # Check for git submodules and init them if present
  if [ -f ".gitmodules" ]; then
    echo "Initializing git submodules"
    apt-get update && apt-get install -y git
    git submodule update --init
  fi
  
  # Build the project
  echo "Building the project with VITE_HOST_URL=${VITE_HOST_URL} and VITE_DESCOPE_PROJECT_ID=${VITE_DESCOPE_PROJECT_ID}"
  VITE_HOST_URL=${VITE_HOST_URL} VITE_DESCOPE_PROJECT_ID=${VITE_DESCOPE_PROJECT_ID} npm run build
  
else
  # Download the appropriate release
  if [ "$RELEASE_VERSION" = "latest" ]; then
    download_latest_release
  else
    download_specific_release "$RELEASE_VERSION"
  fi
  
  # Extract the release
  echo "Extracting release archive"
  mkdir -p /tmp/release
  unzip -q /tmp/release.zip -d /tmp/release
  
  # Find and copy the dist directory - handle different archive structures
  if [ -d "/tmp/release/dist" ]; then
    cp -r /tmp/release/dist/* /usr/share/nginx/html/
  elif [ -d "/tmp/release/autokitteh-web/dist" ]; then
    cp -r /tmp/release/autokitteh-web/dist/* /usr/share/nginx/html/
  else
    # Try to find the dist directory recursively
    DIST_DIR=$(find /tmp/release -type d -name "dist" | head -n 1)
    if [ -n "$DIST_DIR" ]; then
      cp -r "$DIST_DIR"/* /usr/share/nginx/html/
    else
      echo "Error: Could not find dist directory in release archive"
      exit 1
    fi
  fi
  
  # Clean up
  rm -rf /tmp/release.zip /tmp/release
fi

# Process VITE_HOST_URL for Nginx
if [ -n "$VITE_HOST_URL" ]; then
    # Strip protocol and trailing slash from VITE_HOST_URL
    BACKEND_URL=$(echo "$VITE_HOST_URL" | sed -e 's|^https\?://||' -e 's|/$||')
    # Add port 443 for HTTPS if no port is specified
    if echo "$VITE_HOST_URL" | grep -q "^https://" && ! echo "$BACKEND_URL" | grep -q ":"; then
        BACKEND_URL="$BACKEND_URL:443"
    fi
    echo "Replacing BACKEND_URL_PLACEHOLDER with: $BACKEND_URL"
    sed -i "s|BACKEND_URL_PLACEHOLDER|$BACKEND_URL|g" /etc/nginx/nginx.conf
else
    echo "VITE_HOST_URL not set, using default backend: api.autokitteh.cloud:443"
    sed -i "s|BACKEND_URL_PLACEHOLDER|api.autokitteh.cloud:443|g" /etc/nginx/nginx.conf
fi

# Log the final config for debugging
echo "Final nginx.conf:"
cat /etc/nginx/nginx.conf

if [ -n "$VITE_HOST_URL" ]; then
    echo "Injecting VITE_HOST_URL into env.js"
    cat > /usr/share/nginx/html/env.js << EOF
window.__env__ = {
    VITE_HOST_URL: "$VITE_HOST_URL"
};
EOF
else
    echo "No VITE_HOST_URL provided, creating empty env.js"
    echo "window.__env__ = {};" > /usr/share/nginx/html/env.js
fi

# Continue with permissions and command execution
echo "Fixing permissions for nginx logs..."
mkdir -p /var/log/nginx
touch /var/log/nginx/access.log /var/log/nginx/error.log
chmod 666 /var/log/nginx/access.log /var/log/nginx/error.log
chown -R nginx:nginx /var/log/nginx


# Configure SSL based on VITE_LOCAL_SSL_CERT
if [ "$VITE_LOCAL_SSL_CERT" = "true" ]; then
    echo "Enabling SSL configuration..."
    
    # Generate certificates first
    echo "Generating SSL certificates..."
    mkdir -p /etc/nginx/ssl
    export CAROOT=/etc/nginx/ssl
    mkcert -install
    
    DOMAINS="localhost"
    if [ -n "$VITE_APP_DOMAIN" ]; then
        DOMAINS="$DOMAINS $VITE_APP_DOMAIN"
    fi
    
    # Generate and check certificates
    if mkcert -cert-file /etc/nginx/ssl/cert.pem -key-file /etc/nginx/ssl/key.pem $DOMAINS; then
        echo "SSL certificates generated successfully"
        # Only add SSL configuration if certificates exist
        if [ -f "/etc/nginx/ssl/cert.pem" ] && [ -f "/etc/nginx/ssl/key.pem" ]; then
            sed -i 's|SSL_CONFIG_PLACEHOLDER|listen 443 ssl;\n    ssl_certificate /etc/nginx/ssl/cert.pem;\n    ssl_certificate_key /etc/nginx/ssl/key.pem;|g' /etc/nginx/nginx.conf
            chmod 644 /etc/nginx/ssl/cert.pem /etc/nginx/ssl/key.pem
            chown nginx:nginx /etc/nginx/ssl/cert.pem /etc/nginx/ssl/key.pem
        else
            echo "Error: SSL certificates were not generated properly"
            sed -i 's|SSL_CONFIG_PLACEHOLDER||g' /etc/nginx/nginx.conf
        fi
    else
        echo "Error generating SSL certificates"
        sed -i 's|SSL_CONFIG_PLACEHOLDER||g' /etc/nginx/nginx.conf
    fi
else
    echo "SSL disabled, using HTTP only..."
    sed -i 's|SSL_CONFIG_PLACEHOLDER||g' /etc/nginx/nginx.conf
fi

# Add this before the "Starting application" line:
echo "Current nginx configuration:"
cat /etc/nginx/nginx.conf

# Execute the command
echo "Starting application with command: $@"
if [ "$1" = "nginx" ]; then
    # Install su-exec if needed
    apk add --no-cache su-exec
    
    # Execute nginx as the nginx user
    exec su-exec nginx "$@"
else
    # For other commands, run as is
    exec "$@"
fi
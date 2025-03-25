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

# Replace the Nginx configuration section with this:

echo "Configuring nginx proxy..."
# Configure the backend upstream
if [ -n "$VITE_HOST_URL" ]; then
    # Remove protocol and trailing slash for the backend server name
    BACKEND_SERVER=$(echo "$VITE_HOST_URL" | sed -e 's|^https\?://||' -e 's|/$||')
    # Replace the placeholder with the actual server
    sed -i "s|server backend_server;|server $BACKEND_SERVER;|g" /etc/nginx/nginx.conf
    echo "API host URL set to: $VITE_HOST_URL (server: $BACKEND_SERVER)"
else
    # Default to localhost if not set
    sed -i "s|server backend_server;|server localhost:9980;|g" /etc/nginx/nginx.conf
    echo "Using default API host URL: http://localhost:9980/"
fi

# Configure API proxy path
if [ -n "$VITE_API_PROXY_PATH" ]; then
    # Remove leading slash if present
    PROXY_PATH=${VITE_API_PROXY_PATH#/}
    # Replace placeholder in nginx.conf with actual proxy path
    sed -i "s|VITE_API_PROXY_PATH_PLACEHOLDER|$PROXY_PATH|g" /etc/nginx/nginx.conf
    echo "API proxy path set to: $VITE_API_PROXY_PATH"
else
    # If no custom proxy path, disable the second location block
    sed -i 's|location /VITE_API_PROXY_PATH_PLACEHOLDER/ {|location /_disabled_custom_proxy/ {|g' /etc/nginx/nginx.conf
    echo "Using default API proxy path: /api"
fi

echo "Fixing permissions for nginx logs..."
mkdir -p /var/log/nginx
touch /var/log/nginx/access.log /var/log/nginx/error.log
chmod 666 /var/log/nginx/access.log /var/log/nginx/error.log
chown -R nginx:nginx /var/log/nginx

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
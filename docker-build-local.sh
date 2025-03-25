#!/bin/bash
set -e

IMAGE_NAME="autokitteh-ui"
TAG="local"
VITE_HOST_URL=${VITE_HOST_URL:-""}
VITE_DESCOPE_PROJECT_ID=${VITE_DESCOPE_PROJECT_ID:-""}
VITE_APP_DOMAIN=${VITE_APP_DOMAIN:-"ak.local"}
VITE_LOCAL_SSL_CERT=${VITE_LOCAL_SSL_CERT:-"false"}
HTTP_PORT=${HTTP_PORT:-"80"}
HTTPS_PORT=${HTTPS_PORT:-"443"}

# Build the Docker image
docker build -t $IMAGE_NAME:$TAG \
    -f Dockerfile \
    --build-arg USE_LOCAL_FILES=true \
    --build-arg VITE_HOST_URL=$VITE_HOST_URL \
    --build-arg VITE_API_PROXY_PATH=$VITE_API_PROXY_PATH \
    --build-arg VITE_DESCOPE_PROJECT_ID=$VITE_DESCOPE_PROJECT_ID \
    --build-arg VITE_ALLOWED_HOSTS=$VITE_ALLOWED_HOSTS \
    --build-arg VITE_LOCAL_SSL_CERT=$VITE_LOCAL_SSL_CERT \
    --build-arg VITE_APP_DOMAIN=$VITE_APP_DOMAIN \
    .

# Set up port mapping and access URL based on SSL configuration
if [ "$VITE_LOCAL_SSL_CERT" = "true" ]; then
    PORT_MAPPING="-p $HTTP_PORT:80 -p $HTTPS_PORT:443"
    ACCESS_URL="https://$VITE_APP_DOMAIN"
else
    PORT_MAPPING="-p $HTTP_PORT:80"
    ACCESS_URL="http://$VITE_APP_DOMAIN"
fi

echo "Image built successfully!"
echo "Do you want to run the container now? (y/n)"
read -r run_now

if [[ $run_now == "y" || $run_now == "Y" ]]; then
    echo "Running container with ports mapped..."
    sudo docker run $PORT_MAPPING \
        -e VITE_HOST_URL=$VITE_HOST_URL \
        -e VITE_API_PROXY_PATH=$VITE_API_PROXY_PATH \
        -e VITE_APP_DOMAIN=$VITE_APP_DOMAIN \
        -e VITE_ALLOWED_HOSTS=$VITE_ALLOWED_HOSTS \
        -e VITE_LOCAL_SSL_CERT=$VITE_LOCAL_SSL_CERT \
        $IMAGE_NAME:$TAG
    echo "Container started! Access the UI at $ACCESS_URL"
else
    echo "Container not started. You can run it later with:"
    echo "sudo docker run $PORT_MAPPING \\"
    echo "  -e VITE_HOST_URL=$VITE_HOST_URL \\"
    echo "  -e VITE_APP_DOMAIN=$VITE_APP_DOMAIN \\"
    echo "  -e VITE_ALLOWED_HOSTS=$VITE_ALLOWED_HOSTS \\"
    echo "  -e VITE_LOCAL_SSL_CERT=$VITE_LOCAL_SSL_CERT \\"
    echo "  $IMAGE_NAME:$TAG"
    echo "Then access the UI at $ACCESS_URL"
fi
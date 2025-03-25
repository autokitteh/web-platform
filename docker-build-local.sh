#!/bin/bash
set -e

IMAGE_NAME="autokitteh-ui"
TAG="local"
VITE_HOST_URL=${VITE_HOST_URL:-"http://localhost:9980/"}
VITE_DESCOPE_PROJECT_ID=${VITE_DESCOPE_PROJECT_ID:-"DESCOPE_ID"}
PORT=${PORT:-"8000"}

echo "Building Docker image from local files: $IMAGE_NAME:$TAG"

docker build -t $IMAGE_NAME:$TAG \
    -f Dockerfile \
    --build-arg USE_LOCAL_FILES=true \
    --build-arg VITE_HOST_URL=$VITE_HOST_URL \
    --build-arg VITE_API_PROXY_PATH=$VITE_API_PROXY_PATH \
    --build-arg VITE_DESCOPE_PROJECT_ID=$VITE_DESCOPE_PROJECT_ID \
    .

echo "Image built successfully!"
echo "To run the image: docker run -p $PORT:80 $IMAGE_NAME:$TAG"
echo ""
echo "Do you want to run the container now? (y/n)"
read -r run_now

if [[ $run_now == "y" || $run_now == "Y" ]]; then
    echo "Running container on port $PORT..."
    docker run -p $PORT:80 $IMAGE_NAME:$TAG
    echo "Container started! Access the UI at http://localhost:$PORT"
else
    echo "Container not started. You can run it later with: docker run -p $PORT:80 $IMAGE_NAME:$TAG"
fi
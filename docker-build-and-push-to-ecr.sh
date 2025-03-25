#!/bin/bash
set -e

# Default values
DEFAULT_ECR_URI="public.ecr.aws/autokitteh/ui"
DEFAULT_TAG="latest"
VITE_HOST_URL=${VITE_HOST_URL:-"http://localhost:9980/"}
VITE_DESCOPE_PROJECT_ID=${VITE_DESCOPE_PROJECT_ID:-"DESCOPE_ID"}
USE_LOCAL_FILES=${USE_LOCAL_FILES:-"true"}  # Default to building from local files

# Parse arguments
# First argument is version or ECR URI
if [[ $1 == *"/"* ]]; then
    # If the first argument contains a slash, treat it as the ECR URI
    ECR_URI=$1
    VERSION=${2:-$DEFAULT_TAG}
else
    # Otherwise, use the default ECR URI and treat the first argument as the version
    ECR_URI=$DEFAULT_ECR_URI
    VERSION=${1:-$DEFAULT_TAG}
fi

# Extract the ECR registry domain from the URI for login
ECR_REGISTRY=$(echo $ECR_URI | cut -d'/' -f1-2)

echo "Using ECR URI: $ECR_URI"
echo "Using version tag: $VERSION"

# Common build arguments
BUILD_ARGS="--build-arg VITE_HOST_URL=$VITE_HOST_URL 
           --build-arg VITE_API_PROXY_PATH=$VITE_API_PROXY_PATH 
           --build-arg VITE_DESCOPE_PROJECT_ID=$VITE_DESCOPE_PROJECT_ID"

if [ "$USE_LOCAL_FILES" = "true" ]; then
    BUILD_ARGS="$BUILD_ARGS --build-arg USE_LOCAL_FILES=true"
    echo "Building from local files"
else
    echo "Building image to download release at runtime"
fi

if [ "$VERSION" != "latest" ]; then
    echo "Building image for specific release version: $VERSION"
    docker build -t $ECR_URI:$VERSION \
        --build-arg RELEASE_VERSION=$VERSION \
        $BUILD_ARGS .
    IMAGE_TAG=$VERSION
else
    echo "Building image for latest release"
    docker build -t $ECR_URI:$DEFAULT_TAG \
        $BUILD_ARGS .
    IMAGE_TAG=$DEFAULT_TAG
fi

# Log in to the public ECR
echo "Logging in to ECR: $ECR_REGISTRY"
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY

# Push the Docker image to ECR
echo "Pushing image to ECR: $ECR_URI:$IMAGE_TAG"
docker push $ECR_URI:$IMAGE_TAG 

echo "Successfully built and pushed image $ECR_URI:$IMAGE_TAG"
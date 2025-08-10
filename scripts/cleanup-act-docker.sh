#!/bin/bash

# cleanup-act-docker.sh
# Script to clean up Docker containers and networks created by "act" tool
# when running GitHub Actions workflows locally

set -e

echo "🧹 Cleaning up Docker resources created by 'act'..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Stop and remove containers with common act patterns
echo "🛑 Stopping and removing act containers..."

# Patterns for containers created by the setup-test-env action
CONTAINER_PATTERNS=(
    "postgres-db-*"
    "temporal-dev-*"
    "autokitteh-ee-*"
    "act-*"
)

for pattern in "${CONTAINER_PATTERNS[@]}"; do
    containers=$(docker ps -aq --filter "name=${pattern}" 2>/dev/null || true)
    if [ -n "$containers" ]; then
        print_status $YELLOW "Found containers matching pattern: ${pattern}"
        echo "$containers" | xargs docker rm -f 2>/dev/null || true
        print_status $GREEN "✅ Removed containers matching: ${pattern}"
    fi
done

# Remove networks with temporal-net pattern (created by setup-test-env)
echo "🌐 Cleaning up networks..."
networks=$(docker network ls --filter "name=temporal-net-*" -q 2>/dev/null || true)
if [ -n "$networks" ]; then
    print_status $YELLOW "Found temporal networks to remove"
    echo "$networks" | xargs docker network rm 2>/dev/null || true
    print_status $GREEN "✅ Removed temporal networks"
fi

# Remove act-specific networks
act_networks=$(docker network ls --filter "name=act_*" -q 2>/dev/null || true)
if [ -n "$act_networks" ]; then
    print_status $YELLOW "Found act networks to remove"
    echo "$act_networks" | xargs docker network rm 2>/dev/null || true
    print_status $GREEN "✅ Removed act networks"
fi

# Clean up volumes (be careful with this - only remove act-specific ones)
echo "📦 Cleaning up volumes..."
volumes=$(docker volume ls --filter "name=act_*" -q 2>/dev/null || true)
if [ -n "$volumes" ]; then
    print_status $YELLOW "Found act volumes to remove"
    echo "$volumes" | xargs docker volume rm 2>/dev/null || true
    print_status $GREEN "✅ Removed act volumes"
fi

# Remove dangling images created during act runs (optional - be careful)
echo "🖼️  Cleaning up dangling images..."
dangling_images=$(docker images -f "dangling=true" -q 2>/dev/null || true)
if [ -n "$dangling_images" ]; then
    print_status $YELLOW "Found dangling images to remove"
    echo "$dangling_images" | xargs docker rmi 2>/dev/null || true
    print_status $GREEN "✅ Removed dangling images"
fi

# Prune unused Docker resources
echo "🔄 Running Docker system prune..."
docker system prune -f --volumes 2>/dev/null || true

# Show current Docker resource usage
echo ""
print_status $GREEN "📊 Current Docker resource status:"
echo "Containers:"
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" 2>/dev/null || true
echo ""
echo "Networks:"
docker network ls --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}" 2>/dev/null || true
echo ""
echo "Volumes:"
docker volume ls --format "table {{.Name}}\t{{.Driver}}" 2>/dev/null || true

print_status $GREEN "✅ Docker cleanup completed!"
print_status $YELLOW "💡 Tip: Run 'docker system df' to see disk usage"
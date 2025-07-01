#!/bin/bash

echo "Stopping all containers..."
docker stop $(docker ps -aq) 2>/dev/null

echo "Removing all containers..."
docker rm -f $(docker ps -aq) 2>/dev/null

echo "Removing all images..."
docker rmi -f $(docker images -q) 2>/dev/null

echo "Removing all volumes..."
docker volume rm -f $(docker volume ls -q) 2>/dev/null

echo "Removing all user-defined networks..."
docker network rm $(docker network ls | grep -v "bridge\|host\|none" | awk '{print $1}') 2>/dev/null

echo "Docker system prune (just in case)..."
docker system prune -a --volumes -f

echo "All done!"

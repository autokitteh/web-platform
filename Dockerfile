# Build stage
FROM node:21-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --include=dev
COPY . .
ENV NODE_ENV=production
RUN npm run build:prod
RUN ls -l /app/dist && cat /app/dist/index.html

# Production stage
FROM nginx:alpine AS production
WORKDIR /app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx template (not the final config)
COPY nginx.conf.template /app/nginx.conf.template

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

# Make entrypoint executable
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/app/docker-entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
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
COPY entrypoint.sh /app/entrypoint.sh

# Inject script tag for config.js
RUN sed -i '/<head>/ s|<head>|<head>\n    <script src="/config.js"></script>|' /usr/share/nginx/html/index.html && \
    cat /usr/share/nginx/html/index.html # Debug sed output

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/app/entrypoint.sh"]
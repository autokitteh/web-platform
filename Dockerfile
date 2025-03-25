# Build stage
FROM --platform=linux/amd64 node:21-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --include=dev
COPY . .
RUN npm run build:prod
RUN ls -l /app/dist && cat /app/dist/index.html # Debug build output

# Production stage
FROM --platform=linux/amd64 node:21-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g --only=production http-server
COPY --from=build /app/dist ./dist
# Inject script tag
RUN sed -i '/<head>/ s|<head>|<head>\n    <script src="/config.js"></script>|' /app/dist/index.html && \
    cat /app/dist/index.html # Debug sed output
# Create entrypoint script to inject config.js at runtime
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'if [ -z "$VITE_HOST_URL" ]; then' >> /app/entrypoint.sh && \
    echo '    echo "window.appConfig = { apiBaseUrl: \"\" };" > /app/dist/config.js' >> /app/entrypoint.sh && \
    echo 'else' >> /app/entrypoint.sh && \
    echo '    echo "window.appConfig = { apiBaseUrl: \"$VITE_HOST_URL\" };" > /app/dist/config.js' >> /app/entrypoint.sh && \
    echo 'fi' >> /app/entrypoint.sh && \
    echo 'cat /app/dist/config.js' >> /app/entrypoint.sh && \
    echo 'exec http-server ./dist -p 80 --spa' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/app/entrypoint.sh"]
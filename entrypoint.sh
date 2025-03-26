#!/bin/sh

if [ -z "$VITE_HOST_URL" ]; then
    echo "window.appConfig = { apiBaseUrl: \"\", proxy: false };" > /usr/share/nginx/html/config.js
else
    echo "window.appConfig = { apiBaseUrl: \"$VITE_HOST_URL\", proxy: \"$PROXY\" };" > /usr/share/nginx/html/config.js
fi

cat /usr/share/nginx/html/config.js

# Substitute environment variables into nginx.conf.template and output to default.conf
envsubst '${VITE_HOST_URL}' < /app/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Start Nginx
nginx -g "daemon off;"
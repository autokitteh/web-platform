#!/bin/sh

if [ -n "$VITE_HOST_URL" ]; then
    echo "window.appConfig = { apiBaseUrl: \"$VITE_HOST_URL\" };" > /usr/share/nginx/html/config.js
elif [ -n "$REROUTE_API" ]; then
    echo "window.appConfig = { rerouteApi: \"$REROUTE_API\" };" > /usr/share/nginx/html/config.js
else
    echo "window.appConfig = {};" > /usr/share/nginx/html/config.js
fi

cat /usr/share/nginx/html/config.js

envsubst '${VITE_HOST_URL}' < /app/nginx.conf.template > /etc/nginx/conf.d/default.conf

nginx -g "daemon off;"
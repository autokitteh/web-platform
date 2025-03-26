#!/bin/sh
if [ -n "$REROUTE_API" ] && [ -n "$VITE_HOST_URL" ]; then
    if [ -z "$VITE_HOST_URL" ]; then
        echo "Error: REROUTE_API is set but VITE_HOST_URL is missing."
        echo "VITE_HOST_URL must be provided when REROUTE_API is enabled."
        exit 1
    fi
    if [ "${VITE_HOST_URL: -1}" != "/" ]; then
        echo "Error: VITE_HOST_URL must end with a trailing slash (/)."
        echo "Current value: $VITE_HOST_URL"
        exit 1
    fi
    
    echo "Adding API routing configuration for $VITE_HOST_URL"
    
    sed -i 's|BACKEND_API|location /api/ {\n\t\tproxy_pass '"${VITE_HOST_URL}"';\n\t\tproxy_set_header Host $host;\n\t\tproxy_set_header X-Real-IP $remote_addr;\n\t\tproxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\t}|' /app/nginx.conf.template
    cp /app/nginx.conf.template /etc/nginx/conf.d/default.conf
    
    echo "window.appConfig = { rerouteApi: \"$REROUTE_API\", apiBaseUrl: \"$VITE_HOST_URL\" };" > /usr/share/nginx/html/config.js
elif [ -n "$VITE_HOST_URL" ]; then
    sed -i 's|BACKEND_API||' /app/nginx.conf.template
    cp /app/nginx.conf.template /etc/nginx/conf.d/default.conf
    echo "window.appConfig = { apiBaseUrl: \"$VITE_HOST_URL\" };" > /usr/share/nginx/html/config.js
else
    sed -i 's|BACKEND_API||' /app/nginx.conf.template
    cp /app/nginx.conf.template /etc/nginx/conf.d/default.conf
    echo "window.appConfig = {};" > /usr/share/nginx/html/config.js
fi

echo "Generated nginx configuration:"
cat /etc/nginx/conf.d/default.conf

nginx -g "daemon off;"
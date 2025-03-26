#!/bin/sh

# Patching index.html
API_URL=${API_URL:-"/api"}
sed -i 's|appBaseUrl=""|appBaseUrl="'"$API_URL"'"|' /usr/share/nginx/html/index.html
echo "Added appBaseUrl="$API_URL" configuration for react app"

# Patchng NGINX
if [ -n "$NGNIX_PROXY_API_URL" ]; then
    if [ "${NGNIX_PROXY_API_URL: -1}" != "/" ]; then
        NGNIX_PROXY_API_URL="${NGNIX_PROXY_API_URL}/"
        echo "Added trailing slash to NGNIX_PROXY_API_URL: $NGNIX_PROXY_API_URL"
    fi

    sed -i 's|https://api.autokitteh.cloud|'"${NGNIX_PROXY_API_URL}"'|' /app/nginx.conf.template
    echo "Added NGINX API routing configuration for $NGNIX_PROXY_API_URL"
fi

cp /app/nginx.conf.template /etc/nginx/conf.d/default.conf

exec "$@"

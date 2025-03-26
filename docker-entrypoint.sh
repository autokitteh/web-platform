#!/bin/sh
cp /app/nginx.conf.template /etc/nginx/conf.d/default.conf

if [ -n "$NGNIX_PROXY_API_URL" ]; then
    if [ -z "$API_URL" ]; then
        echo "Error: NGNIX_PROXY_API_URL is set but API_URL is missing."
        echo "API_URL must be provided when NGNIX_PROXY_API_URL is enabled."
        exit 1
    fi
    if [ "${API_URL: -1}" != "/" ]; then
        API_URL="${API_URL}/"
        echo "Adding trailing slash to API_URL: $API_URL"
    fi

    echo "Adding NGINX API routing configuration for $API_URL"
    sed -i 's|api.autokitteh.cloud|'${API_URL}'|' /app/nginx.conf.template > /etc/nginx/conf.d/default.conf

    echo "Adding appBaseUrl=/api configuration for react app"
    sed -i 's/appBaseUrl = ""/appBaseUrl = "'/api'"/' /usr/share/nginx/html/index.html
elif [ -n "$API_URL" ]; then
    echo "Adding appBaseUrl=/api configuration for react app"
    sed -i 's/appBaseUrl = ""/appBaseUrl = "'"$API_URL"'"/' /usr/share/nginx/html/index.html
fi


echo "Generated nginx configuration:"
cat /etc/nginx/conf.d/default.conf

exec "$@"
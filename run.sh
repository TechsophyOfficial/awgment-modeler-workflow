#!/bin/sh
set -xe
# WEB_ROOT=/usr/share/nginx/html

mkdir $WEB_ROOT/model/process/ || true

rm -rf nginx.conf || true
cat >> nginx.conf << EOF
server {
  listen 80;
  root $WEB_ROOT;
  server_name $HOSTNAME;

  location / {
        try_files \$uri \$uri/ /index.html;
        add_header   Cache-Control public;
        expires      1d;
  }

  location ~ ^/model/process/((?!(static|(.*\..*))).)+$ {
    try_files /model/process/index.html =404;
  }
}
EOF

./env2Json.sh > $WEB_ROOT/model/process/config.json

nginx -c nginx.conf  -g "daemon off;"

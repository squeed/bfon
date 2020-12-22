#!/bin/bash
set -euo pipefail

mkdir -p bfon-data bfon-data/caddy_data bfon-data/caddy_config bfon-data/db

podman pod kill bfon || true
podman pod rm bfon || true


podman pod create --name bfon -p 8080:80

podman run --pod bfon \
    -d  \
    -v "$(pwd)"/bfon-data/caddy_data:/data:rw \
    -v "$(pwd)"/bfon-data/caddy_config:/config:rw \
    --name=bfon-web \
    quay.io/cdc/bfon:latest \
    /usr/bin/caddy run --config /etc/caddy/Caddyfile --adapter caddyfile

podman run --pod bfon \
    -v "$(pwd)"/bfon-data/db:/db:rw \
    --name=bfon-server \
    quay.io/cdc/bfon:latest \
    /usr/bin/bfon-server \
    -db /db/db.sqlite

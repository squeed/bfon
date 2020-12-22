#!/bin/bash
set -euo pipefail

mkdir -p bfon-data bfon-data/caddy_data bfon-data/caddy_config bfon-data/db

podman pod kill bfon || true
podman pod rm bfon || true

TAG="${TAG:-latest}"
IMAGE=gcr.io/berlin-is-so-grey/bfon:"$TAG"

podman pod create --name bfon -p 80:80 -p 443:443

podman run --pod bfon \
    -d  \
    -v "$(pwd)"/bfon-data/caddy_data:/data:rw \
    -v "$(pwd)"/bfon-data/caddy_config:/config:rw \
    --name=bfon-web \
    "$IMAGE" \
    /usr/bin/caddy run --config /etc/caddy/Caddyfile --adapter caddyfile

podman run --pod bfon \
    -v "$(pwd)"/bfon-data/db:/db:rw \
    --name=bfon-server \
    "$IMAGE" \
    /usr/bin/bfon-server \
    -db /db/db.sqlite

#!/bin/bash
set -euo pipefail

mkdir -p /var/bfon-data /var/bfon-data/caddy_data /var/bfon-data/caddy_config /var/bfon-data/db
chmod -R go+rwx /var/bfon-data

TAG="${TAG:-latest}"
IMAGE=gcr.io/berlin-is-so-grey/bfon:"$TAG"

podman pull "$IMAGE"

podman pod stop bfon || true
podman pod rm bfon || true

echo "Stopped old process..."

podman pod create --name bfon -p 80:80 -p 443:443 -p 127.0.0.1:5000:5000 -p 127.0.0.1:2019:2019

podman run --pod bfon \
    -d  \
	--userns=host \
    -v /var/bfon-data/caddy_data:/data:Z \
    -v /var/bfon-data/caddy_config:/config:Z \
    --name=bfon-web \
    "$IMAGE" \
    /usr/bin/caddy run --config /etc/caddy/Caddyfile --adapter caddyfile

podman run --pod bfon \
	-d \
	--userns=host \
    -v /var/bfon-data/db:/db:Z \
    --name=bfon-server \
    "$IMAGE" \
    /usr/bin/bfon-server \
    -db /db/db.sqlite

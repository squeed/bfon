#!/bin/bash
set -euo pipefail

mkdir -p /var/bfon-data /var/bfon-data/caddy_data /var/bfon-data/caddy_config /var/bfon-data/db
chmod -R go+rwx /var/bfon-data

podman pod kill bfon || true
podman pod rm bfon || true

TAG="${TAG:-latest}"
IMAGE=gcr.io/berlin-is-so-grey/bfon:"$TAG"

podman pod create --name bfon -p 80:80 -p 443:443

podman run --pod bfon \
    -d  \
	--userns=host \
    -v /var/bfon-data/caddy_data:/data:rw \
    -v /var/bfon-data/caddy_config:/config:rw \
    --name=bfon-web \
    "$IMAGE" \
    /usr/bin/caddy run --config /etc/caddy/Caddyfile --adapter caddyfile

podman run --pod bfon \
	-d \
	--userns=host \
    -v /var/bfon-data/db:/db:rw \
    --name=bfon-server \
    "$IMAGE" \
    /usr/bin/bfon-server \
    -db /db/db.sqlite

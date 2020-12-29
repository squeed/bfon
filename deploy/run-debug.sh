#!/bin/bash
set -euo pipefail

mkdir -p bfon-data bfon-data/caddy_data bfon-data/caddy_config bfon-data/db

podman pod kill bfon || true
podman pod rm bfon || true

TAG="${TAG:-latest}"
IMAGE=gcr.io/berlin-is-so-grey/bfon:"$TAG"

podman pod create --name bfon -p 8080:80

podman run --pod bfon \
    -d  \
	--userns=host \
    -v "$(pwd)"/bfon-data/caddy_data:/data:Z \
    -v "$(pwd)"/bfon-data/caddy_config:/config:Z \
    --name=bfon-web \
    "$IMAGE" \
    /usr/bin/caddy run --config /etc/caddy/Caddyfile --adapter caddyfile

podman run --pod bfon \
	-d \
	--userns=host \
    -v "$(pwd)"/bfon-data/db:/db:Z \
    --name=bfon-server \
    "$IMAGE" \
    /usr/bin/bfon-server \
    -db /db/db.sqlite

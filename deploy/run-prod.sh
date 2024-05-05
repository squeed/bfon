#!/bin/bash
set -euo pipefail

mkdir -p /var/bfon-data /var/bfon-data/caddy_data /var/bfon-data/caddy_config /var/bfon-data/db
chmod -R go+rwx /var/bfon-data

if [[ -z "${TAG}" ]]; then
    echo "missing TAG"
    exit 1
fi

IMAGE=ghcr.io/squeed/bfon

podman login --verbose ghcr.io -u squeed --password-stdin < /var/local/ghcr.token
podman pull "$IMAGE:$TAG"

podman tag "$IMAGE:$TAG" "$IMAGE:_prod"
systemctl restart pod-bfon

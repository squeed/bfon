#!/bin/bash
set -euo pipefail

mkdir -p /var/bfon-data /var/bfon-data/caddy_data /var/bfon-data/caddy_config /var/bfon-data/db
chmod -R go+rwx /var/bfon-data

if [[ -z "${TAG}" ]]; then
    echo "missing TAG"
    exit 1
fi

IMAGE=gcr.io/berlin-is-so-grey/bfon

podman login -u _json_key --password-stdin https://gcr.io < /var/local/pull-secret.json
podman pull "$IMAGE:$TAG"

podman tag "$IMAGE:$TAG" "$IMAGE:_prod"
systemctl restart pod-bfon

#!/bin/bash

set -euo pipefail

repo="$(dirname "$0")"/..
cd "$repo"
repo="$(pwd)"

rm -rf output && mkdir output

TAG="${TAG:-$(git describe --match eom --always --dirty)}"
IMAGE=ghcr.io/squeed/bfon:"$TAG"

cd "$repo/server"
echo "building server"
go build -o "$repo/output/bfon-server" ./cmd

cd "$repo/web"
echo "building web"
npm install

REACT_APP_SERVER_URL="${REACT_APP_SERVER_URL:-wss://bfon.club/ws}" npm run build


mv "$repo/web/build" "$repo/output/webroot"

echo "$TAG" > "$repo/output/webroot/version.txt"


cd "$repo"
docker build -t "$IMAGE" -f deploy/Dockerfile .

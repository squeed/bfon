#!/bin/bash

set -euo pipefail

repo="$(dirname "$0")"/..
cd "$repo"
repo="$(pwd)"

rm -rf output && mkdir output

TAG="${TAG:-latest}"
IMAGE=gcr.io/berlin-is-so-grey/bfon:"$TAG"

cd "$repo/server"
echo "building server"
go build -o "$repo/output/bfon-server" ./cmd

cd "$repo/web"
echo "building web"
#npm install
REACT_APP_SERVER_URL="wss://bfon.club/ws" npm run build


mv "$repo/web/build" "$repo/output/webroot"


cd "$repo"
docker build -t "$IMAGE" -f deploy/Dockerfile .

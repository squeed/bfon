#!/bin/bash

set -euo pipefail

repo="$(dirname "$0")"/..
cd "$repo"
repo="$(pwd)"

rm -rf output && mkdir output

cd "$repo/server"
echo "building server"
go build -o "$repo/output/bfon-server" ./cmd

cd "$repo/web"
echo "building web"
#npm install
REACT_APP_SERVER_URL="ws://bfon.club:8080/ws" npm run build

mv "$repo/web/build" "$repo/output/webroot"


cd "$repo"
docker build -t quay.io/cdc/bfon -f deploy/Dockerfile .

#!/bin/bash
set -e

REMOTE_USER="adam"
REMOTE_HOST="192.168.1.125"
REMOTE_PATH="Apps/price-checker/"
IMAGE_NAME="price-checker"

docker build --platform linux/amd64 -t $IMAGE_NAME:latest .
docker save -o $IMAGE_NAME.tar $IMAGE_NAME:latest
scp ./$IMAGE_NAME.tar $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH
ssh -l $REMOTE_USER $REMOTE_HOST "source ~/.bashrc && docker load -i $REMOTE_PATH/$IMAGE_NAME.tar && cd $REMOTE_PATH && git pull origin main --force && docker-compose down && docker-compose up -d --no-build"


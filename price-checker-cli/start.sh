REMOTE_USER="adam"
REMOTE_HOST="192.168.1.125"
REMOTE_PATH="Apps/price-checker/"
IMAGE_NAME="price-checker"

ssh -l $REMOTE_USER $REMOTE_HOST "source ~/.bashrc && cd $REMOTE_PATH && docker-compose down && docker-compose up -d --no-build"

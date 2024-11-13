#!/bin/bash -ex

redis_conf_path="/etc/redis/redis.conf"
src_dir=$(pwd)/redis

echo "Setup Redis"
echo "------------------------------------"

sudo apt-get install -y redis-server

# redis config
rsync -av $src_dir/redis.conf "${redis_conf_path}"

sudo service redis-server start
redis-server -v
echo "------------------------------------"
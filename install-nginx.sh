#!/bin/bash -ex

# Set the source and destination directories using absolute paths.
# This makes the script more robust and less dependent on the current working directory.
# src_dir="$HOME/nginx"  # Replace $HOME/nginx with the actual absolute path to your nginx directory if it's different

src_dir=$(pwd)/nginx

dest_dir="/etc/nginx"
log_dir="/var/log/nginx"

# Check if the source directory exists.
if [ ! -d "$src_dir" ]; then
    echo "Error: Source directory '$src_dir' not found."
    exit 1
fi

# load environment variables
if [[ -f .env ]]; then
    source .env
fi

# fixed enviroment variables
DEBIAN_FRONTEND=noninteractive

# install NGINX
apt install -y nginx

# Use 'rsync' for more robust copying, preserving permissions and timestamps.
# The '-a' flag stands for archive mode.  It also handles the case where the destination directories don't exist.
# The '-v' flag is for verbose output, showing what's being copied.

rsync -av "$src_dir/sites-enabled/" "$dest_dir/"
rsync -av "$src_dir/nginx.conf" "$dest_dir/"
rsync -av "$src_dir/ssl/" "$dest_dir/"
rsync -av "$src_dir/logs/" "$log_dir/"

systemctl enable nginx
systemctl start nginx

# firewall
ufw allow http
ufw allow https

# www dir
mkdir -p /var/www/html
chown -R $SSHUSER:www-data /var/www
chmod 2775 /var/www

# forked from https://github.com/oanhnn/example-setup-vps-scripts
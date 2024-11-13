#!/bin/bash -ex

# load environment variables
if [[ -f .env ]]; then
 source .env
fi

# fixed enviroment variables
DEBIAN_FRONTEND=noninteractive

# install NGINX
apt install -y nginx

systemctl enable nginx
systemctl start nginx

# move nginx config
mv ./nginx/sites-enabled /etc/nginx/sites-enabled
mv ./nginx/nginx.conf /etc/nginx/nginx.conf
mv ./nginx/logs /var/log/nginx
mv ./nginx/ssl /etc/nginx/ssl

# firewall
ufw allow http
ufw allow https

# www dir
mkdir -p /var/www/html
chown -R $SSHUSER:www-data /var/www
chmod 2775 /var/www

# forked from https://github.com/oanhnn/example-setup-vps-scripts
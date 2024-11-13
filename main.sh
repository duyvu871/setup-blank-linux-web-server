#!/bin/bash -ex

# load environment variables
if [[ -f .env ]]; then
 source .env
fi

# fixed enviroment variables

# set to noninteractive mode
DEBIAN_FRONTEND=noninteractive
# set hostname
VPS_HOSTNAME=${VPS_HOSTNAME:-"example-svr"}
# set timezone
VPS_TIMEZONE=${VPS_TIMEZONE:-"UTC"}
# set ssh from ip
SSH_FROM_IP=${SSH_FROM_IP:-"any"}

# set hostname
hostnamectl set-hostname $VPS_HOSTNAME

# set locale
localectl set-locale LANG=en_US.UTF-8 LANGUAGE="en_US:en"

# set timezone
timedatectl set-timezone $VPS_TIMEZONE

# update
apt update -y
apt upgrade -y
# apt autoremove -y # remove unused packages
apt install -y net-tools apt-transport-https git wget curl gcc g++ gnupg-agent make ca-certificates software-properties-common

# firewall
# default deny incoming
ufw default deny incoming 
# default allow outgoing
ufw default allow outgoing
# # only allow ssh from some IPs
ufw allow from $SSH_FROM_IP to any port 22 proto tcp
ufw enable # enable firewall

# allow http and https
ufw allow 80/tcp
ufw allow 443/tcp

# forked from https://github.com/oanhnn/example-setup-vps-scripts
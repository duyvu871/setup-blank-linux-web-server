#!/bin/bash -ex

function setupMongoDB()
{
	echo "install MongoDB"
	echo "------------------------------------"

	sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
	echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
	sudo apt-get update -y
	sudo apt-get install -y mongodb-10gen
	sudo apt-get install -y mongodb-10gen=2.4.6
	echo "mongodb-10gen hold" | sudo dpkg --set-selections
	sudo service mongodb start
	mongod --version
	echo "------------------------------------"
	return $?
}

setupMongoDB

sudo mv ./mongo/conf.yml /etc/mongodb.conf

# mongodb settings
# https://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/
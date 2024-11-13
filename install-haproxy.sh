function setupHaproxy()
{
	echo "Setup haproxy"
	echo "------------------------------------"

	sudo apt-get install -y haproxy

	sudo mv ./haproxy/haproxy.cfg /etc/haproxy/haproxy.cfg

	sudo echo "ENABLED=1" > /etc/default/haproxy
	sudo service haproxy start
	haproxy -v
	echo "------------------------------------"
	return $?
}

setupHaproxy


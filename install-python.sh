#! /bin/bash -ex

echo "Update apt"
sudo apt-get update
sudo apt-get install \
    curl \
    gcc \
    libbz2-dev \
    libev-dev \
    libffi-dev \
    libgdbm-dev \
    liblzma-dev \
    libncurses-dev \
    libreadline-dev \
    libsqlite3-dev \
    libssl-dev \
    make \
    tk-dev \
    wget \
    zlib1g-dev

export PYTHON_VERSION=3.12.4
export PYTHON_MAJOR=3

echo "Download Python ${PYTHON_VERSION}"    
curl -O https://www.python.org/ftp/python/${PYTHON_VERSION}/Python-${PYTHON_VERSION}.tgz
tar -xvzf Python-${PYTHON_VERSION}.tgz
cd Python-${PYTHON_VERSION}

echo "Configure Python ${PYTHON_VERSION}"
./configure \
    --prefix=/opt/python/${PYTHON_VERSION} \
    --enable-shared \
    --enable-optimizations \
    --enable-ipv6 \
    LDFLAGS=-Wl,-rpath=/opt/python/${PYTHON_VERSION}/lib,--disable-new-dtags

make
sudo make install

echo "Python ${PYTHON_VERSION} installed"

echo "Install pip"
curl -O https://bootstrap.pypa.io/get-pip.py
sudo /opt/python/${PYTHON_VERSION}/bin/python${PYTHON_MAJOR} get-pip.py

echo "pip installed"


# optional setup python path
# echo "setup python path"

# PATH=/opt/python/<PYTHON-VERSION>/bin/:$PATH

echo "------------------------------------"

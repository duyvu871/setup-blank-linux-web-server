#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -ex

# Update npm to the latest version
echo "Updating npm to the latest version..."
npm install -g npm

# Install PM2 for process management
echo "Installing PM2..."
npm install -g pm2

# Install concurrently for running multiple commands concurrently
echo "Installing concurrently..."
npm install -g concurrently

# Install yarn as an alternative package manager
echo "Installing Yarn..."
npm install -g yarn

# Verify installations
echo "Verifying installations..."
echo "npm version: $(npm -v)"
echo "pm2 version: $(pm2 -v)"
echo "concurrently version: $(concurrently --version)"
echo "yarn version: $(yarn -v)"

echo "All packages installed successfully!"
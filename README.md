# ConnectedBrain Server Setup

This repository contains scripts and configuration files to set up a server environment for the ConnectedBrain project. It includes automated scripts for installing necessary software, configuring the server, and setting up SSL certificates.

## Table of Contents

- [ConnectedBrain Server Setup](#connectedbrain-server-setup)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Scripts Overview](#scripts-overview)
  - [Configuration](#configuration)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have a Linux-based server.
- You have `sudo` privileges on the server.
- You have access to the internet to download packages and dependencies.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/duyvu871/setup-blank-linux-web-server.git
   cd setup-blank-linux-web-server
   ```

2. **Load Environment Variables:**

   Ensure you have a `.env` file in the root directory with the necessary environment variables. You can use the provided `.env` file as a template.

3. **Run the Main Setup Script:**

   Execute the main setup script to configure the server:

   ```bash
   ./main.sh
   ```

4. **Install Node.js Packages:**

   Run the script to install Node.js and related global packages:

   ```bash
   ./install-nodejs-package.sh
   ```

5. **Install Docker:**

   Use the Docker installation script to set up Docker on your server:

   ```bash
   ./install-docker.sh
   ```

## Scripts Overview

- **`main.sh`**: Sets up the server environment, including hostname, timezone, and firewall configuration.
- **`install-nodejs-package.sh`**: Installs Node.js and useful global packages like `pm2`, `concurrently`, `nodemon`, `eslint`, and `yarn`.
- **`install-docker.sh`**: Installs Docker and configures it for your server.
- **`create-user.sh`**: Creates a new user with SSH access and configures sudo privileges.

## Configuration

- **Nginx Configuration**: Located in `nginx/sites-enabled/api.connectedbrain.com.vn.conf`, this file configures Nginx to handle HTTP and HTTPS traffic, proxying requests to backend services.
- **Docker Compose**: The `docker-compose.yml` file defines services for Nginx, HAProxy, and utility containers like `nmap`, `ghostscript`, and `ffmpeg`.


For any questions or issues, please open an issue on the repository or contact the maintainer.
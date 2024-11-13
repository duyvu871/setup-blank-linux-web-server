#!/bin/bash

set -e

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install prerequisites
install_prerequisites() {
    if command_exists apt-get; then
        sudo apt-get update
        sudo apt-get install -y ninja-build gettext cmake unzip curl build-essential
    elif command_exists dnf; then
        sudo dnf -y install ninja-build cmake gcc make unzip gettext curl glibc-gconv-extra
    elif command_exists zypper; then
        sudo zypper install -y ninja cmake gcc-c++ gettext-tools curl
    elif command_exists pacman; then
        sudo pacman -S --noconfirm base-devel cmake unzip ninja curl
    elif command_exists apk; then
        apk add --no-cache build-base cmake coreutils curl unzip gettext-tiny-dev
    elif command_exists xbps-install; then
        sudo xbps-install -S base-devel cmake curl git
    elif command_exists nix-shell; then
        nix-shell '<nixpkgs>' -A neovim-unwrapped
    elif command_exists pkg; then
        sudo pkg install -y cmake gmake sha unzip wget gettext curl
    elif command_exists doas; then
        doas pkg_add gmake cmake unzip curl gettext-tools
    elif command_exists brew; then
        brew install ninja cmake gettext curl
    elif command_exists port; then
        sudo port install ninja cmake gettext
    else
        echo "Unsupported package manager. Please install dependencies manually."
        exit 1
    fi
}

# Clone Neovim repository
clone_neovim() {
    if [ ! -d "neovim" ]; then
        git clone https://github.com/neovim/neovim
    fi
    cd neovim
}

# Build Neovim
build_neovim() {
    make CMAKE_BUILD_TYPE=RelWithDebInfo
    sudo make install
}

# Main script execution
main() {
    install_prerequisites
    clone_neovim
    build_neovim
    echo "Neovim installation complete."
}

main
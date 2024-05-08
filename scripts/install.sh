#!/bin/bash

# Base URL for downloading binaries
BASE_URL="https://github.com/segersniels/genmoji/releases/latest/download"

# Default destination directory (current directory)
DEST_DIR="."

# Check if a command-line argument was provided for the destination
if [ "$#" -eq 1 ]; then
  # If a destination directory is provided, use it
  DEST_DIR="$1"
fi

# Identify OS and Architecture
OS="$(uname -s)"
ARCH="$(uname -m)"

case "${OS}" in
Linux*) os=linux ;;
Darwin*) os=darwin ;;
*)
  echo "Unsupported OS. Exiting..."
  exit 1
  ;;
esac

case "${ARCH}" in
x86_64*) arch=amd64 ;;
arm64*) arch=arm64 ;;
*)
  echo "Unsupported architecture. Exiting..."
  exit 1
  ;;
esac

# Construct binary name and download URL
BIN_NAME="genmoji-${os}-${arch}"
DOWNLOAD_URL="${BASE_URL}/${BIN_NAME}"

# Full path to the target binary
FULL_PATH="${DEST_DIR}/genmoji"

echo "Downloading ${BIN_NAME} to ${FULL_PATH}..."

# Download the binary
if command -v curl >/dev/null; then
  curl -L -o "${FULL_PATH}" "${DOWNLOAD_URL}"
elif command -v wget >/dev/null; then
  wget -O "${FULL_PATH}" "${DOWNLOAD_URL}"
else
  echo "Error: curl or wget is required to download the binary."
  exit 1
fi

# Make the binary executable
chmod +x "${FULL_PATH}"
echo "Download completed. The binary is available at ${FULL_PATH}"

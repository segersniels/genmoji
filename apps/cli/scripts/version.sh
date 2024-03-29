#!/bin/sh

ARCH=$(uname -m)
if [ "${ARCH}" = "arm64" ]; then
  ARCH="aarch64"
fi

BIN_DIR=$(find zig-out -type d -name "${ARCH}*" | head -n 1)
BIN="${BIN_DIR}/genmoji"

if [ -f "${BIN}" ]; then
  echo $(./$BIN --version | awk -F' ' '{print $3}' | tr -d '"')
else
  exit 1
fi

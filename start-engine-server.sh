#!/usr/bin/env bash
# start-engine-server.sh — run inside WSL Ubuntu
# Starts the engine HTTP wrapper on :9000
cd /mnt/c/Users/zION/Documents/dreamer
source engine/.venv/bin/activate
python engine/engine_http_server.py --port 9000

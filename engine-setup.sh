#!/usr/bin/env bash
# =====================================================================
# engine-setup.sh — Set up Python venv and start the engine HTTP server
# Run this in Git Bash (C:\Program Files\Git\bin\bash.exe)
# =====================================================================
set -euo pipefail

WS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$WS"

VENV="engine/.venv/Scripts/python.exe"
PIP="engine/.venv/Scripts/pip.exe"

echo "== [1/3] Installing engine deps into venv =="
"$PIP" install -q httpx pydantic pyyaml rich fastapi uvicorn 2>&1 | tail -3
echo "   deps installed"

echo "== [2/3] Starting engine HTTP server on :9000 =="
"$VENV" engine/engine_http_server.py --port 9000 &
ENGINE_PID=$!
echo "   engine server PID: $ENGINE_PID"
echo "   http://127.0.0.1:9000/health"
echo ""
echo "== Engine server running. Keep this terminal open. =="
echo "== In another Git Bash, test: curl http://127.0.0.1:9000/health =="
wait $ENGINE_PID

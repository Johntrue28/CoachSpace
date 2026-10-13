#!/bin/sh
# Restart the production server for the browser tests, on port $E2E_PORT (default 3100).
# Usage (from the project root, after `npm run build`): sh tests/e2e/serve.sh <output folder>
PORT=${E2E_PORT:-3100}
# Stop whatever is serving this port (and only this port).
PID=$(ss -ltnp 2>/dev/null | grep ":$PORT " | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2)
[ -n "$PID" ] && kill "$PID"
sleep 1
nohup npx next start -p "$PORT" > "$1/server.log" 2>&1 &
for i in $(seq 1 30); do curl -s -o /dev/null "http://localhost:$PORT/" && exit 0; sleep 1; done
exit 1

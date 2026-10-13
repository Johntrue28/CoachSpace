#!/bin/sh
# Restart the production server for the browser tests, on port $E2E_PORT (default 3100).
# Usage (from the project root, after `npm run build`): sh tests/e2e/serve.sh <output folder>
PORT=${E2E_PORT:-3100}
# Stop whatever is serving this port (and only this port), then wait until it is free.
fuser -k "$PORT/tcp" > /dev/null 2>&1
for i in $(seq 1 10); do fuser "$PORT/tcp" > /dev/null 2>&1 || break; sleep 1; done
nohup npx next start -p "$PORT" > "$1/server.log" 2>&1 &
for i in $(seq 1 30); do curl -s -o /dev/null "http://localhost:$PORT/" && exit 0; sleep 1; done
exit 1

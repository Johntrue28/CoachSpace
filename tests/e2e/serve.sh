#!/bin/sh
# Restart the production server on port 3100 for the browser tests.
# Usage (from the project root, after `npm run build`): sh tests/e2e/serve.sh <output folder>
pgrep -f "[n]ext-server" | xargs -r kill
sleep 1
nohup npx next start -p 3100 > "$1/server.log" 2>&1 &
for i in $(seq 1 30); do curl -s -o /dev/null http://localhost:3100/ && exit 0; sleep 1; done
exit 1

#!/bin/sh
# Builds the app, starts it on port 3100 and runs every browser script and audit in tests/e2e/.
# Usage (from the project root, Playwright installed globally): sh tests/e2e/run-all.sh <output folder>
OUT=${1:-/tmp/e2e-out}
mkdir -p "$OUT"
export PW="${PW:-$(npm root -g)/playwright}"
npm run build > "$OUT/build.log" 2>&1 || { echo "Build failed (see $OUT/build.log)"; exit 1; }
sh tests/e2e/serve.sh "$OUT" || { echo "Server did not start"; exit 1; }
status=0
total=0
for f in tests/e2e/*.mjs; do
  name=$(basename "$f" .mjs)
  [ "$name" = lib ] && continue
  node "$f" "$OUT" > "$OUT/$name.log" 2>&1 || status=1
  passed=$(grep -c "^PASS" "$OUT/$name.log")
  total=$((total + passed))
  echo "$name: $passed checks, $(tail -1 "$OUT/$name.log")"
done
echo "Browser checks passed: $total"
for a in layout contrast links; do
  node "tests/e2e/audit/$a.mjs" > "$OUT/audit-$a.log" 2>&1 || status=1
  echo "audit $a: $(grep -E "passed|No |FAIL|BROKEN" "$OUT/audit-$a.log" | head -3 | tr '\n' ' ')"
done
exit $status

// Load smoke test (manual, not part of run-all or CI). Sends many concurrent requests to a running
// production build and reports status codes and response times. It shows that the server side of the
// demo (static pages, on-demand session pages, scripts) holds up when many coaches open the link at
// once. On Vercel, static files are served by its CDN instead, so this is a pessimistic local check.
// Usage: node tests/load/load.mjs [total requests] [concurrency]   (server on E2E_PORT, default 3100)
const BASE = `http://localhost:${process.env.E2E_PORT ?? 3100}`;
const TOTAL = Number(process.argv[2] ?? 3000);
const CONCURRENCY = Number(process.argv[3] ?? 100);

const html = await (await fetch(`${BASE}/demo`)).text();
const assets = [...new Set([...html.matchAll(/\/_next\/static\/[^"'\s)]+/g)].map((m) => m[0]))];
const pages = ["/demo", "/", "/calendar", "/groups", "/chat", "/announcements", "/library", "/me", "/settings", "/attendance"];
// Session pages are rendered on their first visit and then cached (D-054); several dates and groups.
const sessions = ["g1-2026-10-14", "g2-2026-10-13", "g4-2026-10-14", "g5-2026-10-15", "g3-2026-10-20"].map((id) => `/calendar/${id}`);
const urls = [...pages, ...sessions, ...sessions.map((s) => s.replace("/calendar/", "/me/calendar/")), ...assets.slice(0, 20)];

const times = [];
const statuses = {};
let bytes = 0;
let next = 0;
const started = Date.now();
async function worker() {
  while (next < TOTAL) {
    const url = urls[next++ % urls.length];
    const t = performance.now();
    try {
      const res = await fetch(BASE + url, { headers: { "accept-encoding": "gzip, br" } });
      const body = await res.arrayBuffer();
      bytes += body.byteLength;
      statuses[res.status] = (statuses[res.status] ?? 0) + 1;
    } catch (e) {
      statuses[`error: ${e.cause?.code ?? e.message}`] = (statuses[`error: ${e.cause?.code ?? e.message}`] ?? 0) + 1;
    }
    times.push(performance.now() - t);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
const seconds = (Date.now() - started) / 1000;
times.sort((a, b) => a - b);
const pct = (p) => Math.round(times[Math.min(times.length - 1, Math.floor((p / 100) * times.length))]);
console.log(`URLs in rotation: ${urls.length} (${pages.length} pages, ${sessions.length * 2} session pages, ${Math.min(20, assets.length)} scripts and styles)`);
console.log(`Requests: ${TOTAL}, concurrency: ${CONCURRENCY}, time: ${seconds.toFixed(1)} s, ${Math.round(TOTAL / seconds)} requests/s`);
console.log(`Status codes: ${JSON.stringify(statuses)}`);
console.log(`Response time ms: median ${pct(50)}, p95 ${pct(95)}, p99 ${pct(99)}, max ${Math.round(times.at(-1))}`);
console.log(`Body bytes received: ${(bytes / 1e6).toFixed(1)} MB`);
const failed = Object.entries(statuses).filter(([k]) => k !== "200").reduce((n, [, v]) => n + v, 0);
console.log(failed === 0 ? "ALL 200" : `${failed} NOT 200`);
process.exit(failed === 0 ? 0 : 1);

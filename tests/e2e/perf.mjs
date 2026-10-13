// Interaction timing on a phone profile (laboratory simulation, not a real device).
// Chromium at 390×844 with touch, 4× CPU slowdown and a "slow 4G" network (150 ms round trip,
// 1.6 Mbit/s down), the same profile Lighthouse uses for mobile. For each tap it records:
//   - input delay + paint: the Event Timing API "duration" of the tap (what INP measures);
//   - feedback: from the tap to the first change on screen (first DOM mutation);
//   - done: from the tap to the expected result (new page heading, panel open, …).
// Usage: PW=… node tests/e2e/perf.mjs <output folder> [label] [base URL]
// It runs each interaction several times and prints the median. Results go to <out>/perf-<label>.json.
import { writeFileSync } from "fs";
import { chromium, returningVisitor } from "./lib.mjs";
const OUT = process.argv[2] ?? "/tmp";
const LABEL = process.argv[3] ?? "run";
const BASE = process.argv[4] ?? `http://localhost:${process.env.E2E_PORT ?? 3100}`;
const RUNS = Number(process.env.RUNS ?? 5);

const browser = await chromium.launch();
const median = (xs) => {
  const s = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  return s.length ? Math.round(s[Math.floor(s.length / 2)]) : null;
};

async function newPhone({ fresh = false } = {}) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    timezoneId: "Europe/Madrid",
  });
  const page = await context.newPage();
  if (!fresh) await returningVisitor(page);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
  page.on("dialog", (d) => d.accept());
  page.failed = [];
  page.on("requestfailed", (r) => page.failed.push(`${r.url()} ${r.failure()?.errorText}`));
  await page.addInitScript(() => {
    window.__events = [];
    window.__mutations = [];
    window.__taps = [];
    for (const type of ["touchstart", "pointerdown"]) addEventListener(type, (e) => window.__taps.push(e.timeStamp), { capture: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (["pointerup", "click", "change"].includes(e.name)) window.__events.push({ name: e.name, start: e.startTime, duration: e.duration });
    }).observe({ type: "event", durationThreshold: 16, buffered: true });
    const start = () => new MutationObserver(() => window.__mutations.push(performance.now())).observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
    if (document.body) start();
    else document.addEventListener("DOMContentLoaded", start);
  });
  return { context, page };
}

/** Taps `target`, waits in the page until `condition` holds, and returns the timings. */
async function measure(page, target, condition, arg) {
  if (Array.isArray(condition)) [condition, arg] = condition;
  await page.evaluate(() => {
    window.__events = [];
    window.__mutations = [];
    window.__taps = [];
  });
  const done = page.evaluate(
    ([cond, a]) =>
      new Promise((resolve) => {
        const test = new Function("arg", `return (${cond})(arg)`);
        const started = performance.now();
        const check = () => {
          if (test(a)) resolve(performance.now());
          else if (performance.now() - started > 15000) resolve(NaN);
          else requestAnimationFrame(check);
        };
        check();
      }),
    [condition.toString(), arg],
  );
  await target.tap();
  const end = await done;
  return page.evaluate((end) => {
    // The first touch event of the tap. Event Timing only lists events longer than 16 ms.
    const t0 = window.__taps.length ? Math.min(...window.__taps) : NaN;
    const firstChange = window.__mutations.find((m) => m >= t0);
    return {
      inp: window.__events.length ? Math.max(...window.__events.map((e) => e.duration)) : 0,
      feedback: firstChange !== undefined ? firstChange - t0 : NaN,
      done: end - t0,
    };
  }, end);
}

const heading = (text) => [(t) => document.querySelector("h1")?.textContent?.trim().startsWith(t), text];
const results = { label: LABEL, runs: RUNS, load: [], interactions: {} };
const record = (name, r) => (results.interactions[name] ??= []).push(r);

for (let run = 0; run < RUNS; run++) {
  const { context, page } = await newPhone();

  // Initial load of the dashboard.
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForLoadState("networkidle");
  const load = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime;
    const js = performance.getEntriesByType("resource").filter((r) => r.initiatorType === "script").reduce((s, r) => s + (r.transferSize || 0), 0);
    return { ttfb: nav.responseStart, fcp, domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd, jsKB: Math.round(js / 1024) };
  });
  results.load.push(load);
  const nav = page.getByRole("navigation", { name: "Main" });
  const main = page.locator("main");
  await page.waitForTimeout(1500); // let link prefetching settle, as a person would read the page first

  record("Bottom nav → Calendar", await measure(page, nav.getByRole("link", { name: "Calendar" }), heading("Calendar")));
  await page.waitForTimeout(800);
  const filter = main.getByRole("button", { name: /^Groups shown:/ });
  if (await filter.count()) {
    record("Open the group filter", await measure(page, filter, () => !!document.querySelector("main button[aria-expanded='true']")));
    const box = page.getByRole("group", { name: "Show sessions from" }).getByRole("checkbox").nth(1);
    record("Deselect a group", await measure(page, box, () => /of \d+ groups/.test(document.querySelector("main button[aria-expanded]")?.textContent ?? "")));
    record("Select it again", await measure(page, box, () => /All groups/.test(document.querySelector("main button[aria-expanded]")?.textContent ?? "")));
    await page.keyboard.press("Escape");
  }
  await page.waitForTimeout(800);
  const session = main.locator('a[href^="/calendar/"]:not([href^="/calendar/new"])').first();
  record("Open a session", await measure(page, session, () => location.pathname.split("/").length === 3 && location.pathname !== "/calendar/new" && !!document.querySelector("h1")));
  await page.waitForTimeout(800);
  record("Bottom nav → Groups", await measure(page, nav.getByRole("link", { name: "Groups" }), heading("Groups")));
  await page.waitForTimeout(800);
  record("Bottom nav → Chat", await measure(page, nav.getByRole("link", { name: "Chat" }), heading("Chat")));
  await page.waitForTimeout(800);
  record("Bottom nav → More", await measure(page, nav.getByRole("link", { name: "More" }), heading("More")));
  await page.waitForTimeout(800);
  record("More → Settings", await measure(page, main.getByRole("link", { name: /^Settings/ }), heading("Settings")));
  await page.waitForTimeout(800);
  const attendanceSwitch = page.getByRole("switch", { name: "Attendance tracking" });
  record("Toggle attendance off", await measure(page, attendanceSwitch, () => document.querySelector('[role="switch"]')?.getAttribute("aria-checked") === "false"));
  await page.waitForTimeout(500);
  record("Toggle attendance on", await measure(page, attendanceSwitch, () => document.querySelector('[role="switch"]')?.getAttribute("aria-checked") === "true"));
  await page.waitForTimeout(800);
  // Reset demo data lives in Settings → Demo since D-055 (General before).
  const demoSection = main.getByRole("navigation", { name: "Settings sections" }).getByRole("link", { name: /^(Demo|General)$/ }).first();
  if (await demoSection.count()) {
    await demoSection.tap();
    await page.waitForTimeout(800);
    const reset = main.getByRole("button", { name: "Reset demo data" });
    record("Reset demo data", await measure(page, reset, () => [...document.querySelectorAll('main [role="status"]')].some((e) => /restored|reset/i.test(e.textContent ?? ""))));
  }
  await page.waitForTimeout(800);
  record("Switch to Participant view", await measure(page, page.getByRole("navigation", { name: "Demo view" }).getByRole("link", { name: "Participant" }), () => location.pathname === "/me" && !!document.querySelector("main h1")));
  await page.waitForTimeout(800);
  record("Switch back to Coach view", await measure(page, page.getByRole("navigation", { name: "Demo view" }).getByRole("link", { name: "Coach" }), () => location.pathname === "/" && !!document.querySelector("main h1")));
  await page.waitForTimeout(800);
  // Scenario switching. Settings → Demo since D-055; the old Demo Studio before.
  await page.goto(BASE + "/settings?section=demo", { waitUntil: "load" });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);
  const switcher = main.getByRole("list", { name: "Demo scenarios" }).getByRole("button", { name: /Football Academy/ });
  if (await switcher.count()) {
    record("Settings: switch to another scenario", await measure(page, switcher, () => document.querySelector("[data-active-scenario]")?.getAttribute("data-active-scenario") === "football"));
  }
  if (page.errors.length) results.errors = [...(results.errors ?? []), ...page.errors];
  if (page.failed.length) results.failedRequests = [...(results.failedRequests ?? []), ...page.failed];
  await context.close();

  // A first-time visitor (D-055): `/` sends them to the welcome screen; choosing a sport opens the dashboard.
  const first = await newPhone({ fresh: true });
  const t0 = Date.now();
  await first.page.goto(BASE + "/", { waitUntil: "load" });
  if ((await first.page.request.get(BASE + "/demo")).ok() && first.page.url().endsWith("/demo")) {
    await first.page.getByRole("heading", { level: 1 }).waitFor();
    record("First visit: / to the welcome screen", { inp: null, feedback: null, done: Date.now() - t0 });
    await first.page.waitForLoadState("networkidle");
    await first.page.waitForTimeout(800);
    const explore = first.page.getByRole("button", { name: "Explore Football Academy" });
    record("Welcome: choose a sport", await measure(first.page, explore, () => location.pathname === "/" && /Daniel/.test(document.querySelector("main h1")?.textContent ?? "")));
  }
  if (first.page.errors.length) results.errors = [...(results.errors ?? []), ...first.page.errors];
  await first.context.close();
}

const summary = {
  label: LABEL,
  load: Object.fromEntries(Object.keys(results.load[0]).map((k) => [k, median(results.load.map((l) => l[k]))])),
  interactions: Object.fromEntries(
    Object.entries(results.interactions).map(([k, rs]) => [k, { inp: median(rs.map((r) => r.inp)), feedback: median(rs.map((r) => r.feedback)), done: median(rs.map((r) => r.done)) }]),
  ),
  errors: results.errors ?? [],
  failedRequests: results.failedRequests ?? [],
};
writeFileSync(`${OUT}/perf-${LABEL}.json`, JSON.stringify({ summary, raw: results }, null, 2));
console.log(`Load (median of ${RUNS}):`, JSON.stringify(summary.load));
console.log("Interaction (median ms)                 INP  feedback  done");
for (const [k, v] of Object.entries(summary.interactions)) console.log(`${k.padEnd(38)} ${String(v.inp).padStart(5)} ${String(v.feedback).padStart(9)} ${String(v.done).padStart(5)}`);
console.log(`Console errors: ${summary.errors.length}; failed requests: ${summary.failedRequests.length}`);
await browser.close();

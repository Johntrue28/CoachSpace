// Link crawl: follows every visible internal link from the main pages (coach and participant) and
// reports pages that fail or show "not found".
import { chromium, BASE } from "../lib.mjs";
// SCENARIO=<tennis|football|basketball|pilates> runs it with that demo scenario (D-053); default Tennis Coaching.
const SCENARIO = process.env.SCENARIO ?? "tennis";
const start = ["/", "/me", "/more", "/attendance", "/groups/g1", "/calendar/g1-2026-10-12", "/library", "/library/plans", "/announcements", "/me/announcements", "/chat", "/me/chat", "/me/videos", "/me/calendar", "/me/groups/g4", "/calendar?view=week", "/settings", "/settings?section=demo", "/demo"];
const b = await chromium.launch();
const seen = new Map(); let bad = [];
for (const w of [1440]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, timezoneId: "Europe/Madrid" });
  await ctx.addInitScript((s) => { try { localStorage.setItem("coachspace-scenario", s); sessionStorage.setItem("coachspace-visit", "1"); } catch {} }, SCENARIO);
  const p = await ctx.newPage();
  await p.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  const queue = [...start]; const visited = new Set();
  while (queue.length && visited.size < 400) {
    const r = queue.shift(); if (visited.has(r)) continue; visited.add(r);
    const resp = await p.goto(BASE + r, { waitUntil: "networkidle" });
    const status = resp?.status();
    const text = await p.locator("body").innerText();
    if (status >= 400 || /could not be found|was not found|not found\.|is not available/i.test(text)) bad.push(`${w} ${r} status ${status}`);
    const hrefs = await p.$$eval("a[href]", (as) => as.filter((a) => a.getBoundingClientRect().width > 0).map((a) => a.getAttribute("href")));
    for (const h of hrefs) {
      if (!h.startsWith("/") || h.startsWith("/#")) continue;
      // Links that choose a sport (`?sport=`, D-065, D-070) are actions that switch scenario, like the
      // buttons, not pages to crawl: following them would mix scenarios. direct-link.mjs tests them.
      if (/[?&]sport=/.test(h)) continue;
      seen.set(h, (seen.get(h) ?? 0) + 1);
      if (!visited.has(h) && !queue.includes(h)) queue.push(h);
    }
  }
  console.log(`${w}: visited ${visited.size} pages`);
  await ctx.close();
}
await b.close();
console.log(`scenario: ${SCENARIO}`);
console.log(`unique internal links: ${seen.size}`);
console.log(bad.length ? "BROKEN:\n" + bad.join("\n") : "No broken links");
if (bad.length) process.exitCode = 1;

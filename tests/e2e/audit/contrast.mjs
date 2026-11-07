// WCAG AA contrast audit (D-041): every visible text element on the main routes at 390 and 1440 px,
// against its real background (opacity and disabled controls excluded).
import { chromium, BASE } from "../lib.mjs";
// SCENARIO=<tennis|football|basketball> runs it with that demo scenario (D-053); default Tennis Coaching.
const SCENARIO = process.env.SCENARIO ?? "tennis";
const PLAN = { tennis: "t-junior", football: "t-possession", basketball: "t-skills" }[SCENARIO];
const routes = ["/", "/groups", "/groups/new", "/groups/g1", "/groups/g1/edit", "/groups/g4", "/chat", "/chat/c-g1", "/calendar", "/calendar/g1-2026-10-12", "/calendar/g1-2026-10-14", "/calendar/g1-2026-10-14/plan", "/me/calendar/g4-2026-10-14", "/me/calendar/g4-2026-10-14/plan", "/calendar/g1-2026-10-12/attendance?group=g1", "/calendar/new", "/calendar/g1-2026-10-19/edit", "/attendance", "/attendance?group=g1", "/announcements", "/announcements/new", "/library", "/library/new", "/library/e1", "/library/e1/assign", "/library/plans", `/library/plans/${PLAN}`, "/more", "/settings", "/me", "/me/chat", "/me/chat/c-g4", "/me/videos", "/me/videos/e1", "/me/announcements", "/demo"];
const b = await chromium.launch();
const fails = new Map();
let checked = 0;
for (const w of [390, 1440]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, timezoneId: "Europe/Madrid" });
  await ctx.addInitScript((s) => { try { localStorage.setItem("coachspace-scenario", s); sessionStorage.setItem("coachspace-visit", "1"); } catch {} }, SCENARIO);
  const p = await ctx.newPage();
  await p.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  for (const r of routes) {
    await p.goto(BASE + r, { waitUntil: "networkidle" });
    const res = await p.evaluate(() => {
      const c = document.createElement("canvas"); c.width = c.height = 1; const x = c.getContext("2d", { willReadFrequently: true });
      const rgba = (css) => { x.clearRect(0, 0, 1, 1); x.fillStyle = "#000"; x.fillStyle = css; x.fillRect(0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
      const over = (top, bottom) => { const a = top[3]; return [0, 1, 2].map((i) => top[i] * a + bottom[i] * (1 - a)).concat(1); };
      const lum = (c) => { const v = c.slice(0, 3).map((n) => { n /= 255; return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
      const ratio = (a, b) => { const [h, l] = [lum(a), lum(b)].sort((m, n) => n - m); return (h + 0.05) / (l + 0.05); };
      const bgOf = (el) => {
        const chain = [];
        for (let e = el; e; e = e.parentElement) chain.push(e);
        let bg = [255, 255, 255, 1];
        for (const e of chain.reverse()) { const cs = getComputedStyle(e); const c = rgba(cs.backgroundColor); if (c[3] > 0) bg = over(c, bg); }
        return bg;
      };
      const out = [];
      let n = 0;
      for (const el of document.querySelectorAll("body *")) {
        const own = [...el.childNodes].some((t) => t.nodeType === 3 && t.textContent.trim());
        if (!own) continue;
        const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || el.closest("[aria-hidden=true], .sr-only, :disabled, [disabled]")) continue;
        let op = 1; for (let e = el; e; e = e.parentElement) op *= Number(getComputedStyle(e).opacity); if (op < 1) continue;
        n++;
        const bg = bgOf(el); const fg = over(rgba(cs.color), bg);
        const size = parseFloat(cs.fontSize), weight = Number(cs.fontWeight);
        const large = size >= 24 || (size >= 18.66 && weight >= 700);
        const k = ratio(fg, bg);
        if (k < (large ? 3 : 4.5)) out.push({ text: el.textContent.trim().slice(0, 40), ratio: Math.round(k * 100) / 100, fg: cs.color, bg: `rgb(${bg.slice(0, 3).map(Math.round).join(",")})`, cls: (el.className?.baseVal ?? el.className ?? "").toString().slice(0, 90), size });
      }
      return { out, n };
    });
    checked += res.n;
    for (const f of res.out) { const key = `${f.fg} on ${f.bg} (${f.ratio}:1)`; if (!fails.has(key)) fails.set(key, []); fails.get(key).push(`${w} ${r} "${f.text}" [${f.cls}] ${f.size}px`); }
  }
  await ctx.close();
}
await b.close();
console.log(`text elements checked: ${checked}`);
for (const [k, v] of fails) { console.log(`FAIL ${k} — ${v.length} occurrences`); for (const s of [...new Set(v)].slice(0, 4)) console.log("    " + s); }
if (!fails.size) console.log("No contrast failures");
else process.exitCode = 1;

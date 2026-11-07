// Layout audit (D-040 step 12): every main route at 360, 390, 768, 1024 and 1440 px. Checks horizontal
// overflow, one visible main navigation, sidebar/bottom bar by width, nothing hidden behind the bottom
// bar and console errors. The welcome screen (/demo,
// D-055) is checked for overflow and for having no app navigation.
import { chromium, BASE } from "../lib.mjs";
// SCENARIO=<tennis|football|basketball> runs it with that demo scenario (D-053); default Tennis Coaching.
const SCENARIO = process.env.SCENARIO ?? "tennis";
const PLAN = { tennis: "t-junior", football: "t-possession", basketball: "t-skills" }[SCENARIO];
const routes = ["/", "/groups", "/groups/new", "/groups/g1", "/groups/g1/edit", "/groups/g2", "/groups/g4", "/chat", "/chat/c-g1", "/calendar", "/calendar?date=2026-11-01", "/calendar/g1-2026-10-12", "/calendar/g1-2026-10-14", "/calendar/g1-2026-10-14/plan", "/me/calendar/g4-2026-10-14", "/me/calendar/g4-2026-10-14/plan", "/calendar/new", "/attendance", "/attendance?group=g1", "/announcements", "/announcements/new", "/library", "/library/e1", "/library/new", "/library/plans", `/library/plans/${PLAN}`, "/more", "/settings", "/me", "/me/videos", "/me/videos/e1", "/me/chat", "/me/chat/c-g4", "/me/announcements", "/demo"];
const b = await chromium.launch();
let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { fails++; console.log("FAIL", m); } };
for (const w of [360, 390, 768, 1024, 1440]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 }, timezoneId: "Europe/Madrid" });
  await ctx.addInitScript((s) => { try { localStorage.setItem("coachspace-scenario", s); sessionStorage.setItem("coachspace-visit", "1"); } catch {} }, SCENARIO);
  const p = await ctx.newPage();
  await p.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text()));
  for (const r of routes) {
    await p.goto(BASE + r, { waitUntil: "networkidle" });
    const res = await p.evaluate(() => {
      const vis = (el) => !!el && getComputedStyle(el).display !== "none" && el.getBoundingClientRect().width > 0;
      const navs = [...document.querySelectorAll('nav[aria-label="Main"]')].filter(vis);
      window.scrollTo(0, document.body.scrollHeight);
      const bottomNav = [...document.querySelectorAll('nav[aria-label="Main"]')].find((n) => n.closest("aside") === null);
      const navTop = vis(bottomNav) ? bottomNav.getBoundingClientRect().top : window.innerHeight;
      // The welcome screen stands alone, without the app frame (D-055).
      const bare = !document.querySelector("#content");
      if (bare) return { sw: document.documentElement.scrollWidth, navs: navs.length, bare, sidebar: vis(document.querySelector("aside")), bottom: vis(bottomNav), lastBottom: 0, navTop: 1 };
      const main = document.querySelector("#content main");
      // last visible content element bottom
      // Content inside an inner scroll area (for example the chat list on desktop) is reachable by scrolling it.
      const inScroller = (e) => { for (let p = e.parentElement; p && p !== main; p = p.parentElement) { const o = getComputedStyle(p).overflowY; if (o === "auto" || o === "scroll") return true; } return false; };
      const els = [...main.querySelectorAll("*")].filter((e) => e.children.length === 0 && e.getBoundingClientRect().height > 0 && !inScroller(e));
      const lastBottom = Math.max(...els.map((e) => e.getBoundingClientRect().bottom));
      return { sw: document.documentElement.scrollWidth, navs: navs.length, sidebar: vis(document.querySelector("aside")), bottom: vis(bottomNav), lastBottom, navTop };
    });
    ok(res.sw <= w, `${w} ${r} overflow ${res.sw}`);
    if (res.bare) {
      ok(r === "/demo" && res.navs === 0 && !res.sidebar && !res.bottom, `${w} ${r} only the welcome screen is shown without the app frame`);
    } else {
      ok(res.navs === 1, `${w} ${r} visible main navs ${res.navs}`);
      ok(res.sidebar === (w >= 1024) && res.bottom === (w < 1024), `${w} ${r} sidebar/bottom visibility`);
    }
    ok(res.lastBottom <= res.navTop + 1, `${w} ${r} content hidden behind nav (${Math.round(res.lastBottom)} > ${Math.round(res.navTop)})`);
  }
  ok(errs.length === 0, `${w} console errors: ${errs.join(" | ")}`);
  await ctx.close();
}
await b.close();
console.log(`${checks - fails}/${checks} passed`);
if (fails) process.exitCode = 1;

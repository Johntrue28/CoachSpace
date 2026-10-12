// Layout audit (D-040 step 12): every main route at 360, 390, 768, 1024 and 1440 px. Checks horizontal
// overflow, one visible main navigation, sidebar/bottom bar by width, nothing hidden behind the bottom
// bar, console errors, the activity panel and the Settings section labels.
import { chromium, BASE } from "../lib.mjs";
// SCENARIO=<tennis|football|basketball|pilates> runs it with that demo scenario (D-053); default Tennis Club.
const SCENARIO = process.env.SCENARIO ?? "tennis";
const PLAN = { tennis: "t-junior", football: "t-possession", basketball: "t-skills", pilates: "t-reformer" }[SCENARIO];
const routes = ["/", "/groups", "/groups/g1", "/groups/g2", "/groups/g4", "/chat", "/chat/c-g1", "/calendar", "/calendar?view=week", "/calendar?date=2026-11-01", "/calendar/g1-2026-10-12", "/calendar/new", "/attendance", "/attendance?group=g1", "/announcements", "/announcements/new", "/library", "/library/e1", "/library/new", "/library/plans", `/library/plans/${PLAN}`, "/more", "/settings", "/settings?section=general", "/settings?section=notifications", "/me", "/me/groups/g4", "/me/videos", "/me/videos/e1", "/me/calendar", "/me/calendar?view=week", "/me/chat", "/me/chat/c-g4", "/me/announcements", "/demo"];
const b = await chromium.launch();
let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { fails++; console.log("FAIL", m); } };
for (const w of [360, 390, 768, 1024, 1440]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 }, timezoneId: "Europe/Madrid" });
  await ctx.addInitScript((s) => { try { localStorage.setItem("coachspace-scenario", s); } catch {} }, SCENARIO);
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
      const main = document.querySelector("#content main");
      // last visible content element bottom
      // Content inside an inner scroll area (for example the chat list on desktop) is reachable by scrolling it.
      const inScroller = (e) => { for (let p = e.parentElement; p && p !== main; p = p.parentElement) { const o = getComputedStyle(p).overflowY; if (o === "auto" || o === "scroll") return true; } return false; };
      const els = [...main.querySelectorAll("*")].filter((e) => e.children.length === 0 && e.getBoundingClientRect().height > 0 && !inScroller(e));
      const lastBottom = Math.max(...els.map((e) => e.getBoundingClientRect().bottom));
      return { sw: document.documentElement.scrollWidth, navs: navs.length, sidebar: vis(document.querySelector("aside")), bottom: vis(bottomNav), lastBottom, navTop };
    });
    ok(res.sw <= w, `${w} ${r} overflow ${res.sw}`);
    ok(res.navs === 1, `${w} ${r} visible main navs ${res.navs}`);
    ok(res.sidebar === (w >= 1024) && res.bottom === (w < 1024), `${w} ${r} sidebar/bottom visibility`);
    ok(res.lastBottom <= res.navTop + 1, `${w} ${r} content hidden behind nav (${Math.round(res.lastBottom)} > ${Math.round(res.navTop)})`);
  }
  // Activity panel: opens, stays in viewport, closes with Escape and on navigation
  for (const r of ["/", "/me"]) {
    await p.goto(BASE + r, { waitUntil: "networkidle" });
    const bell = p.getByRole("button", { name: /Activity in this demo/ });
    await bell.click();
    const panel = p.getByRole("region", { name: "Activity in this demo" });
    const box = await panel.boundingBox();
    ok(box && box.x >= 0 && box.x + box.width <= w, `${w} ${r} panel inside viewport ${JSON.stringify(box)}`);
    ok((await panel.innerText()).includes("Not real-time or push notifications"), `${w} ${r} panel disclaimer`);
    const txt = await panel.innerText();
    ok(r === "/me" ? !txt.includes("Attendance not taken") : txt.includes("Attendance not taken"), `${w} ${r} attendance items only for coach`);
    await p.keyboard.press("Escape");
    ok((await panel.count()) === 0, `${w} ${r} Escape closes panel`);
    ok(await bell.evaluate((el) => el === document.activeElement), `${w} ${r} focus returns to bell`);
    await bell.click();
    await panel.getByRole("link").first().click();
    await p.waitForURL(/\/chat\//);
    const closed = await panel.waitFor({ state: "detached", timeout: 2000 }).then(() => true, () => false);
    ok(closed, `${w} ${r} panel closes after navigating`);
  }
  ok(errs.length === 0, `${w} console errors: ${errs.join(" | ")}`);
  await ctx.close();
}
await b.close();
console.log(`${checks - fails}/${checks} passed`);
if (fails) process.exitCode = 1;
// Settings section nav: labels fit on one line at every width
{
  const b2 = await chromium.launch();
  for (const w of [360, 390, 768, 1024, 1440]) {
    const p = await b2.newPage({ viewport: { width: w, height: 800 } });
    await p.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
    const res = await p.$$eval('nav[aria-label="Settings sections"] a', (as) => as.map((a) => ({ t: a.textContent, fits: a.scrollWidth <= a.clientWidth + 1, h: a.getBoundingClientRect().height })));
    const bad = res.filter((r) => !r.fits || r.h > 44);
    console.log(`${w} settings nav ${bad.length ? "FAIL " + JSON.stringify(bad) : "ok"}`);
    await p.close();
  }
  await b2.close();
}

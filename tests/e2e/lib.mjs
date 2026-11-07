import { createRequire } from "module";
const require = createRequire(import.meta.url);
export const { chromium } = require(process.env.PW);
// E2E_PORT lets several copies of the app run side by side (default 3100).
export const BASE = `http://localhost:${process.env.E2E_PORT ?? 3100}`;
/** The visible main navigation: the sidebar from 1024 px, the bottom navigation below. */
export const mainNav = (page) => page.getByRole("navigation", { name: "Main" });
/**
 * Navigation labels per viewport (D-071): four places for the coach; on desktop the sidebar also lists the
 * secondary pages (Calendar, Attendance, Settings), which phones reach through the avatar menu (/more).
 */
export const coachNavLabels = (vp) =>
  vp.width >= 1024 ? "Agenda|Groups|Library|Messages|Calendar|Attendance|Settings" : "Agenda|Groups|Library|Messages";
export const participantNavLabels = "Agenda|Exercises|Messages";
/** Opens a secondary coach page (Calendar, Attendance or Settings) the way a visitor would on this viewport. */
export async function openSecondary(page, vp, label) {
  if (vp.width < 1024) {
    await page.getByRole("link", { name: /^Menu:/ }).click();
    await page.waitForURL(/\/more$/);
    await page.locator("main").getByRole("link", { name: new RegExp(`^${label}`) }).first().click();
  } else {
    await mainNav(page).getByRole("link", { name: label, exact: true }).click();
  }
  await page.waitForLoadState("networkidle");
}
export let failures = 0;
export const ok = (cond, msg) => { console.log(`${cond ? "PASS" : "FAIL"} ${msg}`); if (!cond) failures++; };
export const viewports = [{ name: "mobile", width: 390, height: 844 }, { name: "desktop", width: 1280, height: 800 }];
/**
 * Makes a page behave like a returning visitor (D-055) who has already chosen in this tab (D-068):
 * Tennis Coaching chosen on the welcome screen and the dashboard introduction closed, once per tab, so later changes made by the test
 * (switching scenario, resets) are kept. `fresh: true` starts as a first-time visitor instead.
 */
export async function returningVisitor(page) {
  await page.addInitScript(() => {
    try {
      if (sessionStorage.getItem("e2e-returning")) return;
      sessionStorage.setItem("e2e-returning", "1");
      // This tab is already in the demo (D-068), so / opens the dashboard as after choosing a card.
      sessionStorage.setItem("coachspace-visit", "1");
      if (!localStorage.getItem("coachspace-scenario")) localStorage.setItem("coachspace-scenario", "tennis");
      localStorage.setItem("coachspace-intro-dismissed", "1");
    } catch {}
  });
}
export async function newPage(browser, vp, { fresh = false } = {}) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, timezoneId: "Europe/Madrid" });
  if (!fresh) await returningVisitor(page);
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
  return page;
}
export async function finish(page, vp) {
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(width <= vp.width, `[${vp.name}] no horizontal scroll (${width}px)`);
  ok(page.errors.length === 0, `[${vp.name}] no console or page errors ${page.errors.join(" | ")}`);
  await page.close();
}
export function done() { console.log(failures === 0 ? "ALL PASSED" : `${failures} FAILED`); process.exit(failures ? 1 : 0); }
/** The coach's organisation by first name, as the Agenda shows it above its title (D-071). */
export const ORGS = { Laura: "Laura Gomez Tennis", Daniel: "Northgate Football Academy", Maya: "Eastfield Basketball Club", Clara: "Calma Pilates Studio" };
/**
 * What identifies the home page: "Agenda · <organisation>" for the coach (the Agenda's title has no name since
 * D-071), the heading itself elsewhere ("Hi Jordan" for the participant).
 */
export async function homeTitle(page) {
  const h1 = page.locator("h1").first();
  const text = (await h1.innerText()).replace(/\s+/g, " ").trim();
  if (text !== "Agenda") return text;
  const org = (await h1.locator("xpath=preceding-sibling::p[1]").textContent()).trim();
  return `Agenda · ${org}`;
}

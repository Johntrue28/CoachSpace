import { createRequire } from "module";
const require = createRequire(import.meta.url);
export const { chromium } = require(process.env.PW);
export const BASE = "http://localhost:3100";
/** The visible main navigation: the sidebar from 1024 px, the bottom navigation below. */
export const mainNav = (page) => page.getByRole("navigation", { name: "Main" });
/** Navigation labels per viewport (D-040 step 2). */
export const coachNavLabels = (vp) =>
  vp.width >= 1024 ? "Dashboard|Calendar|Groups|Exercise Library|Chat|Announcements|Attendance" : "Dashboard|Calendar|Groups|Chat|More";
export let failures = 0;
export const ok = (cond, msg) => { console.log(`${cond ? "PASS" : "FAIL"} ${msg}`); if (!cond) failures++; };
export const viewports = [{ name: "mobile", width: 390, height: 844 }, { name: "desktop", width: 1280, height: 800 }];
export async function newPage(browser, vp) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, timezoneId: "Europe/Madrid" });
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

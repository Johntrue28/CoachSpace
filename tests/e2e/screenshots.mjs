// Screenshots of the main screens (DEMO_SPEC "Definition of done"): 390 and 1440 px, English and Spanish, with the
// default example (Tennis Coaching) on Wednesday 14 October 2026 at 12:00. Also checks that the coach's Home is no
// taller than about two phone screens. Run with the app started (serve.sh):
//   node tests/e2e/screenshots.mjs <output folder>
import { chromium, BASE, ok, done } from "./lib.mjs";
const OUT = process.argv[2] ?? "/tmp/coachspace-screens";
const browser = await chromium.launch();
const SESSION = "g1-2026-10-14"; // U16 Development today: a plan and example lifts
const PLAYER_SESSION = "g4-2026-10-14"; // Adult Improvers tonight: the demo player's group

const screens = [
  { name: "01-home", path: "/" },
  { name: "02-session", path: `/calendar/${SESSION}` },
  { name: "03-plan-view", path: `/calendar/${SESSION}/plan` },
  { name: "04-groups", path: "/groups" },
  { name: "05-group-attendance", path: "/groups/g1", tab: 2 },
  { name: "06-library-exercises", path: "/library" },
  { name: "07-library-plans", path: "/library/plans" },
  { name: "08-messages", path: "/chat" },
  { name: "09-calendar", path: "/calendar" },
  { name: "10-profile", path: "/more" },
  { name: "11-attendance", path: "/attendance" },
  { name: "12-settings", path: "/settings" },
  { name: "13-player-home", path: "/me" },
  { name: "14-player-session", path: `/me/calendar/${PLAYER_SESSION}` },
];

for (const language of ["en", "es"]) {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width < 1024 ? 844 : 900 }, deviceScaleFactor: 1, timezoneId: "Europe/Madrid" });
    await context.addInitScript((lang) => {
      try {
        sessionStorage.setItem("coachspace-visit", "1");
        localStorage.setItem("coachspace-scenario", "tennis");
        localStorage.setItem("coachspace-intro-dismissed", "1");
        localStorage.setItem("coachspace-language", lang);
      } catch {}
    }, language);
    const page = await context.newPage();
    await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const s of screens) {
      await page.goto(BASE + s.path, { waitUntil: "networkidle" });
      if (s.tab !== undefined) await page.locator("main [role=tab]").nth(s.tab).click();
      await page.waitForTimeout(400);
      if (s.name === "01-home" && width === 390) {
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        ok(height <= 844 * 2.3, `[${language}] the coach's Home is about two phone screens tall (${height} px = ${(height / 844).toFixed(1)} screens)`);
      }
      ok((await page.evaluate(() => document.documentElement.lang)) === (language === "es" ? "es-ES" : "en-GB"), `[${language} ${width}] ${s.name} in the right language`);
      await page.screenshot({ path: `${OUT}/${language}-${width}-${s.name}.jpg`, type: "jpeg", quality: 70, fullPage: true });
    }
    ok(errors.length === 0, `[${language} ${width}] no page errors ${errors.join(" | ")}`);
    await context.close();
  }
}
await browser.close();
done();

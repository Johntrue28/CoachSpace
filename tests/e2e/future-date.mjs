// Seeded content does not go out of date (audit R-03). With the clock on Tuesday 10 November 2026,
// four weeks after the seed week, every scenario's dashboard, chat and announcements show recent
// dates (no "Oct"), messages are not all from today, and pages render without hydration errors.
import { chromium, BASE, ok, viewports, finish, done } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();
const OCT = /\b\d{1,2} Oct\b|\bOctober\b/;
const vp = viewports[0];

for (const scenario of ["tennis", "football", "basketball"]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, timezoneId: "Europe/Madrid" });
  await page.clock.setFixedTime(new Date("2026-11-10T12:00:00+01:00"));
  await page.addInitScript((s) => {
    localStorage.setItem("coachspace-scenario", s);
    localStorage.setItem("coachspace-intro-dismissed", "1");
    sessionStorage.setItem("coachspace-visit", "1");
  }, scenario);
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
  const main = page.locator("main");
  const go = async (p) => {
    await page.goto(BASE + p);
    await page.waitForLoadState("networkidle");
  };
  const s = `[${scenario}]`;

  // Agenda home (D-071): the next seven days and the "needs you" items.
  await go("/");
  await main.locator("h1").filter({ hasText: "Agenda" }).waitFor();
  await page.waitForFunction(() => document.querySelector("main section[aria-labelledby^='day-']"));
  await page.waitForTimeout(300);
  const dashboard = await page.evaluate(() => {
    const copy = document.querySelector("main").cloneNode(true);
    copy.querySelectorAll("section").forEach((sec) => {
      if (/^Attendance/.test(sec.querySelector("h2")?.textContent ?? "")) sec.remove();
    });
    document.body.appendChild(copy);
    const text = copy.innerText;
    copy.remove();
    return text;
  });
  ok(!OCT.test(dashboard), `${s} dashboard shows no October date ${dashboard.match(OCT)?.[0] ?? ""}`);
  await page.screenshot({ path: `${OUT}/future-${scenario}-dashboard.png`, fullPage: true });

  // Chat list and one conversation.
  await go("/chat");
  await main.getByRole("link").first().waitFor();
  const list = clean(await main.innerText());
  ok(!OCT.test(list), `${s} chat list shows no October date ${list.match(OCT)?.[0] ?? ""}`);
  ok(/Yesterday|\b\d{1,2} Nov\b/.test(list), `${s} chat list shows recent dates`);
  await go("/chat/c-g1");
  await main.locator("h1").first().waitFor();
  await page.waitForFunction(() => document.querySelector("main")?.innerText.match(/\d\d:\d\d/));
  const conversation = clean(await main.innerText());
  ok(!OCT.test(conversation), `${s} conversation shows no October day ${conversation.match(OCT)?.[0] ?? ""}`);
  ok(!conversation.includes("Today"), `${s} seeded messages are not presented as sent today`);

  // Announcements.
  await go("/announcements");
  await main.locator("ul > li").first().waitFor();
  const board = clean(await main.innerText());
  ok(!OCT.test(board), `${s} announcements show no October date ${board.match(OCT)?.[0] ?? ""}`);
  ok(/\b\d{1,2} Nov, \d\d:\d\d\b|Yesterday, \d\d:\d\d/.test(board), `${s} announcements are dated in the last few days`);

  // Participant home: messages, announcements and videos of the same scenario.
  await go("/me");
  await main.locator("h1").waitFor();
  await page.waitForTimeout(300);
  const me = clean(await main.innerText());
  ok(!OCT.test(me), `${s} participant home shows no October date ${me.match(OCT)?.[0] ?? ""}`);

  await finish(page, vp);
}
await browser.close();
done();

// Opening the link again (D-068): every new tab that opens / starts on the welcome screen with the
// four sports, also for a returning visitor; a reload in the same tab and navigation inside the app
// keep the dashboard; the changes saved before are still there; deep links and direct links are not
// sent to the welcome screen.
import { chromium, BASE, ok, viewports, finish, done, mainNav } from "./lib.mjs";
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();

for (const vp of viewports) {
  const n = vp.name;
  // One browser profile (shared localStorage), several tabs (each with its own sessionStorage).
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, timezoneId: "Europe/Madrid" });
  const tab = async () => {
    const page = await context.newPage();
    await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
    page.errors = [];
    page.on("pageerror", (e) => page.errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
    return page;
  };
  const h1 = async (page) => clean(await page.locator("h1").first().innerText());
  const openLink = async (page) => {
    await page.goto(`${BASE}/`);
    await page.waitForURL(`${BASE}/demo`);
    await page.waitForLoadState("networkidle");
  };
  const choose = async (page, name, coach) => {
    await page.getByRole("button", { name: `Explore ${name}` }).click();
    await page.waitForURL(`${BASE}/`);
    await page.locator("h1").filter({ hasText: coach }).waitFor();
  };

  // 1. First visit: welcome screen, then Pilates. A reload and in-app navigation keep the dashboard.
  const first = await tab();
  await openLink(first);
  ok((await h1(first)) === "Try CoachSpace with your sport", `[${n}] first visit opens the welcome screen`);
  await choose(first, "Pilates Studio", "Clara");
  await first.reload();
  await first.waitForLoadState("networkidle");
  ok(first.url() === `${BASE}/` && (await h1(first)) === "Good afternoon, Clara", `[${n}] a reload in the same tab keeps the dashboard`);
  await first.goto(`${BASE}/announcements/new`);
  await first.getByLabel("Title").fill("Saved before closing the tab");
  await first.getByLabel("Announcement").fill("Should still be here next time.");
  await first.getByRole("button", { name: "Post announcement" }).click();
  await first.waitForURL(/\/announcements(\?|$)/);
  await mainNav(first).getByRole("link", { name: "Dashboard" }).click();
  await first.waitForURL(`${BASE}/`);
  await first.locator("h1").filter({ hasText: "Clara" }).waitFor();
  ok((await h1(first)) === "Good afternoon, Clara", `[${n}] the Dashboard link inside the app does not show the welcome screen`);
  await finish(first, vp);

  // 2. The visitor opens the link again in a new tab: the four sports again, Pilates marked.
  const again = await tab();
  await openLink(again);
  ok((await h1(again)) === "Try CoachSpace with your sport", `[${n}] opening the link again shows the welcome screen`);
  ok((await again.getByRole("list", { name: "Demo examples" }).getByRole("article").count()) === 4, `[${n}] with the four sports`);
  const pilatesCard = clean(await again.locator('article[data-scenario="pilates"]').innerText());
  ok(pilatesCard.includes("Explored last time"), `[${n}] the example explored before is marked`);
  await choose(again, "Pilates Studio", "Clara");
  await again.goto(`${BASE}/announcements`);
  await again.locator("main ul > li").first().waitFor();
  ok((await again.locator("main ul > li h3").allInnerTexts()).includes("Saved before closing the tab"), `[${n}] changes saved before are still there`);
  await again.goto(`${BASE}/`);
  await again.waitForLoadState("networkidle");
  ok(again.url() === `${BASE}/`, `[${n}] in this tab, / now keeps the dashboard`);
  await finish(again, vp);

  // 3. Another sport this time: the earlier one keeps its changes.
  const third = await tab();
  await openLink(third);
  await choose(third, "Tennis Coaching", "Laura");
  ok((await h1(third)) === "Good afternoon, Laura", `[${n}] a different sport can be chosen on the next visit`);
  await finish(third, vp);

  // 4. Deep links and direct links in a new tab are not sent to the welcome screen.
  const deep = await tab();
  await deep.goto(`${BASE}/calendar`);
  await deep.waitForLoadState("networkidle");
  ok(deep.url() === `${BASE}/calendar` && (await h1(deep)) === "Calendar", `[${n}] a deep link opens its page`);
  await finish(deep, vp);
  const direct = await tab();
  await direct.goto(`${BASE}/demo?sport=basketball`);
  await direct.waitForURL(`${BASE}/`);
  await direct.locator("h1").filter({ hasText: "Maya" }).waitFor();
  ok((await h1(direct)) === "Good afternoon, Maya", `[${n}] a direct link opens its example in a new tab`);
  await finish(direct, vp);

  await context.close();
}
await browser.close();
done();

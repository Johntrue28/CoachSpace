// Direct links to one example (audit R-08): `/demo?sport=<id>` opens that scenario's dashboard
// without showing the four cards, keeps it after a reload, and the Back button does not reopen the
// link. Unknown values show the normal welcome screen, and a plain first visit is unchanged.
import { chromium, BASE, ok, viewports, newPage, finish, done } from "./lib.mjs";
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();

for (const vp of viewports) {
  const n = vp.name;
  const fresh = async () => {
    const page = await newPage(browser, vp, { fresh: true });
    await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
    return page;
  };
  const h1 = async (page) => clean(await page.locator("h1").first().innerText());

  // 1. Each valid link opens its scenario's dashboard, never showing the cards first.
  for (const [id, coach] of [["tennis", "Laura"], ["football", "Daniel"], ["basketball", "Maya"], ["pilates", "Clara"]]) {
    const page = await fresh();
    let sawCards = false;
    await page.exposeFunction("cardsSeen", () => (sawCards = true));
    await page.addInitScript(() => {
      new MutationObserver(() => {
        const list = document.querySelector('[aria-label="Demo examples"]');
        if (list && !document.documentElement.hasAttribute("data-scenario-loading") && list.getBoundingClientRect().height > 0) window.cardsSeen?.();
      }).observe(document, { childList: true, subtree: true, attributes: true });
    });
    await page.goto(`${BASE}/demo?sport=${id}`);
    await page.waitForURL(`${BASE}/`);
    await page.locator("h1").filter({ hasText: coach }).waitFor();
    ok((await h1(page)) === `Good afternoon, ${coach}`, `[${n}] ?sport=${id} opens ${coach}'s dashboard`);
    ok(!sawCards, `[${n}] ?sport=${id} does not show the four cards first`);
    ok((await page.evaluate(() => localStorage.getItem("coachspace-scenario"))) === id, `[${n}] ${id} is remembered in this browser`);
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.locator("h1").filter({ hasText: coach }).waitFor();
    ok((await h1(page)) === `Good afternoon, ${coach}`, `[${n}] ${id} stays after a reload`);
    if (id === "tennis") {
      await page.goBack();
      await page.waitForLoadState("networkidle");
      ok(!page.url().includes("sport="), `[${n}] Back does not reopen the direct link (${page.url()})`);
    }
    await finish(page, vp);
  }

  // 2. A direct link keeps the changes already saved for that scenario.
  {
    const page = await fresh();
    await page.addInitScript(() => {
      if (sessionStorage.getItem("seeded")) return;
      sessionStorage.setItem("seeded", "1");
      localStorage.setItem("coachspace-scenario", "pilates");
    });
    await page.goto(`${BASE}/demo?sport=football`);
    await page.waitForURL(`${BASE}/`);
    await page.locator("h1").filter({ hasText: "Daniel" }).waitFor();
    ok((await page.evaluate(() => localStorage.getItem("coachspace-scenario"))) === "football", `[${n}] a link wins over the example explored last time`);
    await page.waitForTimeout(500);
    ok((await h1(page)) === "Good afternoon, Daniel", `[${n}] and the earlier example does not come back`);
    await finish(page, vp);
  }

  // 3. Invalid values show the normal welcome screen and choose nothing.
  for (const search of ["?sport=golf", "?sport=Tennis", "?sport=", "?sports=tennis", "?sport=%3Cscript%3E"]) {
    const page = await fresh();
    await page.goto(`${BASE}/demo${search}`);
    await page.waitForLoadState("networkidle");
    ok((await h1(page)) === "Try CoachSpace with your sport", `[${n}] ${search} shows the welcome screen`);
    ok((await page.getByRole("list", { name: "Demo examples" }).getByRole("article").count()) === 4, `[${n}] ${search}: four cards`);
    ok((await page.evaluate(() => localStorage.getItem("coachspace-scenario"))) === null, `[${n}] ${search} chooses nothing`);
    await finish(page, vp);
  }

  // 4. A plain first visit is unchanged: / goes to the welcome screen with four cards.
  {
    const page = await fresh();
    await page.goto(`${BASE}/`);
    await page.waitForURL(`${BASE}/demo`);
    await page.waitForLoadState("networkidle");
    ok((await h1(page)) === "Try CoachSpace with your sport", `[${n}] first visit still opens the welcome screen`);
    ok((await page.getByRole("list", { name: "Demo examples" }).getByRole("article").count()) === 4, `[${n}] with the four sports`);
    await finish(page, vp);
  }
}
await browser.close();
done();

// Visitor isolation (audit P0): what each visitor changes stays in their own browser profile.
// Two independent browser contexts stand for two visitors on two devices: A explores Tennis, B
// explores Basketball. Then switching scenarios, repeated resets and reloads, and two tabs of the
// same profile, which share one origin's localStorage (documented limit: they are not isolated from
// each other, they show the same data).
import { chromium, BASE, ok, viewports, finish, done } from "./lib.mjs";
const browser = await chromium.launch();
const vp = viewports[0];
const NOW = new Date("2026-10-14T12:00:00+02:00"); // Wednesday, 12:00

async function visitor() {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, timezoneId: "Europe/Madrid" });
  const page = await context.newPage();
  await page.clock.setFixedTime(NOW);
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
  page.on("dialog", (d) => d.accept());
  return { context, page };
}
const go = async (page, p) => {
  await page.goto(BASE + p);
  await page.waitForLoadState("networkidle");
};
const keys = (page) => page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("coachspace")).sort());
const saved = (page, id) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "null"), `coachspace-demo-v2:${id}`);
const choose = async (page, name) => {
  await go(page, "/demo");
  await page.getByRole("button", { name: `Explore ${name}` }).click();
  await page.waitForURL(`${BASE}/`);
  await page.locator("h1").filter({ hasText: "Good afternoon" }).waitFor();
};
const sessionCancelled = async (page, id) => {
  await go(page, `/calendar/${id}`);
  await page.locator("main h1").waitFor();
  return (await page.locator("main").getByText("Cancelled", { exact: true }).count()) > 0;
};
const cancel = async (page, id) => {
  await go(page, `/calendar/${id}`);
  await page.getByRole("button", { name: "Cancel this session" }).click();
  await page.getByRole("button", { name: "Cancel session", exact: true }).click();
  await page.getByRole("button", { name: "Restore this session" }).waitFor();
};
const announcementTitles = async (page) => {
  await go(page, "/announcements");
  await page.locator("main ul > li").first().waitFor();
  return page.locator("main ul > li h3, main ul > li h2").allInnerTexts();
};
const post = async (page, title) => {
  await go(page, "/announcements/new");
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Announcement").fill("Only visitor B wrote this.");
  await page.getByRole("button", { name: "Post announcement" }).click();
  await page.waitForURL(/\/announcements(\?|$)/);
};
const resetActive = async (page) => {
  await go(page, "/settings?section=demo");
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await page.locator("main").getByRole("status").filter({ hasText: "restored to its fictional demo data" }).first().waitFor();
};

const A = await visitor();
const B = await visitor();
const TENNIS_SESSION = "g4-2026-10-14";
const B_TITLE = "Visitor B's basketball note";

// 1. A opens Tennis and cancels a session; B opens Basketball and posts an announcement.
await choose(A.page, "Tennis Coaching");
await choose(B.page, "Basketball Club");
await cancel(A.page, TENNIS_SESSION);
await post(B.page, B_TITLE);
ok((await saved(A.page, "tennis"))?.schedule?.overrides?.[TENNIS_SESSION]?.cancelled === true, "A's cancellation is saved in A's browser");
ok((await saved(B.page, "basketball"))?.announcements?.some((a) => a.title === B_TITLE), "B's announcement is saved in B's browser");
ok(!(await keys(A.page)).includes("coachspace-demo-v2:basketball"), `A's browser holds nothing of B (${(await keys(A.page)).join(", ")})`);
ok(!(await keys(B.page)).includes("coachspace-demo-v2:tennis"), `B's browser holds nothing of A (${(await keys(B.page)).join(", ")})`);

// 2. Both reload: each sees their own change, and only their own.
ok(await sessionCancelled(A.page, TENNIS_SESSION), "A still sees the cancelled session after a reload");
await A.page.reload();
await A.page.waitForLoadState("networkidle");
ok((await A.page.locator("main").getByText("Cancelled", { exact: true }).count()) > 0, "and after a second reload");
ok((await announcementTitles(B.page)).includes(B_TITLE), "B still sees the announcement after a reload");
await B.page.evaluate(() => localStorage.setItem("coachspace-scenario", "tennis"));
ok(!(await sessionCancelled(B.page, TENNIS_SESSION)), "B's Tennis is untouched by A's cancellation");
await B.page.evaluate(() => localStorage.setItem("coachspace-scenario", "basketball"));

// 3. A resets Tennis: B's data is unchanged.
await resetActive(A.page);
ok(!(await sessionCancelled(A.page, TENNIS_SESSION)), "A's reset restores the session");
ok((await saved(A.page, "tennis")) === null, "A's reset removed A's saved Tennis changes");
ok((await announcementTitles(B.page)).includes(B_TITLE), "B's announcement survives A's reset");

// 4. Switching scenarios does not contaminate: A changes Basketball, Tennis is not affected.
await cancel(A.page, TENNIS_SESSION);
await go(A.page, "/settings?section=demo");
await A.page.getByRole("list", { name: "Demo scenarios" }).getByRole("button", { name: /Basketball Club/ }).click();
await A.page.waitForFunction(() => document.querySelector("[data-active-scenario]")?.getAttribute("data-active-scenario") === "basketball");
const aBasketball = await announcementTitles(A.page);
ok(!aBasketball.includes(B_TITLE), "A's Basketball never shows B's announcement");
await go(A.page, "/announcements/new");
await A.page.getByLabel("Title").fill("A in basketball");
await A.page.getByLabel("Announcement").fill("Written in Basketball by A.");
await A.page.getByRole("button", { name: "Post announcement" }).click();
await A.page.waitForURL(/\/announcements(\?|$)/);
const tennisSaved = await saved(A.page, "tennis");
const basketballSaved = await saved(A.page, "basketball");
ok(tennisSaved?.scenario === "tennis" && basketballSaved?.scenario === "basketball", "each saved state is tagged with its own scenario");
ok(!tennisSaved.announcements.some((a) => a.title === "A in basketball"), "Basketball's announcement is not in Tennis");
ok(!basketballSaved.schedule.overrides[TENNIS_SESSION], "Tennis's cancellation is not in Basketball");
await go(A.page, "/settings?section=demo");
await A.page.getByRole("list", { name: "Demo scenarios" }).getByRole("button", { name: /Tennis Coaching/ }).click();
await A.page.waitForFunction(() => document.querySelector("[data-active-scenario]")?.getAttribute("data-active-scenario") === "tennis");
ok(await sessionCancelled(A.page, TENNIS_SESSION), "back in Tennis, A's own Tennis change is still there");
ok(!(await announcementTitles(A.page)).includes("A in basketball"), "and nothing from Basketball");

// 5. Repeated resets and reloads restore the same seed, without duplicates.
const seedTitles = [];
for (let i = 0; i < 3; i++) {
  await resetActive(A.page);
  await A.page.reload();
  await A.page.waitForLoadState("networkidle");
  const titles = await announcementTitles(A.page);
  seedTitles.push(titles.join("|"));
  ok(new Set(titles).size === titles.length && titles.length === 4, `reset ${i + 1}: the four seeded announcements, no duplicates (${titles.length})`);
}
ok(new Set(seedTitles).size === 1, "every reset restores the same announcements");
await go(A.page, "/chat/c-g4");
const messages = await A.page.locator("main [data-message], main li").count();
await resetActive(A.page);
await go(A.page, "/chat/c-g4");
ok((await A.page.locator("main [data-message], main li").count()) === messages, `chat seed is not duplicated by a reset (${messages})`);
ok(!(await sessionCancelled(A.page, TENNIS_SESSION)), "the session is back after the resets");
ok((await saved(A.page, "basketball"))?.announcements?.some((a) => a.title === "A in basketball"), "resetting Tennis keeps A's Basketball changes");

// 6. Two tabs of the same profile share this browser's storage: a change in one appears in the other
//    without a reload, and a tab that was left open does not overwrite it with older data.
const tab1 = A.page;
const tab2 = await A.context.newPage();
await tab2.clock.setFixedTime(NOW);
tab2.errors = [];
tab2.on("pageerror", (e) => tab2.errors.push(e.message));
tab2.on("dialog", (d) => d.accept());
await go(tab2, "/announcements");
await tab2.locator("main ul > li").first().waitFor();
await cancel(tab1, TENNIS_SESSION);
await go(tab1, "/calendar");
// tab2 is still open on the announcements page and posts something.
await tab2.getByRole("link", { name: "New announcement" }).first().click();
await tab2.getByLabel("Title").fill("Posted in the second tab");
await tab2.getByLabel("Announcement").fill("Two tabs, one browser.");
await tab2.getByRole("button", { name: "Post announcement" }).click();
await tab2.waitForURL(/\/announcements(\?|$)/);
const both = await saved(tab2, "tennis");
ok(both?.schedule?.overrides?.[TENNIS_SESSION]?.cancelled === true, "the second tab did not overwrite the first tab's cancellation");
ok(both?.announcements?.some((a) => a.title === "Posted in the second tab"), "and its own announcement is saved");
ok((await announcementTitles(tab1)).includes("Posted in the second tab"), "the first tab shows the second tab's announcement");
ok(tab2.errors.length === 0, `second tab: no errors ${tab2.errors.join(" | ")}`);
await tab2.close();

ok(B.page.errors.length === 0, `B: no errors ${B.page.errors.join(" | ")}`);
await finish(A.page, vp);
await A.context.close();
await B.context.close();
await browser.close();
done();

// Announcements (D-050): board layout, filter, the form beside the list from 1280 px, the
// New announcement page on phones, and the participant's read-only announcements.
import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();

for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  const n = vp.name;
  const wide = vp.width >= 1280;
  const main = page.locator("main");
  const go = async (p) => {
    await page.goto(BASE + p);
    await page.waitForLoadState("networkidle");
  };
  const items = () => main.locator("ul > li article");
  const composer = () => main.getByRole("region", { name: "Create announcement" });

  // 1. Board.
  await go("/announcements");
  ok((await page.locator("h1").innerText()) === "Announcements", `[${n}] title`);
  ok((await main.getByRole("link", { name: "New announcement" }).getAttribute("href")) === "/announcements/new", `[${n}] New announcement link`);
  ok((await items().count()) === 4, `[${n}] four announcements`);
  const first = clean(await items().first().innerText());
  ok(first.startsWith("Junior tournament on Saturday Laura Gomez · U16 Development ·"), `[${n}] card shows title, author, group and time (${first.slice(0, 70)})`);
  ok((await main.getByRole("group", { name: "Filter by group" }).getByRole("button").count()) === 6, `[${n}] filter: All + five groups`);
  ok((await composer().isVisible()) === wide, `[${n}] ${wide ? "form beside the list" : "no side form on smaller screens"}`);
  await page.screenshot({ path: `${OUT}/annpage-${n}-board.png`, fullPage: true });

  // 2. Post from the side form (wide) or the New announcement page.
  if (wide) {
    await composer().getByRole("button", { name: "Publish announcement" }).click();
    ok((await composer().getByRole("alert").count()) === 2, `[${n}] side form validates`);
    await composer().getByLabel("Audience").selectOption("g3");
    await composer().getByLabel("Title").fill("Court 3 resurfaced");
    await composer().getByLabel("Message").fill("Court 3 is ready again from Friday.");
    await composer().getByRole("button", { name: "Publish announcement" }).click();
    await page.waitForURL(/\/announcements\?group=g3$/, { waitUntil: "commit" });
    ok((await composer().getByLabel("Audience").inputValue()) === "g3", `[${n}] side form follows the filter`);
  } else {
    await main.getByRole("link", { name: "New announcement" }).click();
    await page.waitForURL(`${BASE}/announcements/new`);
    await page.getByLabel("For").selectOption("g3");
    await page.getByLabel("Title").fill("Court 3 resurfaced");
    await page.getByLabel("Announcement").fill("Court 3 is ready again from Friday.");
    await page.getByRole("button", { name: "Post announcement" }).click();
    // The form returns to the page it came from (D-035): the board without a filter.
    await page.waitForURL(`${BASE}/announcements`, { waitUntil: "commit" });
  }
  await main.getByRole("status").filter({ hasText: /\S/ }).waitFor();
  ok((await main.getByRole("status").filter({ hasText: /\S/ }).innerText()).includes("have not been notified"), `[${n}] honest confirmation`);
  ok((await items().first().locator("h3").innerText()) === "Court 3 resurfaced", `[${n}] new announcement first`);
  if (wide) ok((await main.getByRole("group", { name: "Filter by group" }).getByRole("button", { name: "Adult Beginners" }).getAttribute("aria-pressed")) === "true", `[${n}] board filtered to the group`);

  // 3. Participant: read-only announcements for Jordan's groups, from the home page.
  await go("/me");
  await main.getByRole("region", { name: "Announcements" }).getByRole("link", { name: /See all/ }).click();
  await page.waitForURL(`${BASE}/me/announcements`);
  await page.waitForLoadState("networkidle");
  ok((await page.locator("h1").innerText()) === "Announcements", `[${n}] participant announcements page`);
  ok((await mainNav(page).getByRole("link", { name: "Home" }).getAttribute("aria-current")) === "page", `[${n}] Home stays current in the participant navigation`);
  const chips = await main.getByRole("group", { name: "Filter by group" }).getByRole("button").allInnerTexts();
  ok(chips.join("|") === "All|Adult Improvers|Club Competition Team", `[${n}] participant filter has own groups only (${chips.join("|")})`);
  const titles = await items().locator("h3").allInnerTexts();
  ok(!titles.includes("Court 3 resurfaced") && !titles.includes("Junior tournament on Saturday"), `[${n}] other groups' announcements hidden`);
  ok(
    (await main.getByRole("link", { name: /New announcement|Post the first one/ }).count()) === 0 &&
      (await main.getByRole("button", { name: /Reset demo data|Publish announcement/ }).count()) === 0,
    `[${n}] no coach actions for the participant`,
  );
  await page.screenshot({ path: `${OUT}/annpage-${n}-participant.png`, fullPage: true });

  // Clean up.
  await go("/announcements");
  page.once("dialog", (d) => d.accept());
  await main.getByRole("button", { name: "Reset demo data" }).click();
  await finish(page, vp);
}
await browser.close();
done();

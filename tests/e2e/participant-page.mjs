// Participant experience (D-052): home layout and sections, My Videos cards and filters, the video
// page, and that the participant view stays read-only and clearly a demo.
import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();

for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00")); // Wednesday, 12:00
  const n = vp.name;
  const wide = vp.width >= 1280;
  const main = page.locator("main");
  const go = async (p) => {
    await page.goto(BASE + p);
    await page.waitForLoadState("networkidle");
  };

  // 1. Home: sections and their links.
  await go("/me");
  ok((await page.locator("h1").innerText()) === "Good afternoon, Jordan", `[${n}] greeting`);
  ok(await page.getByText("Jordan Hale, a fictional participant").filter({ visible: true }).first().isVisible(), `[${n}] demo identity stated`);
  const upcoming = main.getByRole("region", { name: "Upcoming sessions" });
  const next = (await upcoming.getByRole("link", { name: /–/ }).allInnerTexts()).map(clean);
  ok(next.length === 2 && next.every((t) => /Senior Basketball|Morning Pilates/.test(t)), `[${n}] upcoming sessions from own groups (${next.length})`);
  ok((await upcoming.getByRole("link", { name: /–/ }).first().getAttribute("href")).startsWith("/me/calendar/"), `[${n}] upcoming sessions open in the participant view`);
  ok((await upcoming.getByRole("link", { name: "My calendar" }).getAttribute("href")) === "/me/calendar", `[${n}] link to my calendar`);
  const videos = main.getByRole("region", { name: "My Videos" });
  const videoLinks = await videos.getByRole("link").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  ok(videoLinks.includes("/me/videos") && videoLinks.some((h) => /^\/me\/videos\/e\d+$/.test(h)), `[${n}] My Videos preview links (${videoLinks.join(",")})`);
  ok(clean(await videos.innerText()).includes("The Hundred"), `[${n}] assigned exercise in the preview`);
  if (wide) {
    const left = await main.getByRole("region", { name: "My groups" }).boundingBox();
    const right = await videos.boundingBox();
    ok(left.x + left.width <= right.x, `[${n}] two columns from 1280 px`);
  }
  await page.screenshot({ path: `${OUT}/mepage-${n}-home.png`, fullPage: true });

  // 2. My Videos: cards, filters and the video page.
  await mainNav(page).getByRole("link", { name: "My Videos" }).click();
  await page.waitForURL(`${BASE}/me/videos`);
  await page.waitForLoadState("networkidle");
  ok((await page.locator("h1").innerText()) === "My Videos", `[${n}] My Videos title`);
  const cards = main.locator("article");
  ok((await cards.count()) === 2, `[${n}] two assigned exercises`);
  const hundred = clean(await cards.filter({ hasText: "The Hundred" }).innerText());
  ok(hundred.includes("STRENGTH") && hundred.includes("5 min") && hundred.includes("Watch video"), `[${n}] card shows category, minutes and action (${hundred})`);
  await main.getByRole("group", { name: "Category" }).getByRole("button", { name: "Mobility", exact: true }).click();
  ok(await main.getByText("No exercises match your filters.").isVisible(), `[${n}] empty filter state`);
  await main.getByRole("group", { name: "Category" }).getByRole("button", { name: "All categories" }).click();
  await page.screenshot({ path: `${OUT}/mepage-${n}-videos.png`, fullPage: true });
  await main.getByRole("link", { name: "Open The Hundred" }).click();
  await page.waitForURL(`${BASE}/me/videos/e8`);
  await page.locator("h1").waitFor();
  ok((await page.locator("h1").innerText()) === "The Hundred", `[${n}] video page`);
  ok((await main.getByRole("link", { name: /Watch on YouTube/ }).getAttribute("target")) === "_blank", `[${n}] video opens on YouTube`);
  ok((await main.getByRole("link", { name: /Edit|Assign/ }).count()) === 0, `[${n}] no editing for the participant`);

  // 3. Participant navigation and limits.
  ok((await mainNav(page).getByRole("link", { name: "My Videos" }).getAttribute("aria-current")) === "page", `[${n}] My Videos stays current`);
  ok((await mainNav(page).getByRole("link", { name: /Settings|Attendance|Groups|Library/ }).count()) === 0, `[${n}] no coach sections in the participant navigation`);
  const settings = await page.request.get(`${BASE}/settings`);
  ok(settings.ok(), `[${n}] coach pages still exist`);
  await go("/me");
  ok((await main.getByRole("link", { name: /Settings|Take attendance|Add exercise|New announcement/ }).count()) === 0, `[${n}] no coach actions on the participant home`);

  await finish(page, vp);
}
await browser.close();
done();

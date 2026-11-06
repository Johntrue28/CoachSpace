// Participant experience (D-052, D-071, D-073): the agenda home with answers, the Exercises list and
// filters, the video page, and that the participant view stays read-only and clearly a demo.
import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();

for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00")); // Wednesday, 12:00
  const n = vp.name;
  const main = page.locator("main");
  const go = async (p) => {
    await page.goto(BASE + p);
    await page.waitForLoadState("networkidle");
  };

  // 1. Home (D-071): the next sessions with the one-tap answer, then exercises and announcements.
  await go("/me");
  ok((await page.locator("h1").innerText()) === "Hi Jordan", `[${n}] greeting`);
  ok(clean(await main.innerText()).includes("Demo with fictional data. Your answers stay in this browser."), `[${n}] demo stated`);
  const upcoming = main.getByRole("region", { name: "My next sessions" });
  const next = (await upcoming.locator("ul > li").allInnerTexts()).map(clean);
  ok(next.length >= 4 && next.every((t) => /Adult Improvers|Club Competition Team/.test(t)), `[${n}] next sessions from own groups (${next.length})`);
  ok((await upcoming.getByRole("link").first().getAttribute("href")).startsWith("/me/calendar/"), `[${n}] sessions open in the participant view`);
  ok(/\d+ sessions? waiting for your answer/.test(clean(await main.innerText())), `[${n}] how many sessions wait for an answer`);
  ok((await main.getByRole("link", { name: "Open my calendar" }).getAttribute("href")) === "/me/calendar", `[${n}] link to my calendar`);
  const videos = main.getByRole("region", { name: "My exercises" });
  const videoLinks = await videos.getByRole("link").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  ok(videoLinks.includes("/me/videos") && videoLinks.some((h) => /^\/me\/videos\/e\d+$/.test(h)), `[${n}] exercises preview links (${videoLinks.join(",")})`);
  ok(clean(await videos.innerText()).includes("Split-step and recovery footwork"), `[${n}] assigned exercise in the preview`);
  await page.screenshot({ path: `${OUT}/mepage-${n}-home.png`, fullPage: true });

  // 2. Exercises (D-073): one list of rows, filters and the video page.
  await mainNav(page).getByRole("link", { name: "Exercises" }).click();
  await page.waitForURL(`${BASE}/me/videos`);
  await page.waitForLoadState("networkidle");
  ok((await page.locator("h1").innerText()) === "Exercises", `[${n}] Exercises title, as in the navigation`);
  const cards = main.getByRole("list", { name: "Your exercises" }).getByRole("listitem");
  ok((await cards.count()) === 4, `[${n}] four assigned exercises`);
  const split = clean(await cards.filter({ hasText: "Split-step and recovery footwork" }).innerText());
  ok(split.includes("Conditioning · 10 min") && !split.includes("Video") && !split.includes("Watch"), `[${n}] row shows category and minutes, no video for a search link (${split})`);
  await main.getByRole("group", { name: "Category" }).getByRole("button", { name: "Mobility", exact: true }).click().catch(() => {});
  if (await main.getByText("No exercises match your filters.").count()) ok(true, `[${n}] empty filter state`);
  else ok((await main.getByRole("group", { name: "Category" }).getByRole("button", { name: "Mobility", exact: true }).count()) === 0, `[${n}] only the categories assigned to the player are offered`);
  await main.getByRole("group", { name: "Category" }).getByRole("button", { name: "All categories" }).click();
  await page.screenshot({ path: `${OUT}/mepage-${n}-videos.png`, fullPage: true });
  await main.getByRole("link", { name: "Open Split-step and recovery footwork" }).click();
  await page.waitForURL(`${BASE}/me/videos/e5`);
  await page.locator("h1").waitFor();
  ok((await page.locator("h1").innerText()) === "Split-step and recovery footwork", `[${n}] video page`);
  const search = main.getByRole("link", { name: /Find example videos on YouTube \(opens a search\)/ });
  ok((await search.getAttribute("target")) === "_blank" && (await main.getByRole("link", { name: /Watch on/ }).count()) === 0, `[${n}] example video search opens on YouTube, not presented as a video`);
  ok(clean(await main.innerText()).includes("Your coach has not chosen a specific video yet."), `[${n}] says no specific video was chosen`);
  ok((await main.getByRole("link", { name: /Edit|Assign/ }).count()) === 0, `[${n}] no editing for the participant`);

  // 3. Participant navigation and limits.
  ok((await mainNav(page).getByRole("link", { name: "Exercises" }).getAttribute("aria-current")) === "page", `[${n}] Exercises stays current`);
  ok((await mainNav(page).getByRole("link", { name: /Settings|Attendance|Groups|Library/ }).count()) === 0, `[${n}] no coach sections in the participant navigation`);
  const settings = await page.request.get(`${BASE}/settings`);
  ok(settings.ok(), `[${n}] coach pages still exist`);
  await go("/me");
  ok((await main.getByRole("link", { name: /Settings|Take attendance|Add exercise|New announcement/ }).count()) === 0, `[${n}] no coach actions on the participant home`);

  await finish(page, vp);
}
await browser.close();
done();

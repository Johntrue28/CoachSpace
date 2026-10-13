// Demo Studio and demo scenarios (D-053): the four cards, preview without changes, activation,
// every page following the active scenario, persistence after a reload, separate saved data per
// scenario, return to the default, resets with confirmation, stale data, and that the Studio stays
// out of the normal navigation.
import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();

for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00")); // Wednesday, 12:00
  const n = vp.name;
  const desktop = vp.width >= 1024;
  const main = page.locator("main");
  const go = async (p) => {
    await page.goto(BASE + p);
    await page.waitForLoadState("networkidle");
  };
  const active = () => main.getAttribute("data-active-scenario");
  const stored = (key) => page.evaluate((k) => localStorage.getItem(k), key);
  const h1 = async () => clean(await page.locator("h1").first().innerText());
  const cards = () => main.getByRole("article");
  const filterSummary = async () => clean(await main.getByRole("button", { name: /^Groups shown:/ }).innerText()).replace(/^Groups shown: ?/, "");

  // 1. The Studio: four scenario cards, Tennis Club active by default.
  await go("/demo");
  ok((await h1()) === "Demo Studio", `[${n}] Demo Studio page`);
  ok((await active()) === "tennis", `[${n}] Tennis Club is the default scenario`);
  const titles = await cards().locator("h3").allInnerTexts();
  ok(titles.join("|") === "Tennis Club|Football Academy|Basketball Club|Pilates Studio", `[${n}] four scenario cards (${titles.join("|")})`);
  const covers = await cards().locator('svg[role="img"]').evaluateAll((els) => els.map((e) => e.getAttribute("aria-label") ?? ""));
  ok(covers.length === 4 && covers.every((a) => a.length > 30), `[${n}] each card has a described cover illustration`);
  ok(clean(await cards().first().innerText()).includes("Active"), `[${n}] the active scenario is marked`);
  ok((await cards().first().getByRole("link", { name: "Open dashboard" }).count()) === 1, `[${n}] the active card opens the dashboard`);
  ok(clean(await cards().nth(3).innerText()).includes("Reformer Pilates — Beginners"), `[${n}] cards list example groups`);
  ok(clean(await main.innerText()).includes("anyone with the link can open it"), `[${n}] states that the Studio is not protected`);
  await page.screenshot({ path: `${OUT}/scenarios-${n}-studio.png`, fullPage: true });

  // 2. Not part of the normal navigation; reachable from Settings → General.
  ok((await mainNav(page).getByRole("link", { name: /Demo Studio/ }).count()) === 0, `[${n}] not in the main navigation`);
  await go("/settings?section=general");
  await main.getByRole("link", { name: "Open Demo Studio" }).waitFor();
  ok((await main.getByRole("link", { name: "Open Demo Studio" }).getAttribute("href")) === "/demo", `[${n}] Settings → General links to the Studio`);
  ok(clean(await main.innerText()).includes("Active now: Tennis Club."), `[${n}] Settings names the active scenario`);

  // 3. A change in Tennis Club, to check later that scenarios keep separate data.
  await go("/calendar");
  await main.getByRole("button", { name: /^Groups shown:/ }).click();
  await main.getByRole("group", { name: "Show sessions from" }).getByRole("checkbox", { name: "U16 Development", exact: true }).click();
  ok((await filterSummary()) === "4 of 5 groups", `[${n}] Tennis Club: one group hidden in the calendar`);

  // 4. Preview changes nothing.
  await go("/demo");
  await main.getByRole("button", { name: "Preview Basketball Club" }).click();
  const preview = main.getByRole("region", { name: "Scenario preview" });
  await preview.waitFor();
  ok(clean(await preview.locator("h2").innerText()) === "Basketball Club", `[${n}] preview opens`);
  const previewText = clean(await preview.innerText());
  ok(previewText.includes("Maya Brooks") && previewText.includes("U18 Performance") && previewText.includes("Two-ball dribbling"), `[${n}] preview shows coach, groups and exercises`);
  ok((await active()) === "tennis" && (await stored("coachspace-scenario")) === null, `[${n}] previewing does not activate`);
  await main.getByRole("button", { name: "Close preview" }).click();
  ok((await preview.count()) === 0, `[${n}] preview closes`);

  // 5. Activate Football Academy.
  await main.getByRole("button", { name: "Activate Football Academy" }).click();
  await page.waitForFunction(() => document.querySelector("main")?.getAttribute("data-active-scenario") === "football");
  ok((await main.getByRole("status").first().innerText()).includes("Football Academy is now active"), `[${n}] activation is confirmed`);
  ok((await page.evaluate(() => document.activeElement?.id)) === "active-heading", `[${n}] focus moves to the active scenario`);
  ok((await stored("coachspace-scenario")) === "football", `[${n}] the choice is remembered in this browser`);
  ok(clean(await cards().nth(1).innerText()).includes("Active"), `[${n}] Football card marked active`);
  await page.screenshot({ path: `${OUT}/scenarios-${n}-football-active.png`, fullPage: false });

  // 6. Every page follows the active scenario.
  await main.getByRole("link", { name: "Open the coach dashboard" }).click();
  await page.waitForURL(`${BASE}/`);
  await page.waitForLoadState("networkidle");
  await page.locator("h1").filter({ hasText: "Daniel" }).waitFor({ timeout: 5000 }).catch(() => {});
  ok((await h1()) === "Good afternoon, Daniel", `[${n}] dashboard greets the football coach (${await h1()})`);
  if (desktop) ok(clean(await page.getByRole("complementary").first().innerText()).includes("Northgate Football Academy"), `[${n}] sidebar shows the academy`);
  const dashboard = clean(await main.innerText());
  ok(!/Adult Improvers|Club Competition|Laura Gomez/.test(dashboard), `[${n}] no tennis data on the dashboard`);

  await go("/groups");
  const groupNames = await main.locator('ul a[href^="/groups/"]').allInnerTexts();
  ok(clean(await main.innerText()).includes("4 groups · 33 participants"), `[${n}] football groups and participants`);
  ok(groupNames.length === 4 && ["U16 Development", "U18 Academy", "Senior Amateur", "Adult Recreational"].every((g, i) => clean(groupNames[i]).includes(g)), `[${n}] football group names`);
  await go("/groups/g1");
  ok(clean(await main.innerText()).includes("Coach Daniel Reyes · 10 participants · 18 places"), `[${n}] football group page`);

  await go("/calendar");
  ok((await filterSummary()) === "All groups", `[${n}] football has its own calendar filter`);
  ok(
    (await main.getByRole("button", { name: /^Wednesday 14 Oct:/ }).getAttribute("aria-label")) === "Wednesday 14 Oct: 1 session",
    `[${n}] football sessions in the calendar`,
  );
  await main.getByRole("button", { name: /^Groups shown:/ }).click();
  const boxes = await main.getByRole("group", { name: "Show sessions from" }).getByRole("checkbox").evaluateAll((els) => els.map((e) => e.closest("label")?.textContent?.trim()));
  ok(boxes.join("|") === "All groups|U16 Development|U18 Academy|Senior Amateur|Adult Recreational", `[${n}] filter lists football groups (${boxes.join("|")})`);
  await page.keyboard.press("Escape");

  await go("/library");
  const library = clean(await main.innerText());
  ok(library.includes("Rondo 4v1") && library.includes("Scanning: take a picture") && !library.includes("Serve placement targets"), `[${n}] football exercises only`);
  ok((await main.getByLabel("Sport").locator("option").allInnerTexts()).join("|").includes("Football") && !(await main.getByLabel("Sport").locator("option").allInnerTexts()).join("|").includes("Tennis"), `[${n}] sport filter offers football`);
  await go("/library/e6");
  ok(clean(await main.innerText()).includes("Coaching points") && clean(await main.innerText()).includes("The nearest player presses"), `[${n}] exercise coaching details`);
  await go("/announcements");
  ok(clean(await main.locator("ul > li article h3").first().innerText()) === "Friendly on Saturday", `[${n}] football announcements`);
  await go("/chat");
  ok(clean(await main.innerText()).includes("Chris Duval"), `[${n}] football conversations`);
  await go("/attendance");
  ok(clean(await main.innerText()).includes("U18 Academy"), `[${n}] attendance lists football groups`);

  // 7. Participant view in the same scenario.
  await page.getByRole("navigation", { name: "Demo view" }).getByRole("link", { name: "Participant" }).click();
  await page.waitForURL(`${BASE}/me`);
  await page.waitForLoadState("networkidle");
  const me = clean(await main.innerText());
  ok((await h1()) === "Good afternoon, Jordan" && me.includes("Senior Amateur") && me.includes("Adult Recreational") && !me.includes("Adult Improvers"), `[${n}] participant view uses football groups`);
  await page.getByRole("navigation", { name: "Demo view" }).getByRole("link", { name: "Coach" }).click();
  await page.waitForURL(`${BASE}/`);

  // 8. The scenario survives a reload, and the page is shown once it is applied.
  await page.reload();
  await page.waitForLoadState("networkidle");
  ok((await h1()) === "Good afternoon, Daniel", `[${n}] still football after a reload`);
  ok(!(await page.evaluate(() => document.documentElement.hasAttribute("data-scenario-loading"))), `[${n}] page visible after the scenario is applied`);

  // 9. Pilates: instructor, places, safety note and studio words for the plan blocks.
  await go("/demo");
  await main.getByRole("button", { name: "Activate Pilates Studio" }).click();
  await page.waitForFunction(() => document.querySelector("main")?.getAttribute("data-active-scenario") === "pilates");
  await go("/groups/g1");
  ok(clean(await main.innerText()).includes("Instructor Clara Hughes · 8 participants · 10 places"), `[${n}] Pilates class with instructor and places`);
  await go("/library/e2");
  ok((await h1()) === "The Hundred" && clean(await main.innerText()).includes("not medical advice"), `[${n}] Pilates exercise with a safety note`);
  await go("/library/plans/t-reformer");
  await main.getByText("Centring", { exact: true }).filter({ visible: true }).first().waitFor();
  ok((await main.getByText("Main sequence", { exact: true }).filter({ visible: true }).count()) === 1, `[${n}] plan blocks in studio words`);

  // 10. Basketball, then back to the default: Tennis Club kept its own change.
  await go("/demo");
  await main.getByRole("button", { name: "Activate Basketball Club" }).click();
  await page.waitForFunction(() => document.querySelector("main")?.getAttribute("data-active-scenario") === "basketball");
  await go("/");
  ok((await h1()) === "Good afternoon, Maya", `[${n}] basketball dashboard`);
  await go("/demo");
  await main.getByRole("button", { name: /^Return to Tennis Club/ }).click();
  await page.waitForFunction(() => document.querySelector("main")?.getAttribute("data-active-scenario") === "tennis");
  await go("/calendar");
  ok((await filterSummary()) === "4 of 5 groups", `[${n}] Tennis Club kept its own saved changes`);

  // 11. Reset one scenario (confirmed), then all of them.
  await go("/demo");
  ok(clean(await main.getByRole("region", { name: "Demo data in this browser" }).innerText()).includes("Has changes saved in this browser"), `[${n}] saved changes are listed`);
  page.once("dialog", (d) => d.dismiss());
  await main.getByRole("button", { name: "Reset Tennis Club" }).click();
  ok((await stored("coachspace-demo-v2:tennis")) !== null, `[${n}] cancelling the confirmation keeps the data`);
  let message = "";
  page.once("dialog", (d) => {
    message = d.message();
    d.accept();
  });
  await main.getByRole("button", { name: "Reset Tennis Club" }).click();
  ok(message.startsWith("Reset Tennis Club?") && message.includes("The other scenarios are not affected"), `[${n}] reset asks for confirmation`);
  ok((await stored("coachspace-demo-v2:tennis")) === null, `[${n}] Tennis Club reset`);
  await go("/calendar");
  ok((await filterSummary()) === "All groups", `[${n}] the reset restores the fictional data`);
  await go("/demo");
  page.once("dialog", (d) => d.accept());
  await main.getByRole("button", { name: "Reset all scenarios" }).click();
  await main.getByRole("status").filter({ hasText: "All scenarios were reset" }).first().waitFor();
  ok((await stored("coachspace-scenario")) === null && (await active()) === "tennis", `[${n}] reset all returns to Tennis Club`);
  const keys = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("coachspace-demo-v2:")));
  ok(keys.length === 0 || keys.every((k) => k === "coachspace-demo-v2:tennis"), `[${n}] no other scenario data left (${keys.join(",")})`);

  // 12. Stale or invalid data is ignored safely.
  await page.evaluate(() => {
    localStorage.setItem("coachspace-scenario", "rugby");
    localStorage.setItem("coachspace-demo-v2:football", JSON.stringify({ scenario: "tennis", exercises: [], assignments: [] }));
  });
  await go("/");
  ok((await h1()) === "Good afternoon, Laura", `[${n}] an unknown scenario falls back to Tennis Club`);
  await page.evaluate(() => localStorage.setItem("coachspace-scenario", "football"));
  await go("/library");
  ok(clean(await main.innerText()).includes("Rondo 4v1"), `[${n}] data saved under the wrong scenario is ignored`);
  await page.evaluate(() => localStorage.clear());

  await finish(page, vp);
}
await browser.close();
done();

// The welcome screen and demo scenarios (D-053, D-055): a first visit to / opens the welcome screen,
// each of the four cards opens its scenario, back and forward work, the dashboard introduction can be
// closed for good, Settings → Demo switches scenario, every page follows the active scenario,
// persistence after a reload, separate saved data per scenario, resets with confirmation, and stale data.
import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav, homeTitle, ORGS } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();

for (const vp of viewports) {
  // A first-time visitor: nothing saved in this browser.
  const page = await newPage(browser, vp, { fresh: true });
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00")); // Wednesday, 12:00
  const n = vp.name;
  const desktop = vp.width >= 1024;
  const main = page.locator("main");
  const go = async (p) => {
    await page.goto(BASE + p);
    await page.waitForLoadState("networkidle");
  };
  const stored = (key) => page.evaluate((k) => localStorage.getItem(k), key);
  const h1 = async () => { await page.locator("h1").first().waitFor(); return homeTitle(page); };
  const cards = () => main.getByRole("list", { name: "Demo examples" }).getByRole("article");
  const filterSummary = async () => clean(await main.getByRole("button", { name: /^Groups shown:/ }).innerText()).replace(/^Groups shown: ?/, "");
  const dashboardOf = async (first) => {
    await page.waitForURL(`${BASE}/`);
    await page.locator("h1").locator("xpath=preceding-sibling::p[1]").filter({ hasText: ORGS[first] }).waitFor({ timeout: 5000 }).catch(() => {});
    return h1();
  };
  const settingsDemo = async () => {
    await go("/settings");
    await main.getByRole("heading", { name: "Demo scenario" }).waitFor();
  };
  const switchTo = async (name, id) => {
    await settingsDemo();
    await main.getByRole("list", { name: "Demo scenarios" }).getByRole("button", { name: new RegExp(name) }).click();
    await page.waitForFunction((s) => document.querySelector("[data-active-scenario]")?.getAttribute("data-active-scenario") === s, id);
  };

  // 1. The first visit to / opens the welcome screen, before the rest of the app.
  await page.goto(`${BASE}/`);
  await page.waitForURL(`${BASE}/demo`);
  await page.waitForLoadState("networkidle");
  ok((await h1()) === "Try CoachSpace with your sport", `[${n}] a first visit to / opens the welcome screen`);
  ok((await mainNav(page).count()) === 0 && (await page.getByRole("navigation", { name: /^Demo view/ }).count()) === 0, `[${n}] the welcome screen has no app navigation`);
  const titles = await cards().locator("h2").allInnerTexts();
  ok(titles.join("|") === "Tennis Coaching|Football Academy|Basketball Club", `[${n}] three sport cards (${titles.join("|")})`);
  // Each card's cover is a photograph with a description since D-074.
  const covers = await cards().locator("img").evaluateAll((els) => els.map((e) => e.getAttribute("alt") ?? ""));
  ok(covers.length === 3 && covers.every((a) => a.length > 30 && a.startsWith("Photo of")), `[${n}] each card has a described photo`);
  const buttons = await cards().getByRole("link").evaluateAll((els) => els.map((e) => ({ name: e.textContent.trim(), h: e.getBoundingClientRect().height })));
  ok(
    buttons.map((b) => b.name).join("|") === "Explore Tennis Coaching|Explore Football Academy|Explore Basketball Club" && buttons.every((b) => b.h >= 44),
    `[${n}] one clear action per card, at least 44 px tall (${buttons.map((b) => Math.round(b.h)).join(",")})`,
  );
  ok(clean(await cards().nth(2).innerText()).includes("ball handling, shooting and defence drills"), `[${n}] cards say what the visitor will explore`);
  const welcomeText = clean(await main.innerText());
  ok(welcomeText.includes("No sign-in needed") && welcomeText.includes("nothing you do is sent to anyone"), `[${n}] honest about sign-in and delivery`);
  ok(!welcomeText.includes("Explored last time"), `[${n}] nothing marked on a first visit`);
  ok(!(await page.evaluate(() => document.documentElement.hasAttribute("data-scenario-loading"))), `[${n}] welcome screen visible`);
  await page.screenshot({ path: `${OUT}/scenarios-${n}-welcome.png`, fullPage: true });

  // 2. A shared link to another page opens that page, not the welcome screen.
  await go("/calendar");
  ok(page.url() === `${BASE}/calendar` && (await h1()) === "Calendar", `[${n}] a deep link is not redirected`);

  // 3. Choosing Tennis Coaching opens its dashboard with a short introduction.
  await go("/demo");
  await cards().first().getByRole("link", { name: "Explore Tennis Coaching" }).click();
  ok((await dashboardOf("Laura")) === "Home · Laura Gomez Tennis", `[${n}] Tennis Coaching opens the tennis dashboard`);
  ok((await stored("coachspace-scenario")) === "tennis", `[${n}] the choice is remembered in this browser`);
  // The short, dismissible demo guide on Home (D-071).
  const intro = main.getByRole("region", { name: "About this demo" });
  await intro.waitFor({ timeout: 5000 }).catch(() => {});
  ok(await intro.isVisible(), `[${n}] demo guide shown`);
  ok(clean(await intro.innerText()).includes("you are Laura Gomez"), `[${n}] the guide says who the visitor is`);
  const introLinks = await intro.getByRole("link").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  ok(introLinks.length === 3 && /^\/calendar\/g\d-2026-10-14$/.test(introLinks[0]) && introLinks[1] === "/me" && introLinks[2] === "/library", `[${n}] three things to try (${introLinks.join(", ")})`);
  ok(clean(await intro.innerText()).includes("nothing is sent to anyone"), `[${n}] the guide is honest about the demo`);
  await page.screenshot({ path: `${OUT}/scenarios-${n}-intro.png`, fullPage: false });

  // 4. Back returns to the welcome screen (the last choice marked); forward to the dashboard.
  await page.goBack();
  await page.waitForURL(`${BASE}/demo`);
  await cards().first().getByText("Explored last time").waitFor({ timeout: 5000 }).catch(() => {});
  ok((await cards().first().getByText("Explored last time").count()) === 1, `[${n}] back shows the welcome screen with the last choice`);
  await page.goForward();
  ok((await dashboardOf("Laura")) === "Home · Laura Gomez Tennis", `[${n}] forward returns to the dashboard`);
  await page.reload();
  await page.waitForLoadState("networkidle");
  ok(page.url() === `${BASE}/` && (await h1()) === "Home · Laura Gomez Tennis", `[${n}] reloading / keeps the dashboard`);

  // 5. Closing the introduction is remembered.
  await intro.getByRole("button", { name: "Close the demo guide" }).click();
  ok(!(await intro.isVisible()), `[${n}] introduction closes`);
  await page.reload();
  await page.waitForLoadState("networkidle");
  ok(!(await intro.isVisible()) && (await stored("coachspace-intro-dismissed")) === "1", `[${n}] stays closed after a reload`);

  // 6. A change in Tennis Coaching, to check later that scenarios keep separate data.
  await go("/calendar");
  await main.getByRole("button", { name: /^Groups shown:/ }).click();
  await main.getByRole("group", { name: "Show sessions from" }).getByRole("checkbox", { name: "U16 Development", exact: true }).click();
  ok((await filterSummary()) === "4 of 5 groups", `[${n}] Tennis Coaching: one group hidden in the calendar`);

  // 7. Settings → Demo: a compact switcher, not in the main navigation.
  ok((await mainNav(page).getByRole("link", { name: /Demo|Welcome/ }).count()) === 0, `[${n}] no demo controls in the main navigation`);
  await settingsDemo();
  ok(clean(await main.innerText()).includes("Showing Tennis Coaching · Laura Gomez Tennis"), `[${n}] Settings names the active scenario`);
  const switchers = main.getByRole("list", { name: "Demo scenarios" }).getByRole("button");
  ok((await switchers.count()) === 3, `[${n}] three scenarios to switch to`);
  ok((await switchers.first().getAttribute("aria-pressed")) === "true" && (await switchers.nth(1).getAttribute("aria-pressed")) === "false", `[${n}] the active scenario is marked`);
  ok((await main.getByRole("link", { name: "Open the welcome screen" }).getAttribute("href")) === "/demo", `[${n}] link back to the welcome screen`);
  await page.screenshot({ path: `${OUT}/scenarios-${n}-settings.png`, fullPage: true });

  // 8. Switch to Football Academy from Settings.
  await switchers.nth(1).click();
  await page.waitForFunction(() => document.querySelector("[data-active-scenario]")?.getAttribute("data-active-scenario") === "football");
  ok((await main.getByRole("status").first().innerText()).includes("Football Academy is now active"), `[${n}] the switch is confirmed`);
  ok((await page.evaluate(() => document.activeElement?.id)) === "demo-heading", `[${n}] focus stays in the Demo section`);
  ok((await stored("coachspace-scenario")) === "football", `[${n}] the new choice is remembered`);
  ok((await main.getByRole("list", { name: "Demo scenarios" }).getByRole("button", { pressed: true }).innerText()).includes("Football Academy"), `[${n}] Football marked active`);

  // 9. Every page follows the active scenario.
  await mainNav(page).getByRole("link", { name: "Home" }).click();
  ok((await dashboardOf("Daniel")) === "Home · Northgate Football Academy", `[${n}] dashboard greets the football coach (${await h1()})`);
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
  // The month grid from 768 px, the month agenda on phones (D-073).
  const todayCount = vp.width >= 768
    ? await main.getByRole("button", { name: /^Wednesday 14 Oct:/ }).getAttribute("aria-label")
    : `Wednesday 14 Oct: ${await main.getByRole("region", { name: /^Today/ }).getByRole("link").count()} session`;
  ok(todayCount === "Wednesday 14 Oct: 1 session", `[${n}] football sessions in the calendar (${todayCount})`);
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

  // 10. Participant view in the same scenario.
  await page.getByRole("navigation", { name: /^Demo view/ }).getByRole("link", { name: /^(Participant|Player)$/ }).click();
  await page.waitForURL(`${BASE}/me`);
  await page.waitForLoadState("networkidle");
  const me = clean(await main.innerText());
  ok((await h1()) === "Hi Jordan" && me.includes("Senior Amateur") && me.includes("Adult Recreational") && !me.includes("Adult Improvers"), `[${n}] participant view uses football groups`);
  await page.getByRole("navigation", { name: /^Demo view/ }).getByRole("link", { name: "Coach" }).click();
  await page.waitForURL(`${BASE}/`);

  // 11. The scenario survives a reload, and the page is shown once it is applied.
  await page.reload();
  await page.waitForLoadState("networkidle");
  ok((await h1()) === "Home · Northgate Football Academy", `[${n}] still football after a reload`);
  ok(!(await page.evaluate(() => document.documentElement.hasAttribute("data-scenario-loading"))), `[${n}] page visible after the scenario is applied`);

  // 12. Basketball from the welcome screen, then back to Tennis Coaching in Settings: it kept its own change.
  await go("/demo");
  await cards().nth(2).getByRole("link", { name: "Explore Basketball Club" }).click();
  ok((await dashboardOf("Maya")) === "Home · Eastfield Basketball Club", `[${n}] Basketball Club opens the basketball dashboard`);
  await go("/calendar");
  ok((await filterSummary()) === "All groups" && !clean(await main.innerText()).includes("Adult Improvers"), `[${n}] basketball calendar has no tennis data`);
  await switchTo("Tennis Coaching", "tennis");
  await go("/calendar");
  ok((await filterSummary()) === "4 of 5 groups", `[${n}] Tennis Coaching kept its own saved changes`);

  // 14. Reset this scenario (confirmed), then all of them.
  await settingsDemo();
  page.once("dialog", (d) => d.dismiss());
  await main.getByRole("button", { name: "Reset demo data" }).click();
  ok(JSON.parse((await stored("coachspace-demo-v2:tennis")) ?? "{}").calendarHiddenGroups?.includes("g1"), `[${n}] cancelling the confirmation keeps the data`);
  let message = "";
  page.once("dialog", (d) => {
    message = d.message();
    d.accept();
  });
  await main.getByRole("button", { name: "Reset demo data" }).click();
  ok(message.startsWith("Reset Tennis Coaching?"), `[${n}] reset asks for confirmation`);
  await main.getByRole("status").filter({ hasText: "Tennis Coaching restored" }).first().waitFor();
  const tennisSaved = JSON.parse((await stored("coachspace-demo-v2:tennis")) ?? "{}");
  ok((tennisSaved.calendarHiddenGroups ?? []).length === 0, `[${n}] Tennis Coaching reset (nothing hidden in what is saved)`);
  await go("/calendar");
  ok((await filterSummary()) === "All groups", `[${n}] the reset restores the fictional data`);
  await switchTo("Football Academy", "football");
  await settingsDemo();
  message = "";
  page.once("dialog", (d) => {
    message = d.message();
    d.accept();
  });
  await main.getByRole("button", { name: "Reset all scenarios" }).click();
  await page.waitForURL(`${BASE}/demo`);
  ok(message.startsWith("Reset all four scenarios?"), `[${n}] reset all asks for confirmation`);
  ok((await stored("coachspace-scenario")) === null && (await stored("coachspace-intro-dismissed")) === null, `[${n}] reset all forgets the choice and the closed introduction`);
  const keys = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("coachspace-demo-v2:")));
  ok(keys.length === 0 || keys.every((k) => k === "coachspace-demo-v2:tennis"), `[${n}] no other scenario data left (${keys.join(",")})`);
  ok((await h1()) === "Try CoachSpace with your sport", `[${n}] reset all starts again from the welcome screen`);
  await go("/");
  ok(page.url() === `${BASE}/demo`, `[${n}] after reset all, / opens the welcome screen again`);

  // 15. Football Academy from the welcome screen.
  await cards().nth(1).getByRole("link", { name: "Explore Football Academy" }).click();
  ok((await dashboardOf("Daniel")) === "Home · Northgate Football Academy", `[${n}] Football Academy opens the football dashboard`);
  ok(clean(await main.getByRole("region", { name: "About this demo" }).innerText()).includes("you are Daniel Reyes"), `[${n}] the guide names the football coach`);

  // 16. Stale or invalid data is ignored safely.
  await page.evaluate(() => {
    localStorage.setItem("coachspace-scenario", "rugby");
    localStorage.setItem("coachspace-demo-v2:football", JSON.stringify({ scenario: "tennis", exercises: [], assignments: [] }));
  });
  await go("/");
  ok((await h1()) === "Home · Laura Gomez Tennis", `[${n}] an unknown scenario falls back to Tennis Coaching`);
  await page.evaluate(() => localStorage.setItem("coachspace-scenario", "football"));
  await go("/library");
  ok(clean(await main.innerText()).includes("Rondo 4v1"), `[${n}] data saved under the wrong scenario is ignored`);
  await page.evaluate(() => localStorage.clear());

  await finish(page, vp);
}
await browser.close();
done();

// Calendar page (D-045, D-076), reached from Profile: the month only on every screen size — the grid with the
// groups' colours and the selected day's sessions below — New session as the one primary action, Today and month
// navigation, keyboard selection, colours by session state, ?group= from a group, and no player calendar.
import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();
const commit = { waitUntil: "commit" };

for (const vp of [viewports[0], { name: "tablet", width: 768, height: 1024 }, viewports[1]]) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00")); // Wednesday, 12:00
  const n = vp.name;
  const main = page.locator("main");
  const go = async (p) => {
    await page.goto(BASE + p);
    await page.waitForLoadState("networkidle");
  };
  const day = (label) => main.getByRole("button", { name: new RegExp(`^${label}:`) });

  // 1. Header: one primary action, New session, on the selected date; the month grid; no other views.
  await go("/calendar");
  ok((await page.locator("h1").innerText()) === "Calendar", `[${n}] page title`);
  ok((await main.getByRole("link", { name: "New session" }).count()) === 1, `[${n}] one New session`);
  ok((await main.getByRole("link", { name: "New session" }).getAttribute("href")) === "/calendar/new?date=2026-10-14", `[${n}] New session starts on the selected date`);
  ok((await main.getByRole("group", { name: "Calendar view" }).count()) === 0 && (await main.getByRole("region", { name: /Upcoming sessions/ }).count()) === 0, `[${n}] month only, no week board or upcoming list`);
  ok((await main.getByRole("heading", { name: "October 2026", exact: true }).count()) === 1 && (await main.locator("table").count()) === 1, `[${n}] the month grid`);
  ok((await main.getByRole("list", { name: "Colour key" }).getByRole("listitem").allInnerTexts()).join("|") === "Session|Extra session|Changed|Cancelled", `[${n}] colour key`);
  const wed = day("Wednesday 14 Oct");
  ok((await wed.getAttribute("aria-current")) === "date" && (await wed.getAttribute("aria-pressed")) === "true", `[${n}] today selected`);
  const borders = await wed.locator("span.rounded-md").evaluateAll((els) => els.map((e) => getComputedStyle(e).borderLeftColor));
  ok(borders.length === 2 && borders[0] !== borders[1], `[${n}] each session in its group's colour (${borders.join(", ")})`);
  const today = main.getByRole("list", { name: "Sessions on Wednesday 14 Oct" }).getByRole("listitem");
  ok((await today.count()) === 2 && (await today.getByRole("link", { name: /Reschedule/ }).count()) === 0, `[${n}] the day's sessions, changed from the session page`);
  await page.screenshot({ path: `${OUT}/calpage-${n}-month.png`, fullPage: true });

  // 2. Selecting a day: its sessions below, the date in the URL, New session follows it.
  await day("Thursday 15 Oct").click();
  await page.waitForURL(/\?date=2026-10-15$/, commit);
  ok((await main.getByRole("list", { name: "Sessions on Thursday 15 Oct" }).getByRole("listitem").count()) === 2, `[${n}] Thursday's sessions`);
  ok((await main.getByRole("link", { name: "New session" }).getAttribute("href")) === "/calendar/new?date=2026-10-15", `[${n}] New session follows the selected day`);

  // 3. Month navigation and Today.
  await main.getByRole("button", { name: "Next month" }).click();
  ok((await main.getByRole("heading", { name: "November 2026", exact: true }).count()) === 1 && (await day("Sunday 1 Nov").getAttribute("aria-pressed")) === "true", `[${n}] next month selects the 1st`);
  await main.getByRole("button", { name: "Today" }).click();
  ok((await main.getByRole("heading", { name: "October 2026", exact: true }).count()) === 1 && (await wed.getAttribute("aria-pressed")) === "true", `[${n}] Today returns`);

  // 4. Keyboard: a day is one focusable button; Enter selects it.
  await day("Friday 16 Oct").focus();
  await page.keyboard.press("Enter");
  ok((await day("Friday 16 Oct").getAttribute("aria-pressed")) === "true" && (await main.getByText("No sessions on this day.").isVisible()), `[${n}] Enter selects a day; an empty day says so`);

  // 5. Colours follow the session state: a cancelled session.
  await go("/calendar/g4-2026-10-14");
  await page.getByRole("button", { name: "Cancel session", exact: true }).click();
  await page.getByRole("button", { name: "Cancel session", exact: true }).click();
  await main.getByRole("status").getByText("Session cancelled").waitFor();
  await go("/calendar");
  ok((await wed.getAttribute("aria-label")) === "Wednesday 14 Oct: 1 session, 1 cancelled", `[${n}] the day counts the cancellation`);
  const chipClasses = await wed.locator("span.rounded-md").evaluateAll((els) => els.map((e) => e.className));
  ok(chipClasses[1].includes("line-through") && chipClasses[1].includes("text-danger"), `[${n}] cancelled label struck through in red`);
  ok(clean(await today.nth(1).innerText()).includes("Cancelled"), `[${n}] cancelled session marked below`);

  // 6. A group's Sessions tab (?group=) shows only that group, then the URL is cleaned.
  await go("/calendar?group=g2");
  await page.waitForURL(`${BASE}/calendar`, commit);
  await main.getByRole("heading", { name: "October 2026", exact: true }).waitFor();
  ok((await day("Thursday 15 Oct").getAttribute("aria-label")).startsWith("Thursday 15 Oct: 1 session"), `[${n}] only that group's sessions`);

  // 7. Profile is the current navigation item; the player has no calendar page.
  const current = vp.width >= 1024 ? mainNav(page).getByRole("link", { name: "Calendar", exact: true }) : page.getByRole("link", { name: /^Profile:/ });
  ok((await current.getAttribute("aria-current")) === "page", `[${n}] Calendar belongs to Profile`);
  const resp = await page.request.get(`${BASE}/me/calendar`);
  ok(resp.status() === 404, `[${n}] no player calendar page`);

  // Clean up.
  await go("/settings");
  page.once("dialog", (d) => d.accept());
  await main.getByRole("button", { name: "Reset demo data" }).click();
  await finish(page, vp);
}
await browser.close();
done();

// Calendar page (D-045): header, month grid and the selected day, week board, Today, view switch,
// colours by session state, group filter, upcoming sessions, keyboard use and the participant view.
import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();
const commit = { waitUntil: "commit" };

// The month grid is shown from 768 px (D-073): it is checked on a tablet and on desktop; phones get the
// month as an agenda, checked at the end of this script.
const gridViewports = [{ name: "tablet", width: 768, height: 1024 }, viewports[1]];
for (const vp of gridViewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00")); // Wednesday, 12:00
  const n = vp.name;
  const main = page.locator("main");
  const go = async (p) => {
    await page.goto(BASE + p);
    await page.waitForLoadState("networkidle");
  };
  const day = (label) => main.getByRole("button", { name: new RegExp(`^${label}:`) });
  const upcoming = () => main.getByRole("region", { name: /Upcoming sessions|Next sessions/ }).getByRole("link");

  // 1. Header, toolbar and month grid.
  await go("/calendar");
  ok((await page.locator("h1").innerText()) === "Calendar", `[${n}] page title`);
  const create = main.getByRole("link", { name: "Create session" });
  ok((await create.getAttribute("href")) === "/calendar/new?date=2026-10-14", `[${n}] Create session starts on the selected date`);
  ok((await main.getByRole("heading", { name: "October 2026", exact: true }).count()) === 1, `[${n}] month shown in the toolbar`);
  const viewSwitch = main.getByRole("group", { name: "Calendar view" });
  ok((await viewSwitch.getByRole("link", { name: "Month" }).getAttribute("aria-current")) === "page", `[${n}] Month is the current view`);
  ok((await main.locator("table thead th").allInnerTexts()).join("|").toUpperCase() === "MON|TUE|WED|THU|FRI|SAT|SUN", `[${n}] weekday headers`);
  const wed = day("Wednesday 14 Oct");
  ok((await wed.getAttribute("aria-current")) === "date" && (await wed.getAttribute("aria-pressed")) === "true", `[${n}] today highlighted and selected`);
  const wedChips = clean(await wed.innerText());
  ok(wedChips.includes("17:00") && wedChips.includes("19:00"), `[${n}] day cell shows its sessions (${wedChips})`);
  // D-061: a short group code beside each time, so the group is clear without a tap (audit F-13).
  const chipTexts = (await wed.locator("span.rounded-md").allInnerTexts()).map(clean);
  ok(chipTexts.length === 2 && /^17:00\s*(· )?U16/.test(chipTexts[0]) && /^19:00\s*(· )?AI/.test(chipTexts[1]), `[${n}] each label shows the time and the group code (${chipTexts.join(" | ")})`);
  ok(vp.width >= 640 ? wedChips.includes("Footwork and recovery") : !(await wed.getByText("Footwork and recovery").isVisible()), `[${n}] session titles in cells from 640 px only`);
  ok(clean(await day("Sunday 18 Oct").innerText()) === "18", `[${n}] empty day has no labels`);
  ok((await main.getByRole("list", { name: "Colour key" }).getByRole("listitem").allInnerTexts()).join("|") === "Session|Extra session|Changed|Cancelled", `[${n}] colour key`);

  // 2. The selected day: sessions with details, links and actions.
  const todayList = main.getByRole("list", { name: "Sessions on Wednesday 14 Oct" });
  const rows = (await todayList.getByRole("listitem").allInnerTexts()).map(clean);
  ok(rows.length === 2 && rows[0].startsWith("17:00 18:30 Footwork and recovery U16 Development Harbour Lane TC, Courts 3–4"), `[${n}] selected day lists time, title, group and place (${rows[0]})`);
  ok((await main.locator("#day-heading").innerText()).replace(",", "").includes("Wednesday 14 October"), `[${n}] selected day heading`);
  const reschedule = todayList.getByRole("link", { name: "Reschedule Footwork and recovery" });
  ok((await reschedule.getAttribute("href")) === "/calendar/g1-2026-10-14/edit", `[${n}] Reschedule opens the session's edit form`);
  await day("Thursday 15 Oct").click();
  await page.waitForURL(/\/calendar\?date=2026-10-15$/, commit);
  ok((await day("Thursday 15 Oct").getAttribute("aria-pressed")) === "true", `[${n}] clicking a day selects it`);
  ok((await create.getAttribute("href")) === "/calendar/new?date=2026-10-15", `[${n}] Create session follows the selected date`);
  ok((await main.getByRole("link", { name: "New session" }).getAttribute("href")) === "/calendar/new?date=2026-10-15", `[${n}] New session for the selected day`);
  await main.getByRole("list", { name: "Sessions on Thursday 15 Oct" }).getByRole("link").first().click();
  await page.waitForURL(`${BASE}/calendar/g2-2026-10-15`, commit);
  await main.getByText("Training session").waitFor();
  const detail = clean(await main.innerText());
  ok(detail.includes("Return-of-serve positioning") && detail.includes("17:30–19:00") && detail.includes("Courts 1–2"), `[${n}] session opens its details`);
  await page.goBack();
  await page.waitForURL(/\/calendar\?date=2026-10-15$/, commit);
  await day("Thursday 15 Oct").waitFor();
  ok((await day("Thursday 15 Oct").getAttribute("aria-pressed")) === "true", `[${n}] back returns to the selected day`);
  await page.screenshot({ path: `${OUT}/calpage-${n}-month.png`, fullPage: true });

  // 3. Month navigation and Today.
  await main.getByRole("button", { name: "Next month" }).click();
  await page.waitForURL(/date=2026-11-01$/, commit);
  ok((await main.getByRole("heading", { name: "November 2026", exact: true }).count()) === 1, `[${n}] next month`);
  ok((await day("Sunday 1 Nov").getAttribute("aria-pressed")) === "true", `[${n}] another month selects its 1st`);
  ok((await main.locator("#day-heading").innerText()).replace(",", "").includes("Sunday 1 November"), `[${n}] selected day follows the month`);
  await main.getByRole("button", { name: "Today" }).click();
  await page.waitForURL(/date=2026-10-14$/, commit);
  ok((await main.getByRole("heading", { name: "October 2026", exact: true }).count()) === 1 && (await wed.getAttribute("aria-pressed")) === "true", `[${n}] Today returns to today`);

  // 4. Keyboard: a day is one focusable button; Enter selects it and focus stays on it.
  await day("Friday 16 Oct").focus();
  await page.keyboard.press("Enter");
  await page.waitForURL(/date=2026-10-16$/, commit);
  ok((await day("Friday 16 Oct").getAttribute("aria-pressed")) === "true", `[${n}] Enter selects a day`);
  ok((await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? "")).startsWith("Friday 16 Oct"), `[${n}] focus stays on the selected day`);
  ok((await main.locator("table button").count()) === 35 || (await main.locator("table button").count()) === 42, `[${n}] one button per day`);

  // 5. Switch to the week of the selected day, navigate, and back to the month.
  await viewSwitch.getByRole("link", { name: "Week" }).click();
  await page.waitForURL(/view=week&week=2026-10-16$/, commit);
  await main.getByText("12 Oct – 18 Oct 2026").waitFor();
  ok((await main.getByRole("group", { name: "Calendar view" }).getByRole("link", { name: "Week" }).getAttribute("aria-current")) === "page", `[${n}] Week is the current view`);
  const days = main.locator("ol > li");
  ok((await days.count()) === 7, `[${n}] week board has seven days`);
  ok((await days.locator("ul > li").count()) === 8, `[${n}] week board shows the 8 sessions`);
  const wedCol = clean(await main.getByRole("listitem", { name: "Wednesday 14 Oct" }).innerText());
  ok(wedCol.includes("Today") && wedCol.includes("17:00–18:30") && wedCol.includes("U16 Development") && wedCol.includes("Courts 3–4"), `[${n}] week card shows time, group and place`);
  if (vp.width >= 1280) {
    const cols = await days.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    ok(new Set(cols).size === 1, `[${n}] seven columns side by side`);
  } else {
    const tops = await days.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    ok(tops.every((t, i) => i === 0 || t > tops[i - 1]), `[${n}] days stacked on small screens`);
  }
  await page.screenshot({ path: `${OUT}/calpage-${n}-week.png`, fullPage: true });
  await main.getByRole("link", { name: "Next week" }).click();
  await main.getByText("19 Oct – 25 Oct 2026").waitFor();
  ok(clean(await main.innerText()).includes("8 sessions"), `[${n}] another week shows its session count`);
  await main.getByRole("link", { name: "Today", exact: true }).click();
  await main.getByText("12 Oct – 18 Oct 2026").waitFor();
  ok(true, `[${n}] Today returns to this week`);
  await main.getByRole("listitem", { name: "Tuesday 13 Oct" }).getByRole("link").first().click();
  await page.waitForURL(`${BASE}/calendar/g2-2026-10-13`, commit);
  ok(true, `[${n}] week card opens the session`);
  await go("/calendar?view=week&week=2026-10-16");
  await main.getByRole("group", { name: "Calendar view" }).getByRole("link", { name: "Month" }).click();
  await page.waitForURL(/\/calendar\?date=2026-10-16$/, commit);
  await day("Friday 16 Oct").waitFor();
  ok((await day("Friday 16 Oct").getAttribute("aria-pressed")) === "true", `[${n}] Month keeps the date`);

  // 6. Upcoming sessions.
  const next = (await upcoming().allInnerTexts()).map(clean);
  ok(next.length === 3 && next[0].includes("Footwork and recovery") && next[2].includes("Return-of-serve positioning"), `[${n}] three upcoming sessions (${next.length})`);
  await upcoming().first().click();
  await page.waitForURL(`${BASE}/calendar/g1-2026-10-14`, commit);
  ok(true, `[${n}] upcoming session opens its details`);

  // 7. Colours follow the session state: a cancelled session (the later one of today).
  await go("/calendar/g4-2026-10-14");
  await page.getByRole("button", { name: "Cancel this session" }).click();
  await page.getByRole("button", { name: "Cancel session" }).click();
  await main.getByRole("status").getByText("Session cancelled").waitFor();
  await go("/calendar");
  ok((await wed.getAttribute("aria-label")) === "Wednesday 14 Oct: 1 session, 1 cancelled", `[${n}] day name counts the cancellation`);
  const chipClasses = await wed.locator("span.rounded-md").evaluateAll((els) => els.map((e) => e.className));
  ok(chipClasses.length === 2 && chipClasses[1].includes("line-through") && chipClasses[1].includes("text-danger") && chipClasses[0].includes("text-info"), `[${n}] cancelled label struck through in red`);
  const cancelledRow = main.getByRole("list", { name: "Sessions on Wednesday 14 Oct" }).getByRole("listitem").nth(1);
  ok(clean(await cancelledRow.innerText()).includes("Cancelled") && (await cancelledRow.getByRole("link", { name: /Reschedule/ }).count()) === 0, `[${n}] cancelled session marked, no Reschedule`);
  ok(!(await upcoming().allInnerTexts()).some((t) => t.includes("Serve consistency")), `[${n}] cancelled session left out of upcoming`);

  // 8. A group's "View sessions" (?group=) shows only that group, then the URL is cleaned.
  await go("/calendar?group=g2");
  await page.waitForURL(`${BASE}/calendar`, commit);
  await wed.waitFor();
  ok((await wed.getAttribute("aria-label")) === "Wednesday 14 Oct: no sessions", `[${n}] ?group= limits the grid`);
  const g2 = (await upcoming().allInnerTexts()).map(clean);
  ok(g2.length === 3 && g2.every((t) => t.includes("U18 Performance")), `[${n}] ?group= limits upcoming sessions`);
  ok((await main.getByRole("button", { name: "Groups shown: U18 Performance" }).count()) === 1, `[${n}] filter button names the group`);
  await main.getByRole("button", { name: "Show all groups" }).click();
  ok((await wed.getAttribute("aria-label")).startsWith("Wednesday 14 Oct: 1 session"), `[${n}] all groups again`);

  // 9. Participant view: own groups only, no coach actions.
  await go("/me/calendar");
  ok((await page.locator("h1").innerText()) === "My calendar", `[${n}] participant calendar title`);
  ok(
    (await main.getByRole("link", { name: /Create session|New session|Reschedule/ }).count()) === 0,
    `[${n}] participant has no create or reschedule actions`,
  );
  ok((await day("Tuesday 13 Oct").getAttribute("aria-label")) === "Tuesday 13 Oct: no sessions", `[${n}] participant grid shows own groups only`);
  const mine = (await upcoming().allInnerTexts()).map(clean);
  ok(mine.length === 3 && mine.every((t) => /Adult Improvers|Club Competition Team/.test(t)), `[${n}] participant next sessions from own groups`);
  ok((await main.getByRole("heading", { name: "Next sessions" }).count()) === 1, `[${n}] participant section named Next sessions`);
  await day("Thursday 15 Oct").click();
  await page.waitForURL(/\/me\/calendar\?date=2026-10-15$/, commit);
  await main.getByRole("list", { name: "Sessions on Thursday 15 Oct" }).getByRole("link").first().click();
  await page.waitForURL(/\/me\/calendar\/g5-2026-10-15$/, commit);
  ok(true, `[${n}] participant session opens in the participant view`);
  ok((await mainNav(page).getByRole("link", { name: "Agenda" }).getAttribute("aria-current")) === "page", `[${n}] navigation stays on the participant's Agenda`);
  await page.screenshot({ path: `${OUT}/calpage-${n}-participant.png`, fullPage: true });

  await finish(page, vp);
}

// 10. Phones (D-073): the month as an agenda by day from today, Agenda / Week switch, earlier days on request.
{
  const vp = viewports[0];
  const n = vp.name;
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  const main = page.locator("main");
  await page.goto(`${BASE}/calendar`);
  await page.waitForLoadState("networkidle");
  const viewSwitch = main.getByRole("group", { name: "Calendar view" });
  ok((await viewSwitch.getByRole("link", { name: "Agenda" }).getAttribute("aria-current")) === "page", `[${n}] Agenda is the month view on phones`);
  ok((await main.locator("table").isVisible()) === false, `[${n}] no month grid on phones`);
  const headings = await main.locator("section[aria-labelledby^='agenda-'] h3").allInnerTexts();
  ok(headings[0].startsWith("Today") && headings[1].startsWith("Tomorrow") && headings.every((h) => !h.includes("13 Oct")), `[${n}] days from today (${headings.slice(0, 3).join(" | ")})`);
  const todayRows = main.getByRole("region", { name: /^Today/ }).getByRole("link");
  ok((await todayRows.count()) === 2 && /\d+ going/.test(await todayRows.first().innerText()), `[${n}] today's sessions with who is coming`);
  await main.getByRole("button", { name: "Show earlier days this month" }).click();
  ok((await main.locator("section[aria-labelledby^='agenda-'] h3").first().innerText()).includes("1 Oct"), `[${n}] earlier days on request`);
  await main.getByRole("button", { name: "Next month" }).click();
  await page.waitForURL(/date=2026-11-01$/, commit);
  ok((await main.locator("section[aria-labelledby^='agenda-'] h3").first().innerText()).includes("2 Nov"), `[${n}] next month from its first session`);
  ok((await main.getByRole("button", { name: /Show earlier days/ }).count()) === 0, `[${n}] no earlier days in another month`);
  ok((await main.getByRole("region", { name: /Upcoming sessions/ }).isVisible().catch(() => false)) === false, `[${n}] no duplicate upcoming list on phones`);
  await todayRows.first().waitFor({ state: "detached" }).catch(() => {});
  await main.locator("section[aria-labelledby^='agenda-'] a").first().click();
  await page.waitForURL(/\/calendar\/g1-2026-11-02$/, commit);
  ok(true, `[${n}] an agenda row opens the session`);
  await page.goto(`${BASE}/me/calendar`);
  await page.waitForLoadState("networkidle");
  const mine = await main.locator("section[aria-labelledby^='agenda-'] a").allInnerTexts();
  ok(mine.length > 0 && mine.every((t) => /Adult Improvers|Club Competition Team/.test(t)) && mine.every((t) => !/going/.test(t)), `[${n}] participant agenda: own groups, no counts`);
  await finish(page, vp);
}
await browser.close();
done();

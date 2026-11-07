import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav, groupTab } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (t) => t.replace(/\s+/g, " ").trim();
const commit = { waitUntil: "commit" };
for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00")); // Wednesday
  const n = vp.name;
  const main = page.locator("main");
  const back = () => main.locator("a").filter({ has: page.locator("svg") }).first();
  const backLabel = async () => clean(await back().innerText());
  const go = async (p) => { await page.goto(BASE + p); await page.waitForLoadState("networkidle"); };
  // The unread total lives on the Messages link of the main navigation (D-071).
  const chatIcon = () => mainNav(page).getByRole("link", { name: /^Messages(,|$)/ });
  const badgeText = async () => clean(await chatIcon().innerText()).replace("Messages", "").trim();

  // ---- 1. Month calendar (the grid from 768 px, D-073; phones: calendar-page.mjs) ----
  if (vp.width >= 768) {
    await go("/calendar");
    ok((await page.getByRole("heading", { name: "October 2026" }).count()) === 1, `[${n}] month view by default`);
    const todayBtn = main.locator("button[aria-current=date]");
    ok((await todayBtn.getAttribute("aria-label")).startsWith("Wednesday 14 Oct: 2 sessions"), `[${n}] today highlighted with its sessions`);
    ok((await todayBtn.getAttribute("aria-pressed")) === "true", `[${n}] today selected by default`);
    ok((await main.getByRole("button", { name: /^Sunday 18 Oct: no sessions/ }).count()) === 1, `[${n}] dates without sessions have no indicator`);
    await main.getByRole("button", { name: /^Thursday 15 Oct/ }).click();
    await page.waitForURL(/\?date=2026-10-15/, commit);
    const thu = await main.getByRole("list", { name: /Sessions on Thursday 15 Oct/ }).locator("li").allInnerTexts();
    ok(thu.length === 2 && thu[0].includes("17:30") && thu[1].includes("19:30"), `[${n}] selecting a date shows its sessions`);
    ok((await main.getByRole("button", { name: /^Thursday 15 Oct/ }).getAttribute("aria-pressed")) === "true", `[${n}] selected date highlighted`);
    await main.getByRole("button", { name: "Next month" }).click();
    ok((await page.getByRole("heading", { name: "November 2026" }).count()) === 1, `[${n}] next month`);
    await main.getByRole("button", { name: "Previous month" }).click();
    await main.getByRole("button", { name: "Previous month" }).click();
    ok((await page.getByRole("heading", { name: "September 2026" }).count()) === 1, `[${n}] previous month`);
    ok((await main.getByRole("button", { name: /^Tuesday 1 Sept/ }).getAttribute("aria-pressed")) === "true", `[${n}] month change selects the 1st`);
    await main.getByRole("button", { name: "Today" }).click();
    ok((await page.getByRole("heading", { name: "October 2026" }).count()) === 1, `[${n}] Today returns to the current month`);
    await main.getByRole("button", { name: /^Thursday 15 Oct/ }).click();
    await main.getByRole("list", { name: /Sessions on Thursday 15 Oct/ }).getByRole("link").first().click();
    await page.waitForURL(`${BASE}/calendar/g2-2026-10-15`, commit);
    await main.locator("h1").first().waitFor();
    ok((await backLabel()) === "Calendar", `[${n}] session opened from the widget`);
    await back().click();
    await page.waitForURL(/\/calendar\?date=2026-10-15$/, commit);
    ok((await main.getByRole("button", { name: /^Thursday 15 Oct/ }).getAttribute("aria-pressed")) === "true", `[${n}] back keeps the selected date`);
    await main.getByRole("link", { name: "New session" }).click();
    await page.waitForURL(/\/calendar\/new\?date=2026-10-15/, commit);
    await page.getByLabel("Date").waitFor();
    ok((await page.getByLabel("Date").inputValue()) === "2026-10-15", `[${n}] new session starts on the selected date`);
    await go("/calendar?view=week");
    ok((await page.getByText("12 Oct – 18 Oct 2026").count()) === 1, `[${n}] week view still available`);
    await page.screenshot({ path: `${OUT}/ux-${n}-week.png` });
    await go("/calendar?group=g2");
    ok((await main.locator("button[aria-current=date]").getAttribute("aria-label")).startsWith("Wednesday 14 Oct: no sessions"), `[${n}] group filter limits the calendar`);
    await main.getByRole("button", { name: "Show all groups" }).click();
    await go("/calendar");
    await page.screenshot({ path: `${OUT}/ux-${n}-calendar.png`, fullPage: true });
  }

  // ---- 2. Home and unread badge ---------------------------------------------
  await go("/");
  ok((await chatIcon().getAttribute("aria-label")) === "Messages, 5 unread messages" && (await badgeText()) === "5", `[${n}] compact chat badge shows 5`);
  ok(!/unread messages?/.test(clean(await main.innerText())), `[${n}] unread messages show on the Messages badge only, not again on Home`);
  await page.screenshot({ path: `${OUT}/ux-${n}-home.png`, fullPage: true });
  // Jordan writes two messages in the Club Competition Team chat: 7 unread for the coach -> 5+.
  await page.getByRole("navigation", { name: /^Demo view/ }).getByRole("link", { name: /^(Participant|Player)$/ }).click();
  await page.waitForURL(`${BASE}/me`, commit);
  await chatIcon().click();
  await page.waitForURL(`${BASE}/me/chat`, commit);
  await page.locator('a[href="/me/chat/c-g5"]').click();
  await page.waitForURL(`${BASE}/me/chat/c-g5`, commit);
  for (const t of ["See you Thursday.", "I'll bring the new balls."]) {
    await page.getByLabel("Message to Club Competition Team").fill(t);
    await page.getByRole("button", { name: "Send message" }).click();
    await page.locator("ol[role=log] li").last().getByText(t).waitFor();
  }
  await page.getByRole("navigation", { name: /^Demo view/ }).getByRole("link", { name: "Coach" }).click();
  await page.waitForURL(`${BASE}/`, commit);
  await chatIcon().waitFor();
  ok((await chatIcon().getAttribute("aria-label")) === "Messages, 7 unread messages" && (await badgeText()) === "5+", `[${n}] more than 5 shows 5+`);
  await go("/groups");
  const g5 = clean(await main.getByRole("link", { name: /Club Competition Team/ }).first().innerText());
  ok(g5.includes("3 unread in the group chat"), `[${n}] group badge consistent with the total (${g5})`);
  // Read every conversation -> no badge.
  await chatIcon().click();
  await page.waitForURL(`${BASE}/chat`, commit);
  for (const id of ["c-g1", "c-g3", "c-g5", "c-p12"]) {
    await page.locator(`a[href="/chat/${id}"]`).click();
    await page.waitForURL(`${BASE}/chat/${id}`, commit);
    await page.getByRole("log").waitFor();
    await main.getByRole("link", { name: /^Back to/ }).click();
    await page.waitForURL(`${BASE}/chat`, commit);
  }
  await mainNav(page).getByRole("link", { name: "Home" }).click();
  await page.waitForURL(`${BASE}/`, commit);
  await chatIcon().waitFor();
  await page.waitForLoadState("networkidle");
  ok((await chatIcon().getAttribute("aria-label")) === null && (await badgeText()) === "", `[${n}] no badge at 0`);
  // Read state is kept in this browser (D-060), until Reset demo data.
  await page.reload();
  await chatIcon().waitFor();
  await page.waitForLoadState("networkidle");
  ok((await chatIcon().getAttribute("aria-label")) === null && (await badgeText()) === "", `[${n}] read state kept after a reload`);

  // ---- 3. Attendance context ---------------------------------------------------
  // Attendance is taken inside the session once it has started (D-071, D-076): before, one line says when it opens.
  await go("/");
  await main.getByRole("link", { name: "Open Footwork and recovery" }).click();
  await page.waitForURL(`${BASE}/calendar/g1-2026-10-14`, commit);
  await main.getByText("The register opens at 17:00.").waitFor();
  ok((await main.getByRole("link", { name: "Take attendance" }).count()) === 0, `[${n}] no register before the session starts`);
  await go("/calendar/g1-2026-10-12");
  await main.getByRole("link", { name: "Take attendance" }).click();
  await page.waitForURL(`${BASE}/calendar/g1-2026-10-12/attendance?group=g1`, commit);
  await main.locator("form ul > li").first().waitFor();
  ok((await main.locator("form ul > li").count()) === 8, `[${n}] next session attendance lists its own group (U16 Development, 8)`);
  await go("/");
  await main.getByRole("link", { name: /registers? to take/ }).click();
  await page.waitForURL(`${BASE}/attendance`, commit);
  ok(clean(await main.innerText()).includes("Which group?"), `[${n}] no context: choose a group first`);
  // The group card, not the saved sessions of that group listed below it.
  await main.getByRole("link", { name: /^Adult Improvers/ }).click();
  await page.waitForURL(`${BASE}/attendance?group=g4`, commit);
  await main.getByText("Recent sessions").waitFor();
  await main.locator("section:has(h2:text('Recent sessions')) a").first().click();
  await page.waitForURL(/\/calendar\/g4-2026-10-10\/attendance\?group=g4/, commit);
  await main.locator("form ul > li").first().waitFor();
  const improvers = (await main.locator("form ul > li").getByRole("checkbox").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")))).map((l) => l.replace(/ present$/, ""));
  ok(improvers.length === 6 && improvers.includes("Jordan Hale"), `[${n}] Adult Improvers list includes the multi-group participant`);
  await go("/calendar/g1-2026-10-12/attendance?group=g1");
  await main.locator("form ul > li").first().waitFor();
  ok(!(await main.locator("form ul > li p.font-medium").allInnerTexts()).includes("Jordan Hale"), `[${n}] not in a group he does not belong to`);
  await go("/calendar/g1-2026-10-12/attendance?group=g2");
  ok(clean(await main.getByRole("alert").first().innerText()).includes("belongs to U16 Development, not U18 Performance"), `[${n}] session from another group is rejected`);
  // The group page's primary action is Invite (D-073); attendance belongs to the session.
  await go("/groups/g2");
  ok((await main.getByRole("link", { name: "Take attendance" }).count()) === 0, `[${n}] no Take attendance on the group page`);
  await go("/attendance?group=g2");
  await main.getByText("Recent sessions").waitFor(); // the group is read from the URL after hydration
  ok(clean(await main.innerText()).includes("U18 Performance"), `[${n}] attendance keeps the group from the URL`);

  // ---- 4. Back navigation (coach) --------------------------------------------
  await go("/groups");
  await main.getByRole("link", { name: /U16 Development/ }).click();
  await page.waitForURL(`${BASE}/groups/g1`, commit);
  await groupTab(page, "Sessions"); // the group page's tabs (D-074)
  await main.locator("section:has(h2:text('Upcoming sessions')) a[href^='/calendar/g1-']").first().click();
  await page.waitForURL(/\/calendar\/g1-/, commit);
  await main.locator("h1").first().waitFor();
  ok((await backLabel()) === "U16 Development", `[${n}] session from a group: back says the group`);
  await back().click();
  await page.waitForURL(`${BASE}/groups/g1`, commit);
  ok((await backLabel()) === "Groups", `[${n}] back returns to the group, which goes back to Groups`);
  await page.goBack();
  await page.waitForURL(`${BASE}/groups`, commit);
  ok(true, `[${n}] browser back keeps the same order`);
  await go("/groups/g4");
  await groupTab(page, "Exercises");
  await main.locator("section:has(h2:text('Exercises')) a[href^='/library/e']").first().click();
  await page.waitForURL(/\/library\/e\d$/, commit);
  await main.locator("h1").waitFor();
  ok((await backLabel()) === "Adult Improvers", `[${n}] assigned video from a group: back to the group`);
  await back().click();
  await page.waitForURL(`${BASE}/groups/g4`, commit);
  ok(true, `[${n}] returned to the group`);
  // After a form: back skips the form
  await go("/calendar?date=2026-10-15");
  if (vp.width >= 768) await main.getByRole("list", { name: /Sessions on Thursday 15 Oct/ }).getByRole("link").first().click();
  else await main.getByRole("region", { name: /^Tomorrow/ }).getByRole("link").first().click();
  await page.waitForURL(`${BASE}/calendar/g2-2026-10-15`, commit);
  await main.getByRole("link", { name: "Reschedule or move" }).click();
  await page.waitForURL(/edit$/, commit);
  await page.getByLabel("Location").fill("Court 6");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForURL(`${BASE}/calendar/g2-2026-10-15`, commit);
  await main.getByRole("status").getByText("Session changed").waitFor();
  ok((await backLabel()) === "Calendar", `[${n}] after saving, back points to the calendar, not the form`);
  await page.goBack();
  await page.waitForURL(/\/calendar\?date=2026-10-15$/, commit);
  ok(true, `[${n}] browser back after saving skips the form`);
  // Direct entry: no history -> parent page
  await go("/library/e1");
  ok((await backLabel()) === "Library" && (await back().getAttribute("href")) === "/library", `[${n}] direct entry: back to the parent`);
  await back().click();
  await page.waitForURL(`${BASE}/library`, commit);
  await go("/calendar/g1-2026-10-12");
  // A session belongs to Home since D-071: opened directly, it goes back there.
  ok((await back().getAttribute("href")) === "/" && (await backLabel()) === "Home", `[${n}] direct session: back to Home`);

  // ---- 5. Back navigation (participant) ---------------------------------------
  await go("/me/videos");
  await main.locator("a[href^='/me/videos/e']").first().click();
  await page.waitForURL(/\/me\/videos\/e\d$/, commit);
  await main.locator("h1").waitFor();
  ok((await backLabel()) === "Exercises", `[${n}] participant: video from Exercises goes back there`);
  await go("/me/calendar?date=2026-10-15");
  // The selected day under the grid from 768 px; the month agenda on phones (D-073).
  if (vp.width >= 768) await main.getByRole("list", { name: /Sessions on Thursday 15 Oct/ }).getByRole("link").first().click();
  else await main.getByRole("region", { name: /^Tomorrow/ }).getByRole("link").first().click();
  await page.waitForURL(/\/me\/calendar\/g\d-2026-10-15/, commit);
  await main.locator("h1").first().waitFor();
  ok((await backLabel()) === "Calendar", `[${n}] participant: session from the calendar`);
  await back().click();
  await page.waitForURL(/\/me\/calendar\?date=2026-10-15$/, commit);
  await go("/me/videos/e8");
  ok((await backLabel()) === "Exercises" && (await back().getAttribute("href")) === "/me/videos", `[${n}] participant direct entry: parent page`);

  // Reset local changes for the next viewport
  await go("/library");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await finish(page, vp);
}
await browser.close();
done();

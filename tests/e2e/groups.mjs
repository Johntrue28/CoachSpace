// Groups (D-046): the groups list, a group's page with its actions and sections, the list of
// groups beside an open group from 1280 px, participant search, navigation and the participant view.
import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav, groupTab } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();
const commit = { waitUntil: "commit" };

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

  // 1. Groups list from the navigation.
  await go("/");
  await mainNav(page).getByRole("link", { name: "Groups", exact: true }).click();
  await page.waitForURL(`${BASE}/groups`);
  await page.waitForLoadState("networkidle");
  ok((await page.locator("h1").innerText()) === "Groups", `[${n}] Groups page title`);
  ok((await mainNav(page).getByRole("link", { name: "Groups", exact: true }).getAttribute("aria-current")) === "page", `[${n}] navigation marks Groups`);
  // People against memberships, explained from 640 px (no explanatory text on phones, D-073).
  const totals = clean(await main.innerText());
  ok(totals.includes("5 groups · 31 participants") && (vp.width >= 640) === totals.includes("1 person is in more than one group, so group sizes add up to more"), `[${n}] totals from the demo data, people against memberships explained`);
  // One surface with a row per group (D-073), each opening the group.
  const cards = main.getByRole("list", { name: "Your groups" }).getByRole("link");
  ok((await cards.count()) === 5, `[${n}] one row per group`);
  const u16 = clean(await cards.nth(0).innerText());
  ok(
    u16.includes("U16 Development") && u16.includes("8 participants · Mon & Wed · 17:00") && u16.includes("Next: Today, 17:00"),
    `[${n}] row shows size, schedule and next session (${u16})`,
  );
  ok(clean(await cards.nth(4).innerText()).includes("Next: Tomorrow, 19:30"), `[${n}] next session from the calendar`);
  ok((await main.getByText("unread in the group chat").count()) === 3, `[${n}] unread group chats marked`);
  ok((await main.getByRole("link", { name: "New group" }).getAttribute("href")) === "/groups/new", `[${n}] New group is the page's action (D-072)`);
  const tops = await cards.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  ok(tops.every((t, i) => i === 0 || t > tops[i - 1]), `[${n}] rows stacked in one list`);
  await page.screenshot({ path: `${OUT}/groups-${n}-list.png`, fullPage: true });

  // 2. A group's page.
  await cards.nth(1).click();
  await page.waitForURL(`${BASE}/groups/g2`, commit);
  await main.locator("h1").waitFor();
  ok((await page.locator("h1").innerText()) === "U18 Performance", `[${n}] group page opens`);
  const header = main.getByRole("region", { name: "U18 Performance" });
  const headerText = clean(await header.innerText());
  ok(
    headerText.includes("TENNIS") && headerText.includes("Coach Laura Gomez · 6 participants · 8 places") && headerText.includes("Tue & Thu · 17:30") && headerText.includes("Courts 1–2"),
    `[${n}] header shows sport, coach, size, places, schedule and place (${headerText})`,
  );
  // One primary action, Invite (D-073), in a header of the group's colour (D-074); the chat and Edit beside it.
  ok((await header.getByRole("button", { name: "Invite" }).count()) === 1, `[${n}] Invite is the primary action`);
  const actions = await header.getByRole("link").evaluateAll((as) => as.map((a) => `${a.getAttribute("aria-label") ?? a.textContent.trim()}=${a.getAttribute("href")}`));
  ok(actions.join("|") === "Group chat=/chat/c-g2|Edit=/groups/g2/edit", `[${n}] group actions (${actions.join("|")})`);
  for (const a of actions) ok((await page.request.get(BASE + a.split("=").slice(1).join("="))).ok(), `[${n}] action target ${a.split("=")[0]} loads`);
  const tabs = await main.getByRole("tablist", { name: "Group sections" }).getByRole("tab").allInnerTexts();
  ok(tabs.join("|") === "Players · 6|Sessions|Exercises|Announcements", `[${n}] group tabs (${tabs.join("|")})`);

  // Players: who is coming next and their attendance.
  const people = main.getByRole("list", { name: "Players" });
  ok((await people.getByRole("listitem").count()) === 6 && (await main.getByRole("button", { name: "Add member" }).count()) === 1, `[${n}] players listed with Add member`);
  ok(clean(await main.locator("#players-heading").innerText()).startsWith("Next session: Tomorrow, 17:30"), `[${n}] the next session heads the list`);
  const lucia = people.getByRole("listitem").first();
  ok(clean(await lucia.innerText()).startsWith("LO Lucia Ortega Attendance"), `[${n}] each player with their attendance (${clean(await lucia.innerText()).slice(0, 50)})`);

  // Sessions tab.
  await groupTab(page, "Sessions");
  await main.getByRole("region", { name: "Upcoming sessions" }).getByRole("listitem").first().waitFor();
  const sessions = await main.getByRole("region", { name: "Upcoming sessions" }).getByRole("listitem").allInnerTexts();
  ok(sessions.length >= 3 && sessions.every((t) => t.includes("17:30")), `[${n}] upcoming sessions of this group only`);
  await groupTab(page, "Players");

  // 3. Player search, from more than six members (U16 Development has eight).
  await go("/groups/g1");
  const search = main.getByRole("searchbox", { name: "Search participants" });
  await search.fill("intermediate");
  const found = await main.getByRole("list", { name: "Players" }).getByRole("listitem").count();
  ok(found > 0 && found < 8, `[${n}] search by level (${found})`);
  await search.fill("zzz");
  ok(await main.getByText("No participants match").isVisible(), `[${n}] search empty state`);
  await go("/groups/g2");

  // 4. The other groups beside the open one (from 1280 px), or back to the list.
  const rail = main.getByRole("navigation", { name: "All groups" });
  if (wide) {
    ok(await rail.isVisible(), `[${n}] all groups listed beside the group`);
    ok((await rail.locator("a[aria-current=page]").innerText()).includes("U18 Performance"), `[${n}] open group marked in the list`);
    const railBox = await rail.boundingBox();
    const headerBox = await header.boundingBox();
    ok(railBox.x + railBox.width <= headerBox.x && Math.abs(railBox.y - headerBox.y) < 2, `[${n}] list on the left, group on the right`);
    await page.screenshot({ path: `${OUT}/groups-${n}-detail.png`, fullPage: true });
    await rail.getByRole("link", { name: /Adult Beginners/ }).click();
    await page.waitForURL(`${BASE}/groups/g3`, commit);
    await page.locator("h1", { hasText: "Adult Beginners" }).waitFor();
    ok((await rail.locator("a[aria-current=page]").innerText()).includes("Adult Beginners"), `[${n}] another group opens from the list`);
  } else {
    ok(!(await rail.isVisible()), `[${n}] no side list on small screens`);
    await page.screenshot({ path: `${OUT}/groups-${n}-detail.png`, fullPage: true });
    await main.getByRole("link", { name: "Groups", exact: true }).click();
    await page.waitForURL(`${BASE}/groups`, commit);
    await main.getByRole("link", { name: /Adult Beginners/ }).click();
    await page.waitForURL(`${BASE}/groups/g3`, commit);
    await page.locator("h1", { hasText: "Adult Beginners" }).waitFor();
    ok(true, `[${n}] back to the list and into another group`);
  }

  // 5. Links lead to the group's calendar and chat.
  await groupTab(page, "Sessions");
  await main.getByRole("region", { name: "Upcoming sessions" }).getByRole("link", { name: /^Calendar/ }).click();
  await main.getByRole("button", { name: "Groups shown: Adult Beginners" }).waitFor();
  await page.waitForURL(`${BASE}/calendar`, commit);
  ok(true, `[${n}] the Calendar link opens the calendar for this group`);
  await main.getByRole("button", { name: "Show all groups" }).click();
  await go("/groups/g3");
  await main.getByRole("link", { name: "Group chat", exact: true }).click();
  await page.waitForURL(`${BASE}/chat/c-g3`, commit);
  await page.getByRole("log").waitFor();
  ok(true, `[${n}] Group chat opens the group's conversation`);

  // 6. Attendance is taken from the session, not the group page (D-073).
  await go("/groups/g1");
  ok((await main.getByRole("link", { name: "Take attendance" }).count()) === 0, `[${n}] no Take attendance on the group page`);

  // 7. Participant view: own groups only, no coach actions.
  await go("/me/groups/g5");
  ok((await page.locator("h1").innerText()) === "Club Competition Team", `[${n}] participant group page`);
  const meHeader = main.getByRole("region", { name: "Club Competition Team" });
  ok(
    (await meHeader.getByRole("link").allInnerTexts()).map(clean).join("|") === "Open group chat",
    `[${n}] participant header only offers the group chat`,
  );
  ok((await main.getByRole("link", { name: /Take attendance|View sessions|New/ }).count()) === 0, `[${n}] no coach actions for the participant`);
  ok((await main.getByText("Marcus Reid").count()) === 0, `[${n}] participant does not see the member list`);
  // /me/groups/g1 is built in advance (another scenario's demo participant is in g1), so the
  // Tennis Coaching refuses it in the browser instead of with a 404.
  await go("/me/groups/g1");
  await main.getByText("This group is not available.").waitFor();
  ok((await main.getByText("U16 Development").count()) === 0 && (await main.getByRole("link", { name: "Open group chat" }).count()) === 0, `[${n}] other groups are not available to the participant`);

  await finish(page, vp);
}
await browser.close();
done();

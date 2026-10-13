// Groups (D-046): the groups list, a group's page with its actions and sections, the list of
// groups beside an open group from 1280 px, participant search, navigation and the participant view.
import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav } from "./lib.mjs";
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
  ok(clean(await main.innerText()).includes("5 groups · 31 participants"), `[${n}] totals from the demo data`);
  const cards = main.getByRole("list").first().getByRole("link");
  ok((await cards.count()) === 5, `[${n}] one card per group`);
  const u16 = clean(await cards.nth(0).innerText());
  ok(
    u16.includes("U16 Development") && u16.includes("Tennis · 8 participants") && u16.includes("Mon & Wed · 17:00") && u16.includes("Courts 3–4") && u16.includes("Next: Today, 17:00"),
    `[${n}] card shows sport, size, schedule, place and next session (${u16})`,
  );
  ok(clean(await cards.nth(4).innerText()).includes("Next: Tomorrow, 19:30"), `[${n}] next session from the calendar`);
  ok((await main.getByText("unread in the group chat").count()) === 3, `[${n}] unread group chats marked`);
  ok((await main.getByRole("link", { name: /Create group|Add participant/ }).count()) === 0, `[${n}] no group management buttons that do nothing`);
  const tops = await cards.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  ok(vp.width >= 768 ? tops[0] === tops[1] : tops[1] > tops[0], `[${n}] cards in ${vp.width >= 768 ? "two columns" : "one column"}`);
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
  const actions = await header.getByRole("link").evaluateAll((as) => as.map((a) => `${a.textContent.trim()}=${a.getAttribute("href")}`));
  ok(
    actions.join("|") === "Take attendance=/attendance?group=g2|Group chat=/chat/c-g2|View sessions=/calendar?group=g2",
    `[${n}] group actions (${actions.join("|")})`,
  );
  for (const a of actions) ok((await page.request.get(BASE + a.split("=").slice(1).join("="))).ok(), `[${n}] action target ${a.split("=")[0]} loads`);
  const sections = await main.locator("section h2").allInnerTexts();
  ok(sections.join("|") === "Participants|Upcoming sessions|Announcements|Videos & Exercises", `[${n}] group sections (${sections.join("|")})`);
  const people = main.getByRole("region", { name: "Participants" });
  ok(clean(await people.innerText()).includes("6 total") && (await people.getByRole("listitem").count()) === 6, `[${n}] participants listed with total`);
  ok(clean(await people.getByRole("listitem").first().innerText()).startsWith("LO Lucia Ortega Baseline player Since Sep 2022"), `[${n}] participant name, position and start`);
  const sessions = await main.getByRole("region", { name: "Upcoming sessions" }).getByRole("listitem").allInnerTexts();
  ok(sessions.length === 3 && sessions.every((t) => t.includes("17:30")), `[${n}] upcoming sessions of this group only`);

  // 3. Participant search.
  await people.getByRole("searchbox", { name: "Search participants" }).fill("player");
  ok((await people.getByRole("listitem").count()) === 4, `[${n}] search by position`);
  await people.getByRole("searchbox", { name: "Search participants" }).fill("zzz");
  ok(await people.getByText("No participants match").isVisible(), `[${n}] search empty state`);
  await people.getByRole("searchbox", { name: "Search participants" }).fill("");

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

  // 5. Actions lead to the group's calendar and chat.
  await main.getByRole("link", { name: "View sessions" }).click();
  await main.getByRole("button", { name: "Groups shown: Adult Beginners" }).waitFor();
  await page.waitForURL(`${BASE}/calendar`, commit);
  ok(true, `[${n}] View sessions opens the calendar for this group`);
  await main.getByRole("button", { name: "Show all groups" }).click();
  await go("/groups/g3");
  await main.getByRole("link", { name: "Group chat", exact: true }).click();
  await page.waitForURL(`${BASE}/chat/c-g3`, commit);
  await page.getByRole("log").waitFor();
  ok(true, `[${n}] Group chat opens the group's conversation`);

  // 6. Attendance off: no Take attendance on the group page.
  await go("/settings?section=features");
  await page.getByRole("switch", { name: "Attendance tracking" }).click();
  await go("/groups/g1");
  ok((await main.getByRole("link", { name: "Take attendance" }).count()) === 0, `[${n}] attendance off: action hidden`);
  ok(await main.getByRole("link", { name: "View sessions" }).isVisible(), `[${n}] attendance off: other actions stay`);
  await go("/settings?section=features");
  await page.getByRole("switch", { name: "Attendance tracking" }).click();

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
  // Tennis Club refuses it in the browser instead of with a 404.
  await go("/me/groups/g1");
  await main.getByText("This group is not available.").waitFor();
  ok((await main.getByText("U16 Development").count()) === 0 && (await main.getByRole("link", { name: "Open group chat" }).count()) === 0, `[${n}] other groups are not available to the participant`);

  await finish(page, vp);
}
await browser.close();
done();

import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav, coachNavLabels } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (t) => t.replace(/\s+/g, " ");
for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  const n = vp.name;
  const nav = mainNav(page);

  // Role switch
  await page.goto(`${BASE}/`);
  ok(await page.getByText("not a real sign-in").filter({ visible: true }).first().isVisible(), `[${n}] switcher says it is not a real sign-in`);
  ok((await nav.getByRole("link").allInnerTexts()).map((t) => t.replace(/[0-9+]/g, "").trim()).join("|") === coachNavLabels(vp), `[${n}] coach navigation`);
  await page.getByRole("navigation", { name: "Demo view" }).getByRole("link", { name: "Participant" }).click();
  await page.waitForURL(`${BASE}/me`);
  ok((await nav.getByRole("link").allInnerTexts()).map((t) => t.replace(/[0-9+]/g, "").trim()).join("|") === "Home|Calendar|My Videos|Chat", `[${n}] participant navigation`);
  ok(await page.getByText("Jordan Hale, a fictional participant").filter({ visible: true }).first().isVisible(), `[${n}] fictional participant clearly identified`);
  ok(/^(Good (morning|afternoon|evening)|Welcome), Jordan$/.test(await page.locator("h1").innerText()), `[${n}] participant home`);

  // Home content
  const card = clean(await page.locator("div:has(> p:text('Next session'))").innerText());
  ok(card.includes("Morning Pilates · Tomorrow, 08:30"), `[${n}] next session from own groups (${card})`);
  const groupsCard = clean(await page.locator("section:has(h2:text('My groups'))").innerText());
  ok(groupsCard.includes("Senior Basketball") && groupsCard.includes("Morning Pilates") && !groupsCard.includes("U12"), `[${n}] own groups only`);
  const ann = await page.locator("section:has(h2:text('Announcements')) article h3").allInnerTexts();
  ok(ann.join("|") === "Change of venue|Lost property|Bring a small towel", `[${n}] announcements for own groups and all groups (${ann.join("|")})`);
  const cal = page.locator("section:has(h2:text('Calendar'))");
  await cal.getByRole("button", { name: /^Thursday 15 Oct/ }).click();
  const up = await cal.locator("ul > li").allInnerTexts();
  ok(up.length === 2 && up.every((t) => /Senior Basketball|Morning Pilates/.test(t)), `[${n}] home calendar shows own groups' sessions on a date (${up.length})`);
  await page.screenshot({ path: `${OUT}/me-${n}-1-home.png`, fullPage: true });

  // No coach controls anywhere in the participant view
  const coachControls = ["Take attendance", "Post one", "Reset demo data", "Assign", "Save assignments", "New"];
  const pages = ["/me", "/me/groups/g2", "/me/groups/g4", "/me/calendar", "/me/calendar/g2-2026-10-15", "/me/videos", "/me/videos/e8", "/me/chat", "/me/chat/c-g2"];
  let leaks = [];
  for (const p of pages) {
    await page.goto(`${BASE}${p}`);
    await page.waitForLoadState("networkidle");
    for (const c of coachControls) if (await page.locator("main").getByRole("link", { name: c, exact: true }).or(page.locator("main").getByRole("button", { name: c, exact: true })).count()) leaks.push(`${p}:${c}`);
    if (await page.locator("main").getByRole("link", { name: "Edit", exact: true }).count()) leaks.push(`${p}:Edit`);
  }
  ok(leaks.length === 0, `[${n}] no coach management controls on participant pages ${leaks.join(", ")}`);

  // Group page
  await page.goto(`${BASE}/me/groups/g4`);
  const g4 = clean(await page.locator("main").innerText());
  ok(g4.includes("The Hundred") && g4.includes("Tue & Thu · 08:30"), `[${n}] participant group page with schedule and own exercises`);

  // Calendar
  await page.goto(`${BASE}/me/calendar?view=week`);
  await page.getByText("12 Oct – 18 Oct 2026").waitFor();
  const sessions = await page.locator("ol > li ul > li").allInnerTexts();
  ok(sessions.length === 4 && sessions.every((t) => /Senior Basketball|Morning Pilates/.test(t)), `[${n}] calendar shows only own groups (${sessions.length})`);
  await page.getByRole("link", { name: "Next week" }).click();
  await page.waitForURL(/\/me\/calendar\?view=week&week=2026-10-19/);
  ok(true, `[${n}] week navigation stays in participant view`);
  await page.locator("ol > li ul > li a").first().click();
  await page.waitForURL(/\/me\/calendar\/g\d-2026-10-2\d/);
  ok(!(await page.getByText("Attendance").count()), `[${n}] session detail without attendance`);

  // My Videos: unified, deduplicated, filters
  await page.goto(`${BASE}/me/videos`);
  await page.locator("main ul > li").first().waitFor();
  const vids = await page.locator("main ul > li p.font-semibold").allInnerTexts();
  ok(vids.length === 2 && new Set(vids).size === 2, `[${n}] My Videos lists each exercise once (${vids.join(", ")})`);
  const hundred = clean(await page.locator("main ul > li", { hasText: "The Hundred" }).innerText());
  ok(hundred.includes("Morning Pilates") && hundred.includes("Senior Basketball · just for you"), `[${n}] shows both reasons for The Hundred`);
  await page.getByRole("button", { name: "Senior Basketball" }).click();
  ok((await page.locator("main ul > li").count()) === 2, `[${n}] group filter (basketball: both)`);
  await page.getByRole("button", { name: "Morning Pilates" }).click();
  ok((await page.locator("main ul > li").count()) === 1, `[${n}] group filter (Pilates: one)`);
  await page.getByRole("button", { name: "All groups" }).click();
  const categoryChip = (name) => page.getByRole("group", { name: "Category" }).getByRole("button", { name, exact: true });
  await categoryChip("Warm-up").click();
  ok((await page.locator("main ul > li").count()) === 1, `[${n}] category filter`);
  await categoryChip("Mobility").click();
  ok(await page.getByText("No exercises match your filters.").isVisible(), `[${n}] empty filter state`);
  await categoryChip("All categories").click();
  await page.screenshot({ path: `${OUT}/me-${n}-2-videos.png`, fullPage: true });
  await page.locator("main ul > li", { hasText: "The Hundred" }).getByRole("link").click();
  await page.waitForURL(`${BASE}/me/videos/e8`);
  const det = clean(await page.locator("main").innerText());
  ok(det.includes("Jordan: add this to your routine before basketball sessions.") && det.includes("MORNING PILATES"), `[${n}] detail shows instructions per group`);
  await page.goto(`${BASE}/me/videos/e2`);
  ok(await page.getByText("This exercise is not assigned to you.").waitFor({ timeout: 5000 }).then(() => true, () => false), `[${n}] unassigned exercise not shown`);

  // A new assignment from the coach appears (same device)
  await page.goto(`${BASE}/library/e5/assign`);
  await page.getByRole("group", { name: "Who in Senior Basketball" }).getByRole("button", { name: "Whole group" }).click();
  await page.getByRole("button", { name: "Save assignments" }).click();
  await page.waitForURL(/\/library\/e5$/);
  await page.goto(`${BASE}/me/videos`);
  await page.getByText("Defensive slides").waitFor();
  ok((await page.locator("main ul > li").count()) === 3, `[${n}] coach's new assignment appears in My Videos`);

  // Chat as Jordan
  await page.goto(`${BASE}/me/chat`);
  await page.getByRole("heading", { name: "Group chats" }).waitFor();
  const convs = clean(await page.locator("main").innerText());
  ok((await page.locator("main ul > li").count()) === 3 && convs.includes("Laura Gomez") && !convs.includes("U12 Football"), `[${n}] only own conversations + chat with coach`);
  await page.getByRole("link", { name: /Senior Basketball/ }).click();
  await page.waitForURL(`${BASE}/me/chat/c-g2`);
  await page.getByLabel("Message to Senior Basketball").fill("I'll bring the ball pump.");
  await page.getByRole("button", { name: "Send message" }).click();
  const last = page.locator("ol[role=log] li").last();
  await last.getByText("I'll bring the ball pump.").waitFor();
  ok((await last.innerText()).includes("Not delivered (demo)"), `[${n}] participant message is simulated`);
  ok((await page.locator("ol[role=log] li").filter({ hasText: "Yes, 19:30" }).innerText()).includes("Laura Gomez"), `[${n}] coach shown as another sender`);
  await page.screenshot({ path: `${OUT}/me-${n}-3-chat.png` });
  // Coach sees Jordan's message in the same (in-memory) demo session
  await page.getByRole("navigation", { name: "Demo view" }).getByRole("link", { name: "Coach" }).click();
  await page.waitForURL(`${BASE}/`);
  await nav.getByRole("link", { name: /^Chat(,|$)/ }).click();
  await page.waitForURL(`${BASE}/chat`);
  await page.getByRole("heading", { name: "Group chats" }).waitFor();
  const row = clean(await page.locator(`a[href="/chat/c-g2"]`).innerText());
  ok(row.includes("Jordan: I'll bring the ball pump."), `[${n}] same demo session: coach list shows Jordan's message`);

  // Outside own groups: 404 / not available
  for (const p of ["/me/groups/g1", "/me/chat/c-g1", "/me/chat/c-p11", "/me/calendar/g1-2026-10-12"]) {
    const res = await page.request.get(`${BASE}${p}`);
    ok(res.status() === 404, `[${n}] ${p} is not available to the participant (${res.status()})`);
  }
  page.errors = page.errors.filter((e) => !e.includes("404"));
  // Reset for the next viewport
  await page.goto(`${BASE}/library`);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await finish(page, vp);
}
await browser.close();
done();

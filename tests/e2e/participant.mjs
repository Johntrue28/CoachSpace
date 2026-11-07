import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav, coachNavLabels, participantNavLabels } from "./lib.mjs";
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
  ok((await page.getByRole("navigation", { name: "Demo view (not a real sign-in)" }).filter({ visible: true }).count()) >= 1, `[${n}] switcher says it is not a real sign-in`);
  ok((await nav.getByRole("link").allInnerTexts()).map((t) => t.replace(/[0-9+]/g, "").trim()).join("|") === coachNavLabels(vp), `[${n}] coach navigation`);
  await page.getByRole("navigation", { name: /^Demo view/ }).getByRole("link", { name: /^(Participant|Player)$/ }).click();
  await page.waitForURL(`${BASE}/me`);
  ok((await nav.getByRole("link").allInnerTexts()).map((t) => t.replace(/[0-9+]/g, "").trim()).join("|") === participantNavLabels, `[${n}] participant navigation`);
  ok(clean(await page.locator("main").innerText()).includes("Demo with fictional data"), `[${n}] fictional data clearly stated`);
  ok((await page.locator("h1").innerText()) === "Hi Jordan", `[${n}] participant home`);

  // Home content (D-071): the player's next sessions, each with the one-tap answer.
  const myGroups = clean(await page.locator("main > p").first().textContent());
  ok(myGroups.includes("Adult Improvers") && myGroups.includes("Club Competition Team") && !myGroups.includes("U16"), `[${n}] own groups only (${myGroups})`);
  const next = page.locator("main").getByRole("region", { name: "My next sessions" }).locator("ul > li");
  await next.first().waitFor();
  const nextTexts = (await next.allInnerTexts()).map(clean);
  ok(nextTexts[0].includes("Serve consistency") && nextTexts[0].includes("Adult Improvers") && nextTexts.every((t) => /Adult Improvers|Club Competition Team/.test(t)), `[${n}] next sessions from own groups (${nextTexts[0]})`);
  ok((await next.first().getByRole("group", { name: /Are you coming/ }).getByRole("button").count()) === 3, `[${n}] Going / Maybe / Can't go on each session`);
  const ann = await page.locator("section:has(h2:text('Announcements')) article h3").allInnerTexts();
  ok(ann.join("|") === "League match against Westbrook|Riverside Park floodlights", `[${n}] announcements for own groups and all groups (${ann.join("|")})`);
  await page.screenshot({ path: `${OUT}/me-${n}-1-home.png`, fullPage: true });

  // No coach controls anywhere in the participant view
  const coachControls = ["Take attendance", "Post one", "Reset demo data", "Assign", "Save assignments", "New"];
  const pages = ["/me", "/me/groups/g5", "/me/groups/g4", "/me/calendar", "/me/calendar/g5-2026-10-15", "/me/videos", "/me/videos/e8", "/me/chat", "/me/chat/c-g5"];
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
  await page.waitForLoadState("networkidle");
  const g4 = clean(await page.locator("main").innerText());
  ok(g4.includes("Dynamic court warm-up") && g4.includes("Wed & Sat · 19:00 / 10:00"), `[${n}] participant group page with schedule and own exercises`);

  // Calendar
  await page.goto(`${BASE}/me/calendar?view=week`);
  await page.getByText("12 Oct – 18 Oct 2026").waitFor();
  const sessions = await page.locator("ol > li ul > li").allInnerTexts();
  ok(sessions.length === 3 && sessions.every((t) => /Adult Improvers|Club Competition Team/.test(t)), `[${n}] calendar shows only own groups (${sessions.length})`);
  await page.getByRole("link", { name: "Next week" }).click();
  await page.waitForURL(/\/me\/calendar\?view=week&week=2026-10-19/);
  ok(true, `[${n}] week navigation stays in participant view`);
  await page.locator("ol > li ul > li a").first().click();
  await page.waitForURL(/\/me\/calendar\/g\d-2026-10-2\d/);
  await page.getByText("Coach: Laura Gomez").waitFor();
  ok(!(await page.getByText("Attendance").count()), `[${n}] session detail without attendance`);

  // The Tennis Coaching seed has no exercise that reaches Jordan through two groups, so the coach first
  // gives the split-step drill (just for Jordan in the Club Competition Team) to the whole of Adult
  // Improvers. It then reaches him in two ways, as The Hundred did in the old mixed-sport data.
  await page.goto(`${BASE}/library/e5/assign`);
  await page.getByRole("group", { name: "Who in Adult Improvers" }).getByRole("button", { name: "Whole group" }).click();
  await page.getByRole("button", { name: "Save assignments" }).click();
  await page.waitForURL(/\/library\/e5$/);

  // Exercises (D-073 rows): unified, deduplicated, filters
  const vrows = () => page.locator("main").getByRole("list", { name: "Your exercises" }).getByRole("listitem");
  await page.goto(`${BASE}/me/videos`);
  await page.waitForLoadState("networkidle");
  await vrows().first().waitFor();
  const vids = await vrows().evaluateAll((els) => els.map((e) => e.querySelector("a span span")?.textContent ?? ""));
  ok(vids.length === 4 && new Set(vids).size === 4, `[${n}] My Videos lists each exercise once (${vids.join(", ")})`);
  const split = clean(await vrows().filter({ hasText: "Split-step and recovery footwork" }).innerText());
  ok(split.includes("Adult Improvers") && split.includes("Club Competition Team · just for you"), `[${n}] shows both reasons for the split-step drill`);
  await page.getByRole("button", { name: "Adult Improvers" }).click();
  ok((await vrows().count()) === 3, `[${n}] group filter (Adult Improvers: three)`);
  await page.getByRole("button", { name: "Club Competition Team" }).click();
  ok((await vrows().count()) === 2, `[${n}] group filter (Club Competition Team: two)`);
  await page.getByRole("button", { name: "All groups" }).click();
  const categoryChip = (name) => page.getByRole("group", { name: "Category" }).getByRole("button", { name, exact: true });
  await categoryChip("Warm-up").click();
  ok((await vrows().count()) === 1, `[${n}] category filter`);
  // Only the categories of the player's own exercises are offered (D-073): no Mobility chip.
  ok((await categoryChip("Mobility").count()) === 0, `[${n}] category chips follow the player's exercises`);
  await categoryChip("All categories").click();
  await page.screenshot({ path: `${OUT}/me-${n}-2-videos.png`, fullPage: true });
  await vrows().filter({ hasText: "Split-step and recovery footwork" }).getByRole("link").click();
  await page.waitForURL(`${BASE}/me/videos/e5`);
  await page.locator("h1").waitFor();
  const det = clean(await page.locator("main").innerText());
  ok(det.includes("Jordan: add one set before Thursday's match practice.") && det.includes("ADULT IMPROVERS"), `[${n}] detail shows instructions per group`);
  await page.goto(`${BASE}/me/videos/e3`);
  ok(await page.getByText("This exercise is not assigned to you.").waitFor({ timeout: 5000 }).then(() => true, () => false), `[${n}] unassigned exercise not shown`);

  // A new assignment from the coach appears (same device)
  await page.goto(`${BASE}/library/e3/assign`);
  await page.getByRole("group", { name: "Who in Adult Improvers" }).getByRole("button", { name: "Whole group" }).click();
  await page.getByRole("button", { name: "Save assignments" }).click();
  await page.waitForURL(/\/library\/e3$/);
  await page.goto(`${BASE}/me/videos`);
  await page.waitForLoadState("networkidle");
  await page.getByText("Cross-court forehand consistency").waitFor();
  ok((await vrows().count()) === 5, `[${n}] coach's new assignment appears in My Videos`);

  // Chat as Jordan
  await page.goto(`${BASE}/me/chat`);
  await page.waitForLoadState("networkidle");
  await page.getByRole("heading", { name: "Group chats" }).waitFor();
  const convs = clean(await page.locator("main").innerText());
  ok((await page.locator("main ul > li").count()) === 3 && convs.includes("Laura Gomez") && !convs.includes("U16 Development"), `[${n}] only own conversations + chat with coach`);
  await page.getByRole("link", { name: /Club Competition Team/ }).click();
  await page.waitForURL(`${BASE}/me/chat/c-g5`);
  await page.getByLabel("Message to Club Competition Team").fill("I'll bring a spare tube of balls.");
  await page.getByRole("button", { name: "Send message" }).click();
  const last = page.locator("ol[role=log] li").last();
  await last.getByText("I'll bring a spare tube of balls.").waitFor();
  ok((await last.innerText()).includes("Not delivered (demo)"), `[${n}] participant message is simulated`);
  ok((await page.locator("ol[role=log] li").filter({ hasText: "Yes, Thursday starts with return-of-serve positioning." }).innerText()).includes("Laura Gomez"), `[${n}] coach shown as another sender`);
  await page.screenshot({ path: `${OUT}/me-${n}-3-chat.png` });
  // Coach sees Jordan's message in the same demo session
  await page.getByRole("navigation", { name: /^Demo view/ }).getByRole("link", { name: "Coach" }).click();
  await page.waitForURL(`${BASE}/`);
  await nav.getByRole("link", { name: /^Messages(,|$)/ }).click();
  await page.waitForURL(`${BASE}/chat`);
  await page.getByRole("heading", { name: "Group chats" }).waitFor();
  const row = clean(await page.locator(`a[href="/chat/c-g5"]`).innerText());
  ok(row.includes("Jordan: I'll bring a spare tube of balls."), `[${n}] same demo session: coach list shows Jordan's message`);

  // Outside own groups: not available. Group and chat ids are resolved in the browser for the active
  // scenario (D-053, D-054), so these pages say so and show nothing of the group or the chat.
  for (const [p, text, hidden] of [
    ["/me/groups/g1", "This group is not available.", "U16 Development"],
    ["/me/groups/g2", "This group is not available.", "U18 Performance"],
    ["/me/chat/c-g1", "This conversation is not available in this demo.", "U16 Development"],
    ["/me/chat/c-g2", "This conversation is not available in this demo.", "U18 Performance"],
    ["/me/chat/c-p27", "This conversation is not available in this demo.", "Marcus Reid"],
    ["/me/calendar/g1-2026-10-12", "This session is not available.", "U16 Development"],
  ]) {
    await page.goto(`${BASE}${p}`);
    await page.waitForLoadState("networkidle");
    const shown = await page.locator("main").getByText(text).waitFor({ timeout: 5000 }).then(() => true, () => false);
    ok(shown && !(await page.locator("main").innerText()).includes(hidden), `[${n}] ${p} is not available to the participant`);
    ok((await page.locator("main").getByRole("textbox").count()) === 0, `[${n}] ${p} offers no message box`);
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

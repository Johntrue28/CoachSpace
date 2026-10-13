// Coach dashboard (D-044): header, figures from the demo data, upcoming sessions, quick actions,
// groups, and how the global attendance switch (D-042) changes it.
import { chromium, BASE, ok, viewports, newPage, finish, done } from "./lib.mjs";
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
  const stats = () => main.locator("ul").first().locator("> li");
  const statText = async () => (await stats().evaluateAll((els) => els.map((e) => e.textContent.replace(/\s+/g, " ").trim())));
  const quickLinks = () => main.getByRole("region", { name: "Quick actions" }).filter({ visible: true }).getByRole("link");

  // 1. Header and figures.
  await go("/");
  ok((await page.locator("h1").innerText()) === "Good afternoon, Laura", `[${n}] greeting for the time of day`);
  ok(clean(await main.innerText()).toUpperCase().includes("WEDNESDAY 14 OCTOBER"), `[${n}] today's date in the header`);
  ok((await main.getByText("Hi, Laura").count()) === 0, `[${n}] old green banner gone`);
  let figures = await statText();
  ok(figures.length === 3, `[${n}] three figures`);
  ok(figures[0].startsWith("31Participants") && figures[0].includes("Across 5 groups"), `[${n}] participants (${figures[0]})`);
  ok(figures[1].startsWith("8Sessions this week") && figures[1].includes("5 still to come"), `[${n}] sessions this week (${figures[1]})`);
  ok(figures[2].startsWith("85%Average attendance") && figures[2].includes("From 19 sessions with attendance"), `[${n}] seeded attendance history (${figures[2]})`);

  // 2. Next session and upcoming sessions.
  ok(clean(await main.locator("div:has(> p:text('Next session'))").innerText()).includes("Footwork and recovery"), `[${n}] next session`);
  const upcoming = main.getByRole("region", { name: "Upcoming sessions" }).getByRole("link", { name: /–/ });
  const titles = (await upcoming.allInnerTexts()).map(clean);
  ok(titles.length === 4 && titles[0].includes("Serve consistency") && titles[0].includes("19:00–20:15"), `[${n}] four upcoming sessions after the next one`);
  await upcoming.first().click();
  await page.waitForURL(`${BASE}/calendar/g4-2026-10-14`);
  ok(true, `[${n}] upcoming session opens its detail`);

  // 3. Quick actions lead to working pages.
  await go("/");
  const targets = await quickLinks().evaluateAll((as) => as.map((a) => `${a.textContent.trim()}=${a.getAttribute("href")}`));
  ok(
    targets.join("|") === "Schedule session=/calendar/new|Add exercise=/library/new|Send message=/chat|Take attendance=/attendance",
    `[${n}] quick actions (${targets.join("|")})`,
  );
  for (const t of targets) {
    const href = t.split("=")[1];
    const res = await page.request.get(BASE + href);
    ok(res.ok(), `[${n}] quick action target ${href} loads`);
  }

  // 4. Groups list opens each group.
  const groups = main.getByRole("region", { name: "My groups" }).getByRole("link", { name: /participants/ });
  ok((await groups.count()) === 5, `[${n}] five groups listed`);
  ok(clean(await groups.first().innerText()).includes("Mon & Wed · 17:00"), `[${n}] group shows its weekly schedule`);
  await groups.first().click();
  await page.waitForURL(`${BASE}/groups/g1`);
  ok(true, `[${n}] group row opens the group`);

  // 5. Save attendance: the figure and the ring follow the record.
  await go("/calendar/g1-2026-10-12/attendance?group=g1");
  // Everyone starts as present (D-056): one tap marks Liam absent.
  await main.locator("form li label").filter({ has: page.getByRole("checkbox", { name: "Liam Shaw present", exact: true }) }).click();
  await page.getByRole("button", { name: "Save attendance" }).click();
  await page.waitForURL(`${BASE}/calendar/g1-2026-10-12`);
  await go("/");
  figures = await statText();
  // 19 seeded sessions over three weeks (106 present, 18 absent: 85%) plus this one (7 present,
  // 1 absent): 113 of 132, 86%.
  ok(figures[2].startsWith("86%Average attendance") && figures[2].includes("From 20 sessions with attendance"), `[${n}] average attendance from the record (${figures[2]})`);
  ok((await main.getByRole("img", { name: /86% present over 20 saved sessions/ }).count()) === 1, `[${n}] attendance ring`);
  const attendanceCard = clean(await main.locator("section:has(h2:text('Attendance'))").innerText());
  ok(attendanceCard.includes("Present 113 Absent 19"), `[${n}] present and absent totals include the record`);
  ok(attendanceCard.includes("4 recent sessions without attendance"), `[${n}] reminder for sessions without attendance`);
  await page.screenshot({ path: `${OUT}/dashboard-${n}-on.png`, fullPage: true });

  // 6. Attendance switched off: figure, card and actions hidden; record kept.
  await go("/settings?section=features");
  await page.getByRole("switch", { name: "Attendance tracking" }).click();
  await go("/");
  figures = await statText();
  ok(figures.length === 2 && !figures.some((f) => f.includes("attendance")), `[${n}] off: two figures, no attendance`);
  ok((await main.locator("section:has(h2:text('Attendance'))").count()) === 0, `[${n}] off: no attendance card`);
  ok((await page.getByRole("link", { name: /attendance/i }).count()) === 0, `[${n}] off: no attendance actions on the dashboard`);
  ok((await quickLinks().count()) === 3, `[${n}] off: three quick actions`);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("coachspace-demo-v2:tennis")).attendance.length);
  ok(saved === 20, `[${n}] off: the attendance record is kept (${saved})`);
  await page.screenshot({ path: `${OUT}/dashboard-${n}-off.png`, fullPage: true });

  // 7. On again: everything back with the same figure.
  await go("/settings?section=features");
  await page.getByRole("switch", { name: "Attendance tracking" }).click();
  await go("/");
  figures = await statText();
  ok(figures.length === 3 && figures[2].startsWith("86%") && figures[2].includes("From 20 sessions"), `[${n}] on again: average attendance back`);
  ok((await main.locator("section:has(h2:text('Attendance'))").count()) === 1, `[${n}] on again: attendance card back`);

  // 8. Participant home: same header style, no coach figures or quick actions.
  await go("/me");
  ok((await page.locator("h1").innerText()) === "Good afternoon, Jordan", `[${n}] participant greeting`);
  ok((await main.getByText("Average attendance").count()) === 0 && (await main.getByText("Quick actions").count()) === 0, `[${n}] participant sees no coach figures`);

  await finish(page, vp);
}
await browser.close();
done();

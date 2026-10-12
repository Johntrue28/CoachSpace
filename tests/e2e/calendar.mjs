import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00")); // Wednesday
  const n = vp.name;

  // Dashboard coherence
  await page.goto(`${BASE}/`);
  const card = page.locator("div:has(> p:text('Next session'))");
  await card.getByText("Serve technique").waitFor().catch(() => {});
  const cardText = await card.innerText();
  ok(cardText.includes("Junior Tennis · Today, 17:30"), `[${n}] next session on dashboard is the next real slot (${cardText.replace(/\n/g, " / ")})`);
  const up = page.locator("section:has(h2:text('Calendar')) ul > li");
  await up.first().waitFor();
  const upTexts = (await up.allInnerTexts()).map((t) => t.replace(/\s+/g, " "));
  ok(upTexts.length === 2 && upTexts[0].startsWith("17:30") && upTexts[1].startsWith("18:00"), `[${n}] dashboard calendar shows today's sessions (${upTexts.join(" | ")})`);

  // Groups list and group detail
  await page.goto(`${BASE}/groups`);
  const g4 = await page.getByRole("link", { name: /Morning Pilates/ }).innerText();
  ok(g4.includes("Next: Tomorrow, 08:30"), `[${n}] groups list shows next session from schedule`);
  await page.goto(`${BASE}/groups/g2`);
  ok(await page.getByText("Tue & Thu · 19:30").isVisible(), `[${n}] group schedule label from weekly slots`);
  const g2sessions = await page.locator("section:has(h2:text('Upcoming sessions')) li").allInnerTexts();
  ok(g2sessions.length === 3 && g2sessions.every((t) => t.includes("19:30")), `[${n}] group detail lists only its own sessions`);

  // Week view
  await page.goto(`${BASE}/calendar?view=week`);
  await page.getByText("12 Oct – 18 Oct 2026").waitFor();
  ok(await page.getByText("This week", { exact: true }).isVisible(), `[${n}] current week shown by default`);
  ok((await page.locator("ol > li").count()) === 7, `[${n}] seven days listed`);
  ok((await page.locator("ol > li ul > li").count()) === 8, `[${n}] 8 sessions this week`);
  const wed = page.getByRole("listitem", { name: "Wednesday 14 Oct" });
  ok((await wed.getByText("Today", { exact: true }).count()) === 1, `[${n}] today highlighted`);
  const wedTimes = await wed.locator("ul > li").allInnerTexts();
  ok(wedTimes.length === 2 && wedTimes[0].startsWith("17:30") && wedTimes[1].startsWith("18:00"), `[${n}] sessions ordered by time within a day`);
  ok(await page.getByRole("listitem", { name: "Saturday 17 Oct" }).getByText("No sessions").isVisible(), `[${n}] empty day state`);
  ok(!(await page.getByRole("link", { name: "Back to this week" }).count()), `[${n}] no 'back' link on current week`);
  await page.screenshot({ path: `${OUT}/cal-${n}-1-week.png`, fullPage: true });

  // Navigate weeks
  await page.getByRole("link", { name: "Next week" }).click();
  await page.getByText("19 Oct – 25 Oct 2026").waitFor();
  ok(await page.getByRole("link", { name: "Back to this week" }).isVisible(), `[${n}] next week + way back`);
  await page.getByRole("link", { name: "Previous week" }).click();
  await page.getByText("12 Oct – 18 Oct 2026").waitFor();
  await page.getByRole("link", { name: "Previous week" }).click();
  await page.getByText("5 Oct – 11 Oct 2026").waitFor();
  await page.getByRole("link", { name: "Back to this week" }).click();
  await page.getByText("12 Oct – 18 Oct 2026").waitFor();
  ok(true, `[${n}] previous/next/back to this week work`);
  await page.goto(`${BASE}/calendar?week=2026-12-30`);
  await page.getByText("28 Dec – 3 Jan 2027").waitFor();
  ok(true, `[${n}] any date in the URL opens its week (across a year)`);
  await page.goto(`${BASE}/calendar?week=nonsense`);
  await page.getByText("12 Oct – 18 Oct 2026").waitFor();
  ok(true, `[${n}] invalid week falls back to this week`);

  // Session detail
  await page.goto(`${BASE}/calendar?view=week`);
  await page.getByRole("listitem", { name: "Wednesday 14 Oct" }).getByRole("link").first().click();
  await page.waitForURL(`${BASE}/calendar/g3-2026-10-14`);
  ok(await page.getByRole("heading", { level: 1 }).innerText() !== "", `[${n}] session detail opens`);
  const detail = await page.locator("main").innerText();
  ok(/Wednesday,? 14 October 2026/.test(detail) && detail.includes("17:30–18:30") && detail.includes("Court 3") && detail.includes("Junior Tennis"), `[${n}] detail shows date, time, place, group`);
  await page.screenshot({ path: `${OUT}/cal-${n}-2-detail.png` });
  await page.getByRole("link", { name: /Junior Tennis/ }).click();
  await page.waitForURL(`${BASE}/groups/g3`);
  await page.goBack();
  await page.waitForURL(`${BASE}/calendar/g3-2026-10-14`, { waitUntil: "commit" });
  await page.locator("main").getByText("Training session").waitFor();
  await page.locator("main").getByRole("link", { name: "Calendar", exact: true }).click();
  await page.waitForURL(/\/calendar\?view=week/, { waitUntil: "commit" });
  ok(true, `[${n}] detail links to group and back to the calendar it came from`);

  // Bottom nav to calendar
  await page.goto(`${BASE}/`);
  await mainNav(page).getByRole("link", { name: "Calendar" }).click();
  await page.waitForURL(`${BASE}/calendar`);
  ok(true, `[${n}] bottom navigation reaches calendar`);
  await finish(page, vp);
}
await browser.close();
done();

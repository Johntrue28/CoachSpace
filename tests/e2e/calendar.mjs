import { chromium, BASE, ok, viewports, newPage, finish, done, openSecondary, groupTab } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00")); // Wednesday
  const n = vp.name;

  // Home coherence (D-071, D-076): the next session in the card, then the rest of today from the weekly slots.
  await page.goto(`${BASE}/`);
  const up = page.locator("main").getByRole("region", { name: /^Today/ }).locator("ul > li");
  await up.first().waitFor();
  const upTexts = (await up.allInnerTexts()).map((t) => t.replace(/\s+/g, " "));
  const hero = (await page.locator("main").getByRole("region", { name: "Footwork and recovery" }).innerText()).replace(/\s+/g, " ");
  ok(hero.includes("17:00") && hero.includes("U16 Development") && upTexts.length === 1 && upTexts[0].startsWith("19:00"), `[${n}] Home shows today's sessions (${upTexts.join(" | ")})`);

  // Groups list and group detail
  await page.goto(`${BASE}/groups`);
  await page.waitForLoadState("networkidle"); // "Next:" is worked out in the browser after hydration
  const g5 = await page.getByRole("link", { name: /Club Competition Team/ }).innerText();
  ok(g5.includes("Next: Tomorrow, 19:30"), `[${n}] groups list shows next session from schedule (${g5.replace(/\n/g, " / ")})`);
  await page.goto(`${BASE}/groups/g2`);
  await page.waitForLoadState("networkidle"); // the streamed page must have replaced its hidden copy
  ok(await page.getByText("Tue & Thu · 17:30").isVisible(), `[${n}] group schedule label from weekly slots`);
  await groupTab(page, "Sessions"); // the group page's tabs (D-074)
  const g2sessions = await page.locator("section:has(h2:text('Upcoming sessions')) li").allInnerTexts();
  ok(g2sessions.length >= 3 && g2sessions.every((t) => t.includes("17:30")), `[${n}] group detail lists only its own sessions`);

  // Month only (D-076): the grid with today selected and its sessions below, on every screen size.
  await page.goto(`${BASE}/calendar`);
  await page.getByRole("heading", { name: "October 2026" }).waitFor();
  ok((await page.locator("main").getByRole("group", { name: "Calendar view" }).count()) === 0, `[${n}] no week or agenda view`);
  ok((await page.locator("main table").count()) === 1, `[${n}] the month grid on ${vp.name}`);
  const wed = page.getByRole("list", { name: "Sessions on Wednesday 14 Oct" });
  const wedTimes = await wed.getByRole("listitem").allInnerTexts();
  ok(wedTimes.length === 2 && wedTimes[0].startsWith("17:00") && wedTimes[1].startsWith("19:00"), `[${n}] today's sessions under the grid, by time`);
  await page.locator("main").getByRole("button", { name: /^Friday 16 Oct/ }).click();
  ok(await page.locator("main").getByText("No sessions on this day.").isVisible(), `[${n}] empty day state`);
  await page.screenshot({ path: `${OUT}/cal-${n}-1-month.png`, fullPage: true });
  await page.goto(`${BASE}/calendar?date=2026-12-30`);
  await page.getByRole("heading", { name: "December 2026" }).waitFor();
  ok(true, `[${n}] a date in the URL opens its month`);

  // Session detail
  await page.goto(`${BASE}/calendar?date=2026-10-14`);
  await wed.getByRole("link").first().click();
  await page.waitForURL(`${BASE}/calendar/g1-2026-10-14`);
  ok(await page.getByRole("heading", { level: 1 }).innerText() !== "", `[${n}] session detail opens`);
  const detail = await page.locator("main").innerText();
  ok(/Wednesday,? 14 October 2026/.test(detail) && detail.includes("17:00–18:30") && detail.includes("Courts 3–4") && detail.includes("U16 Development"), `[${n}] detail shows date, time, place, group`);
  await page.screenshot({ path: `${OUT}/cal-${n}-2-detail.png` });
  ok((await page.locator("main").getByRole("link", { name: /U16 Development/ }).count()) === 0, `[${n}] the group is plain text, no group card (D-076)`);
  await page.locator("main").getByRole("link", { name: "Calendar", exact: true }).click();
  await page.waitForURL(/\/calendar\?date=2026-10-14/, { waitUntil: "commit" });
  ok(true, `[${n}] back to the calendar it came from`);

  // Navigation to the calendar: Profile — the sidebar on desktop, the avatar on phones (D-076).
  await page.goto(`${BASE}/`);
  await openSecondary(page, vp, "Calendar");
  await page.waitForURL(`${BASE}/calendar`);
  ok(true, `[${n}] navigation reaches the calendar`);
  await finish(page, vp);
}
await browser.close();
done();

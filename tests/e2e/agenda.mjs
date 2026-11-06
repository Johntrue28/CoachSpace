// Coach Agenda home (D-071, replaces the dashboard of D-044): the next seven days by day, each session with
// who is coming, at most two "needs you" items, the group filter, one primary action, the way to the month
// calendar, and the attendance switch (D-042) removing the register item.
import { chromium, BASE, ok, viewports, newPage, finish, done } from "./lib.mjs";
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
  const dayHeadings = () => main.locator("section[aria-labelledby^='day-'] h2").allInnerTexts();

  // 1. Title, the next seven days by day, today first.
  await go("/");
  ok((await page.locator("h1").innerText()) === "Agenda", `[${n}] Agenda title`);
  const days = await dayHeadings();
  ok(days.length >= 5 && days.length <= 7 && days[0].startsWith("Today"), `[${n}] days from today (${days.join(" | ")})`);
  ok(days[1].startsWith("Tomorrow"), `[${n}] tomorrow labelled`);
  const today = main.getByRole("region", { name: /^Today/ });
  const rows = today.getByRole("link");
  ok((await rows.count()) === 2, `[${n}] two sessions today`);
  ok(clean(await rows.first().innerText()).includes("17:00") && clean(await rows.first().innerText()).includes("Footwork and recovery"), `[${n}] earliest first`);
  ok(/\d+ going/.test(await rows.first().innerText()), `[${n}] who is coming on each row`);

  // 2. One primary action: New session in the page on phones, in the header on desktop.
  const primary = page.locator("a.bg-brand-strong:visible", { hasText: /New (session|class)/ });
  ok((await primary.count()) === 1, `[${n}] exactly one visible primary New session`);

  // 3. Needs you: registers to take and unread messages, each a working link.
  const needs = main.getByRole("list", { name: "Needs your attention" });
  const needTexts = (await needs.getByRole("link").allInnerTexts()).map(clean);
  ok(needTexts.some((t) => /\d+ registers? to take/.test(t)) && needTexts.some((t) => /\d+ unread messages?/.test(t)), `[${n}] needs you (${needTexts.join(" | ")})`);
  ok(needTexts.length <= 2, `[${n}] at most two items`);

  // 4. Group filter: one group only, then all again.
  await main.getByRole("group", { name: "Show groups" }).getByRole("button", { name: "Adult Improvers" }).click();
  const filtered = clean(await main.innerText());
  ok(filtered.includes("Serve consistency") && !filtered.includes("Footwork and recovery"), `[${n}] filter shows one group`);
  await main.getByRole("group", { name: "Show groups" }).getByRole("button", { name: "All groups" }).click();
  ok(clean(await main.innerText()).includes("Footwork and recovery"), `[${n}] all groups again`);

  // 5. A row opens the session hub; the month calendar is one link away.
  await rows.first().click();
  await page.waitForURL(`${BASE}/calendar/g1-2026-10-14`);
  await main.getByRole("heading", { name: "Who’s coming" }).waitFor();
  ok((await main.getByRole("region", { name: "Who’s coming" }).count()) === 1, `[${n}] the session opens with Who's coming`);
  await go("/");
  await main.getByRole("link", { name: "Open the month calendar" }).click();
  await page.waitForURL(`${BASE}/calendar`);
  ok(true, `[${n}] month calendar link`);

  // 6. Attendance switched off: no register item; back on: it returns.
  await go("/settings?section=features");
  await main.getByRole("switch").click();
  const confirmOff = main.getByRole("button", { name: /Turn off/ });
  if (await confirmOff.count()) await confirmOff.click();
  await go("/");
  ok(!clean(await main.innerText()).match(/registers? to take/), `[${n}] no register item when attendance is off`);
  await go("/settings?section=features");
  await main.getByRole("switch").click();
  await go("/");
  ok(/registers? to take/.test(clean(await main.innerText())), `[${n}] register item back when on`);

  await finish(page, vp);
}
await browser.close();
done();

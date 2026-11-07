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

  // 2. One way to create (D-074): the + in the bottom navigation on phones, "Create" in the header on desktop.
  const create = page.getByRole("button", { name: "Create" }).filter({ visible: true });
  ok((await create.count()) === 1, `[${n}] exactly one visible Create`);
  await create.click();
  const menu = page.getByRole("dialog", { name: "Create" });
  const items = (await menu.getByRole("link").allInnerTexts()).map((t) => clean(t).split(" ")[0] + " " + clean(t).split(" ")[1]);
  ok((await menu.getByRole("link", { name: /^New session/ }).getAttribute("href")) === "/calendar/new" && items.length >= 4, `[${n}] the Create menu (${items.join(" | ")})`);
  await menu.getByRole("button", { name: /^Invite to a group/ }).click();
  await page.getByRole("dialog", { name: "Invite to which group?" }).getByRole("link", { name: "Adult Improvers" }).click();
  await page.waitForURL(`${BASE}/groups/g4?invite=1`);
  await page.getByRole("dialog", { name: "Invite to Adult Improvers" }).waitFor();
  ok(true, `[${n}] Invite to a group opens that group's invite sheet`);
  await page.keyboard.press("Escape");
  await go("/");

  // 3. The week strip (D-074): today first with coloured dots; choosing a day shows only that day.
  const strip = main.getByRole("group", { name: "Choose a day" }).getByRole("button");
  ok((await strip.count()) === 7 && (await strip.first().getAttribute("aria-label")).startsWith("Today 14: U16 Development, Adult Improvers"), `[${n}] week strip names the groups of each day`);
  await strip.nth(1).click();
  ok((await dayHeadings()).length === 1 && (await dayHeadings())[0].startsWith("Tomorrow"), `[${n}] choosing a day shows only that day`);
  await strip.nth(1).click();
  ok((await dayHeadings()).length === days.length, `[${n}] choosing it again shows the week`);

  // 4. The next-session card: countdown, who is coming and a reminder that is not sent.
  const hero = main.getByRole("region", { name: "Footwork and recovery" });
  ok(clean(await hero.innerText()).includes("in 5 h") && /\d+ going/.test(await hero.innerText()), `[${n}] next session with countdown and answers (${clean(await hero.innerText()).slice(0, 80)})`);
  const remind = hero.getByRole("button", { name: /^Remind \d+$/ });
  if (await remind.count()) {
    await remind.click();
    ok((await hero.getByRole("status").innerText()).includes("nobody was notified"), `[${n}] the reminder is a demo`);
  } else ok(true, `[${n}] everyone has replied, no reminder offered`);

  // 5. Needs you: registers to take and unread messages, each a working link.
  const needs = main.getByRole("list", { name: "Needs your attention" });
  const needTexts = (await needs.getByRole("link").allInnerTexts()).map(clean);
  ok(needTexts.some((t) => /\d+ registers? to take/.test(t)) && needTexts.some((t) => /\d+ unread messages?/.test(t)), `[${n}] needs you (${needTexts.join(" | ")})`);
  ok(needTexts.length <= 2, `[${n}] at most two items`);

  // 6. Group filter: one group only, then all again.
  await main.getByRole("group", { name: "Show groups" }).getByRole("button", { name: "Adult Improvers" }).click();
  const filtered = clean(await main.innerText());
  ok(filtered.includes("Serve consistency") && !filtered.includes("Footwork and recovery"), `[${n}] filter shows one group`);
  await main.getByRole("group", { name: "Show groups" }).getByRole("button", { name: "All groups" }).click();
  ok(clean(await main.innerText()).includes("Footwork and recovery"), `[${n}] all groups again`);

  // 7. A row opens the session as a sheet from the bottom (D-074), and from there the session hub.
  await rows.first().click();
  const peek = page.getByRole("dialog", { name: "Footwork and recovery" });
  await peek.waitFor();
  ok((await peek.getByRole("list", { name: "Who's coming" }).getByRole("listitem").count()) === 8, `[${n}] the sheet lists the group with their answers`);
  await peek.getByRole("link", { name: /^Open/ }).click();
  await page.waitForURL(`${BASE}/calendar/g1-2026-10-14`);
  await main.getByRole("heading", { name: "Who’s coming" }).waitFor();
  ok((await main.getByRole("region", { name: "Who’s coming" }).count()) === 1, `[${n}] the session opens with Who's coming`);
  await go("/");
  await main.getByRole("link", { name: "Open the month calendar" }).click();
  await page.waitForURL(`${BASE}/calendar`);
  ok(true, `[${n}] month calendar link`);

  // 8. Attendance switched off: no register item; back on: it returns.
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

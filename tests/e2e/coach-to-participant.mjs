// From the coach's work to the participant's view: plans prepared for the next sessions (D-058)
// shown read-only to the group's participants, and group-first assignment (D-059) reaching
// the participant's exercises. Tennis Coaching.
import { chromium, BASE, ok, viewports, newPage, finish, done, groupTab } from "./lib.mjs";
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

  // 1. The coach's next Adult Improvers session already has a plan, shared with its participants.
  await go("/calendar/g4-2026-10-14");
  const card = main.getByRole("region", { name: "Session plan" });
  await card.waitFor();
  const cardText = clean(await card.innerText());
  ok(cardText.includes("70 of 75 min planned · 5 exercises"), `[${n}] the next session has a plan ready (${cardText.slice(0, 80)})`);
  ok(cardText.includes("Participants of Adult Improvers see this plan") && cardText.includes("not notified"), `[${n}] the coach is told who sees the plan, honestly`);
  const see = card.getByRole("link", { name: "See what participants see" });
  ok((await see.getAttribute("href")) === "/me/calendar/g4-2026-10-14", `[${n}] link to the participant's view of the session`);

  // A group without the demo participant: same note, no link to a view that would not show it.
  await go("/calendar/g1-2026-10-14");
  await card.waitFor();
  ok(clean(await card.innerText()).includes("Participants of U16 Development see this plan") && (await card.getByRole("link", { name: "See what participants see" }).count()) === 0, `[${n}] no participant link for a group Jordan is not in`);

  // 2. The participant's session page shows the plan, read-only, with the sport's block names.
  await go("/calendar/g4-2026-10-14");
  await see.click();
  await page.waitForURL(`${BASE}/me/calendar/g4-2026-10-14`);
  const plan = main.getByRole("region", { name: "Session plan" });
  await plan.waitFor();
  const planText = clean(await plan.innerText());
  ok(planText.includes("Your coach’s plan for this session · 70 min"), `[${n}] participant sees the plan and its length (${planText.slice(0, 70)})`);
  ok((await plan.getByRole("heading", { level: 3 }).allInnerTexts()).map((t) => t.toLowerCase()).join("|") === "warm-up|technical|tactical|cool-down", `[${n}] plan blocks in order`);
  ok((await plan.locator("li").count()) === 5 && planText.includes("Dynamic court warm-up"), `[${n}] every exercise of the plan is listed`);
  // The only buttons are the player's own answer to "Are you coming?" (D-071).
  const buttons = await main.getByRole("button").count();
  const answers = await main.getByRole("group", { name: /Are you coming/ }).getByRole("button").count();
  ok((await main.getByRole("link", { name: /Edit|Open plan|Assign/ }).count()) === 0 && buttons === answers, `[${n}] read-only for the participant (only the answer buttons)`);
  await page.screenshot({ path: `${OUT}/c2p-${n}-participant-plan.png`, fullPage: true });

  // 3. Group-first assignment: two exercises for Adult Improvers at once.
  await go("/groups/g4");
  await groupTab(page, "Exercises"); // the group page's tabs (D-074)
  await main.getByRole("region", { name: "Exercises" }).getByRole("link", { name: "Assign", exact: true }).click();
  await page.waitForURL(`${BASE}/groups/g4/assign`);
  await main.getByRole("heading", { name: "Assign exercises" }).waitFor();
  const save = main.getByRole("button", { name: "Assign to group" });
  ok(await save.isDisabled(), `[${n}] nothing to save before choosing`);
  const warmUp = main.getByRole("checkbox", { name: /Dynamic court warm-up/ });
  ok((await warmUp.isChecked()) && (await warmUp.isDisabled()), `[${n}] exercises already assigned to the whole group are marked`);
  await main.getByRole("searchbox", { name: "Search exercises" }).fill("zzz");
  ok(await main.getByText("No exercises match your search.").isVisible(), `[${n}] empty search state`);
  await main.getByRole("searchbox", { name: "Search exercises" }).fill("");
  const free = main.getByRole("checkbox", { disabled: false });
  const picks = [];
  for (const i of [0, 1]) {
    const label = clean(await free.nth(i).locator("xpath=ancestor::label").innerText());
    picks.push(label.split(/\d+ min/)[0].trim());
  }
  const first = free.nth(0).locator("xpath=ancestor::label");
  const second = free.nth(1).locator("xpath=ancestor::label");
  await first.click();
  await second.click();
  ok(clean(await main.getByRole("status").first().innerText()) === "2 exercises chosen", `[${n}] choice counted (${picks.join(", ")})`);
  const rows = await main.locator("form li label").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
  ok(rows.every((h) => h >= 44), `[${n}] rows are at least 44 px tall`);
  await page.screenshot({ path: `${OUT}/c2p-${n}-assign.png`, fullPage: false });
  await save.click();
  await page.waitForURL(`${BASE}/groups/g4`);
  await main.getByRole("status").filter({ hasText: "assigned to Adult Improvers" }).first().waitFor();
  ok(clean(await main.getByRole("status").filter({ hasText: "assigned to Adult Improvers" }).first().innerText()).includes("2 exercises assigned to Adult Improvers. Saved on this device; participants have not been notified (demo)."), `[${n}] honest confirmation`);
  await groupTab(page, "Exercises");
  const section = clean(await main.locator("section:has(h2:text('Exercises'))").innerText());
  ok(picks.every((p) => section.includes(p)), `[${n}] both exercises listed on the group page`);
  await go("/me/videos");
  await main.getByRole("list", { name: "Your exercises" }).getByRole("listitem").first().waitFor();
  const mine = clean(await main.innerText());
  ok(picks.every((p) => mine.includes(p)), `[${n}] both reach the participant's exercises`);

  await finish(page, vp);
}
await browser.close();
done();

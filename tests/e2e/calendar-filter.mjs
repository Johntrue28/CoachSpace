// Calendar group filter (D-047, D-076): all groups by default, select one or several, deselect, clear,
// restore, empty states, the month grid and the day list, persistence, keyboard use, on phones too.
import { chromium, BASE, ok, viewports, newPage, finish, done } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();
const commit = { waitUntil: "commit" };

// The month grid is shown on every screen size since D-076; checked on a tablet and on desktop, phones at the end.
const gridViewports = [{ name: "tablet", width: 768, height: 1024 }, viewports[1]];
for (const vp of gridViewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00")); // Wednesday, 12:00
  const n = vp.name;
  const main = page.locator("main");
  const go = async (p) => {
    await page.goto(BASE + p);
    await page.waitForLoadState("networkidle");
  };
  const filterButton = () => main.getByRole("button", { name: /^Groups shown:/ });
  const summary = async () => clean(await filterButton().innerText()).replace(/^Groups shown: ?/, "");
  const panel = () => main.getByRole("group", { name: "Show sessions from" });
  const box = (name) => panel().getByRole("checkbox", { name, exact: true });
  const day = (label) => main.getByRole("button", { name: new RegExp(`^${label}:`) });
  const label = async (d) => day(d).getAttribute("aria-label");
  const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem("coachspace-demo-v2:tennis") ?? "{}").calendarHiddenGroups ?? null);

  // 1. All groups by default.
  await go("/calendar");
  ok((await summary()) === "All groups", `[${n}] all groups by default`);
  ok((await filterButton().getAttribute("aria-expanded")) === "false", `[${n}] filter closed by default`);
  ok((await label("Wednesday 14 Oct")) === "Wednesday 14 Oct: 2 sessions", `[${n}] every group's sessions shown`);
  ok((await main.getByRole("group", { name: "Groups shown" }).count()) === 0, `[${n}] no filter chips while all groups are shown`);

  // 2. Open the filter: keyboard focus moves into it.
  await filterButton().click();
  ok((await filterButton().getAttribute("aria-expanded")) === "true" && (await panel().isVisible()), `[${n}] filter opens`);
  ok(await box("All groups").isChecked(), `[${n}] All groups checked`);
  ok((await page.evaluate(() => document.activeElement?.closest("label")?.textContent?.trim())) === "All groups", `[${n}] focus moves to All groups`);
  for (const g of ["U16 Development", "U18 Performance", "Adult Beginners", "Adult Improvers", "Club Competition Team"]) ok(await box(g).isChecked(), `[${n}] ${g} checked`);
  const panelBox = await panel().boundingBox();
  ok(panelBox.x >= 0 && panelBox.x + panelBox.width <= vp.width, `[${n}] filter fits the screen`);
  await page.screenshot({ path: `${OUT}/calfilter-${n}-open.png`, fullPage: false });

  // 3. Deselect a group.
  await box("U16 Development").click();
  ok((await summary()) === "4 of 5 groups", `[${n}] deselecting updates the summary`);
  ok(await box("All groups").evaluate((el) => el.indeterminate && !el.checked), `[${n}] All groups shows a partial selection`);
  ok((await label("Wednesday 14 Oct")) === "Wednesday 14 Oct: 1 session", `[${n}] deselected group's sessions hidden at once`);
  ok(!clean(await main.getByRole("list", { name: "Sessions on Wednesday 14 Oct" }).innerText()).includes("U16 Development"), `[${n}] the day list follows the filter`);
  const chips = await main.getByRole("group", { name: "Groups shown" }).getByRole("button", { name: /^Hide / }).allInnerTexts();
  ok(chips.map(clean).join("|") === "U18 Performance ✕|Adult Beginners ✕|Adult Improvers ✕|Club Competition Team ✕", `[${n}] selected groups visible as chips`);

  // 4. Clear all: empty states everywhere.
  await panel().getByRole("button", { name: "Clear all" }).click();
  ok((await summary()) === "No groups", `[${n}] clear all`);
  ok(!(await box("All groups").isChecked()) && !(await box("All groups").evaluate((el) => el.indeterminate)), `[${n}] All groups unchecked, not partial`);
  ok(await panel().getByRole("button", { name: "Clear all" }).isDisabled(), `[${n}] Clear all disabled when nothing is selected`);
  ok(await main.getByRole("status").filter({ hasText: "No groups selected" }).isVisible(), `[${n}] empty state explains no group is selected`);
  ok((await label("Wednesday 14 Oct")) === "Wednesday 14 Oct: no sessions", `[${n}] grid empty`);
  ok(clean(await main.locator("#day-heading").locator("xpath=../..").innerText()).includes("No groups selected."), `[${n}] day list says no groups are selected`);
  await page.screenshot({ path: `${OUT}/calfilter-${n}-none.png`, fullPage: true });

  // 5. Select one group, then 6. several groups (Space on a focused checkbox).
  await box("U18 Performance").click();
  ok((await summary()) === "U18 Performance", `[${n}] one group selected`);
  ok((await label("Thursday 15 Oct")) === "Thursday 15 Oct: 1 session", `[${n}] only that group's sessions`);
  await box("Club Competition Team").focus();
  await page.keyboard.press("Space");
  ok((await summary()) === "2 of 5 groups", `[${n}] several groups selected with the keyboard`);
  ok((await label("Thursday 15 Oct")) === "Thursday 15 Oct: 2 sessions", `[${n}] sessions of both groups`);

  // 7. Escape closes the filter and returns focus to its button.
  await page.keyboard.press("Escape");
  ok((await panel().count()) === 0 && (await filterButton().getAttribute("aria-expanded")) === "false", `[${n}] Escape closes the filter`);
  ok((await page.evaluate(() => document.activeElement?.getAttribute("aria-expanded"))) === "false", `[${n}] focus back on the filter button`);

  // 8. The same filter across months and after opening a session.
  await main.getByRole("button", { name: "Next month" }).click();
  await main.getByRole("button", { name: "Previous month" }).click();
  await day("Thursday 15 Oct").click();
  await main.getByRole("list", { name: "Sessions on Thursday 15 Oct" }).getByRole("link").first().click();
  await page.waitForURL(/\/calendar\/g\d-2026-10-15$/, commit);
  await main.locator("h1").first().waitFor();
  await page.goBack();
  await main.getByRole("heading", { name: "October 2026" }).waitFor();
  ok((await summary()) === "2 of 5 groups", `[${n}] filter kept after opening a session`);
  await day("Thursday 22 Oct").click();
  const agenda = (await main.getByRole("list", { name: "Sessions on Thursday 22 Oct" }).getByRole("listitem").allInnerTexts()).map(clean);
  ok(agenda.length === 2 && agenda.every((t) => /U18 Performance|Club Competition Team/.test(t)), `[${n}] day list filtered`);

  // 9. Saved in this browser: survives a reload; other screens are not filtered.
  ok(JSON.stringify(((await saved()) ?? []).sort()) === JSON.stringify(["g1", "g3", "g4"]), `[${n}] hidden group ids saved`);
  await page.reload();
  await page.waitForLoadState("networkidle");
  ok((await summary()) === "2 of 5 groups", `[${n}] filter survives a reload`);
  // Home has its own group chips and is not limited by the calendar's filter: the card and today's other session.
  await go("/");
  ok((await main.getByRole("region", { name: "Footwork and recovery" }).count()) === 1 && (await main.getByRole("region", { name: /^Today/ }).getByRole("link").count()) === 1, `[${n}] Home is not filtered by the calendar`);

  // Remove a group with its chip, then 10. restore all with All groups.
  await go("/calendar");
  await main.getByRole("button", { name: "Hide U18 Performance" }).click();
  ok((await summary()) === "Club Competition Team", `[${n}] chip hides its group`);
  await filterButton().click();
  await box("All groups").click();
  ok((await summary()) === "All groups" && (await box("U16 Development").isChecked()), `[${n}] All groups restores every group`);
  ok((await main.getByRole("group", { name: "Groups shown" }).count()) === 0, `[${n}] chips gone when all groups are shown`);
  await panel().getByRole("button", { name: "Done" }).click();
  ok((await panel().count()) === 0, `[${n}] Done closes the filter`);

  // 11. Reset demo data restores all groups.
  await filterButton().click();
  await panel().getByRole("button", { name: "Clear all" }).click();
  await go("/settings");
  page.once("dialog", (d) => d.accept());
  await main.getByRole("button", { name: "Reset demo data" }).click();
  await go("/calendar");
  ok((await summary()) === "All groups", `[${n}] reset restores all groups`);

  await finish(page, vp);
}

// Phones: the same filter on the month grid (D-076).
{
  const vp = viewports[0];
  const n = vp.name;
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  const main = page.locator("main");
  await page.goto(`${BASE}/calendar`);
  await page.waitForLoadState("networkidle");
  await main.getByRole("button", { name: /^Groups shown:/ }).click();
  const panel = main.getByRole("group", { name: "Show sessions from" });
  const box = await panel.boundingBox();
  ok(box && box.x >= 0 && box.x + box.width <= vp.width, `[${n}] filter fits the phone screen`);
  await panel.getByRole("checkbox", { name: "U16 Development", exact: true }).click();
  await page.keyboard.press("Escape");
  const today = clean(await main.getByRole("list", { name: "Sessions on Wednesday 14 Oct" }).innerText());
  ok(!today.includes("U16 Development") && today.includes("Adult Improvers"), `[${n}] the day list follows the filter`);
  await panel.waitFor({ state: "hidden" }).catch(() => {});
  await main.getByRole("button", { name: /^Groups shown:/ }).click();
  await panel.getByRole("button", { name: "Clear all" }).click();
  await page.keyboard.press("Escape");
  ok(clean(await main.innerText()).includes("No groups selected."), `[${n}] the day list says no groups are selected`);
  await finish(page, vp);
}
await browser.close();
done();


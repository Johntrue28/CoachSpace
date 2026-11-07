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

  // 1. The coach's next Adult Improvers session already has a plan: read-only, with the total in large type.
  await go("/calendar/g4-2026-10-14");
  const card = main.getByRole("region", { name: "Plan" });
  await card.waitFor();
  const cardText = clean(await card.innerText());
  ok(/70\s*min/.test(cardText) && cardText.includes("Warm-up"), `[${n}] the next session has a plan ready (${cardText.slice(0, 80)})`);
  ok((await card.getByRole("link", { name: "Open plan" }).getAttribute("href")) === "/calendar/g4-2026-10-14/plan", `[${n}] Open plan`);

  // 2. As the player: the same plan, read-only, in the same plan view, without Edit.
  await main.getByRole("link", { name: "See it as a player" }).click();
  await page.waitForURL(`${BASE}/me/calendar/g4-2026-10-14`);
  const plan = main.getByRole("region", { name: "Plan" });
  await plan.waitFor();
  ok(/70\s*min/.test(clean(await plan.innerText())), `[${n}] the player sees the plan and its length`);
  // The only buttons are the player's own answer to "Are you coming?" (D-071).
  const buttons = await main.getByRole("button").count();
  const answers = await main.getByRole("group", { name: /Are you coming/ }).getByRole("button").count();
  ok((await main.getByRole("link", { name: /Edit|Assign/ }).count()) === 0 && buttons === answers, `[${n}] read-only for the player (only the answer buttons)`);
  await plan.getByRole("link", { name: "Open plan" }).click();
  await page.waitForURL(`${BASE}/me/calendar/g4-2026-10-14/plan`);
  await main.locator("h1").waitFor();
  const view = clean(await main.innerText());
  ok(view.includes("70 min in total") && view.includes("0–") && view.includes("Dynamic court warm-up"), `[${n}] the player's plan view with minutes from the start`);
  ok((await main.locator("section[aria-labelledby^='block-'] h2").allInnerTexts()).map((t) => t.toLowerCase()).join("|") === "warm-up|technical|tactical|cool-down", `[${n}] plan blocks in order`);
  ok((await main.getByRole("link", { name: "Edit in Library" }).count()) === 0, `[${n}] no Edit for the player`);
  await page.screenshot({ path: `${OUT}/c2p-${n}-participant-plan.png`, fullPage: true });

  // 3. The group's Exercises tab lists what is assigned and sends the coach to the Library to assign more (one flow, D-076).
  await go("/groups/g4");
  await groupTab(page, "Exercises"); // the group page's tabs (D-074)
  const section = main.getByRole("region", { name: "Exercises" });
  ok(clean(await section.innerText()).includes("Dynamic court warm-up"), `[${n}] assigned exercises listed on the group page`);
  ok((await section.getByRole("link", { name: "Assign from Library" }).getAttribute("href")) === "/library", `[${n}] assign through the Library`);

  await finish(page, vp);
}
await browser.close();
done();

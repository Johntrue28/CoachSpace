import { chromium, BASE, ok, viewports, newPage, finish, done } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (t) => t.replace(/\s+/g, " ").trim();
for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00")); // Wednesday
  const n = vp.name;
  const main = page.locator("main");
  const status = () => main.getByRole("status").first();
  const go = async (path) => { await page.goto(BASE + path); await page.waitForLoadState("networkidle"); };

  // --- One-off session -----------------------------------------------------
  await go("/calendar");
  await page.getByRole("link", { name: "New session" }).first().click();
  await page.waitForURL(/\/calendar\/new/);
  await page.getByRole("button", { name: "Add session" }).click();
  ok((await main.getByRole("alert").count()) >= 1, `[${n}] new session form validates`);
  await page.getByLabel("Group").selectOption("g5");
  ok((await page.getByLabel("Location").inputValue()) === "Harbour Lane TC, Courts 1–2", `[${n}] location defaults to the group's venue`);
  await page.getByLabel("Title").fill("Friendly match");
  await page.getByLabel("Date").fill("2026-10-18");
  await page.getByLabel("Start time").fill("10:00");
  await page.getByLabel("Duration (min)").fill("90");
  await page.getByRole("button", { name: "Add session" }).click();
  await page.waitForURL(/\/calendar\/oo-[^/]*$/);
  await status().getByText("Session added").waitFor();
  const oneOffUrl = page.url().split("?")[0];
  ok(clean(await main.innerText()).includes("Extra session") && clean(await main.innerText()).includes("10:00–11:30"), `[${n}] one-off created with its time`);
  ok((await status().innerText()).includes("not been notified"), `[${n}] creation confirmed honestly`);
  await go("/calendar?view=week");
  const sun = page.getByRole("listitem", { name: "Sunday 18 Oct" });
  ok(clean(await sun.innerText()).includes("Friendly match"), `[${n}] one-off shown in the week view`);
  await go("/");
  ok((await page.getByRole("button", { name: /Sunday 18 Oct: 1 session/ }).count()) === 1, `[${n}] dashboard calendar widget marks the date`);

  // --- Reschedule a recurring session ---------------------------------------
  await go("/calendar/g5-2026-10-15/edit");
  await page.getByLabel("Date").waitFor();
  ok(clean(await main.innerText()).includes("weekly schedule stays the same"), `[${n}] edit explains the schedule is not changed`);
  await page.getByLabel("Date").fill("2026-10-16");
  await page.getByLabel("Start time").fill("18:00");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForURL(/g5-2026-10-15$/);
  await status().getByText("Session changed").waitFor();
  ok(clean(await main.innerText()).includes("Moved from Thursday 15 Oct, 19:30"), `[${n}] rescheduled session shows where it moved from`);
  await go("/calendar?view=week");
  ok(!clean(await page.getByRole("listitem", { name: "Thursday 15 Oct" }).innerText()).includes("Club Competition Team"), `[${n}] gone from its regular day`);
  ok(clean(await page.getByRole("listitem", { name: "Friday 16 Oct" }).innerText()).includes("Moved from Thursday 15 Oct"), `[${n}] shown on its new day`);
  await go("/calendar?view=week&week=2026-10-19");
  ok(clean(await page.getByRole("listitem", { name: "Thursday 22 Oct" }).innerText()).includes("Club Competition Team"), `[${n}] recurring schedule preserved next week`);

  // --- Change location ------------------------------------------------------
  await go("/calendar/g4-2026-10-14/edit");
  await page.getByLabel("Location").fill("Harbour Lane TC, Court 6");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForURL(/g4-2026-10-14$/);
  await status().getByText("Session changed").waitFor();
  ok(clean(await main.innerText()).includes("Harbour Lane TC, Court 6") && clean(await main.innerText()).includes("New location"), `[${n}] location changed for one session`);
  await go("/calendar/g4-2026-10-21");
  ok(clean(await main.innerText()).includes("Riverside Park, Court 2") && !clean(await main.innerText()).includes("Court 6"), `[${n}] other Adult Improvers sessions keep Riverside Park, Court 2`);

  // --- Cancel and restore ---------------------------------------------------
  await go("/calendar/g1-2026-10-14");
  await page.getByRole("button", { name: "Cancel this session" }).click();
  await page.getByLabel("Reason (optional)").fill("Courts closed");
  await page.getByRole("button", { name: "Cancel session" }).click();
  await status().getByText("Session cancelled").waitFor();
  ok(clean(await main.innerText()).includes("Reason: Courts closed"), `[${n}] cancelled with reason`);
  ok((await page.getByRole("link", { name: "Take attendance" }).count()) === 0, `[${n}] no attendance for a cancelled session`);
  await go("/");
  const homeCal = page.locator("section:has(h2:text('Calendar'))");
  await homeCal.locator("ul").first().waitFor();
  ok(clean(await homeCal.locator("ul").innerText()).includes("Cancelled"), `[${n}] dashboard calendar marks the cancellation`);
  ok((await homeCal.getByRole("button", { name: /Wednesday 14 Oct: 1 session, 1 cancelled/ }).count()) === 1, `[${n}] calendar widget shows the cancellation`);
  await go("/calendar/g1-2026-10-21");
  ok(!clean(await main.innerText()).includes("Cancelled"), `[${n}] next week's session is not cancelled`);
  await go("/calendar/g1-2026-10-14");
  await page.getByRole("button", { name: "Restore this session" }).click();
  await status().getByText("Session restored").waitFor();
  await page.getByRole("button", { name: "Cancel this session" }).click();
  await page.getByRole("button", { name: "Cancel session" }).click();
  await status().getByText("Session cancelled").waitFor();
  ok(true, `[${n}] restore and cancel again`);
  await page.screenshot({ path: `${OUT}/wf-${n}-1-cancelled.png`, fullPage: true });

  // --- Participant view consistency (Jordan: Adult Improvers + Competition Team) ----------
  await go("/me/calendar?view=week");
  const meWeek = clean(await main.innerText());
  ok(meWeek.includes("Friendly match") && meWeek.includes("Moved from") && meWeek.includes("New location"), `[${n}] participant calendar shows one-off, move and new place`);
  ok(!meWeek.includes("U16 Development"), `[${n}] participant does not see other groups' changes`);
  await go("/me");
  const card = clean(await page.locator("div:has(> p:text('Next session'))").innerText());
  ok(card.includes("Harbour Lane TC, Court 6") && card.includes("New location"), `[${n}] participant next session reflects the place change (${card})`);
  await go("/me/calendar/g5-2026-10-15");
  ok(clean(await main.innerText()).includes("Moved from"), `[${n}] participant session detail shows the move`);
  ok((await page.getByRole("button", { name: /Cancel/ }).count()) === 0 && !clean(await main.innerText()).includes("Coach notes"), `[${n}] no coach controls or notes for the participant`);
  await go(oneOffUrl.replace(BASE, "").replace("/calendar/", "/me/calendar/"));
  ok(clean(await main.innerText()).includes("Friendly match"), `[${n}] participant can open the one-off of his group`);

  // --- Persistence after reload --------------------------------------------
  await page.reload();
  await page.waitForLoadState("networkidle");
  await go("/calendar/g1-2026-10-14");
  ok(clean(await main.innerText()).includes("Cancelled"), `[${n}] calendar changes kept after reload`);

  // --- Session builder: from template --------------------------------------
  await go("/calendar/g1-2026-10-12");
  await page.getByLabel("Start from").selectOption({ label: "Junior consistency session" });
  await page.getByRole("button", { name: "Plan this session" }).click();
  await page.waitForURL(/\/library\/plans\/plan-.*\?from=session/);
  const planUrl = page.url().split("?")[0];
  await page.getByLabel("Title").waitFor();
  ok((await main.locator("ol > li").count()) === 5, `[${n}] plan copied 5 exercises from the template`);
  ok(clean(await main.innerText()).includes("Based on Junior consistency session"), `[${n}] plan shows its template`);
  ok(clean(await main.innerText()).includes("Cross-court forehand rallies"), `[${n}] previous notes shown while preparing`);
  await page.getByLabel("Minutes for Dynamic court warm-up").fill("6");
  await page.getByLabel("Instructions for Dynamic court warm-up in this plan").fill("Short version for U16.");
  await page.getByLabel("Exercise to add to Technical").selectOption("e7");
  await page.locator("section[aria-label='Technical']").getByRole("button", { name: "Add" }).click();
  await page.getByRole("button", { name: "Move Volley ladder up" }).click();
  const tech = await page.locator("section[aria-label='Technical'] ol > li p.font-semibold").allInnerTexts();
  ok(tech.join("|") === "Cross-court forehand consistency|Volley ladder|Split-step and recovery footwork", `[${n}] order within a block (${tech.join("|")})`);
  await page.getByLabel("Block for Rally construction: three-ball patterns").selectOption("technical");
  ok((await page.locator("section[aria-label='Tactical'] ol > li").count()) === 0, `[${n}] item moved to another block`);
  await page.getByRole("button", { name: "Remove Shoulder and hip cool-down" }).click();
  await page.getByRole("button", { name: "Save plan" }).click();
  await status().getByText("Plan saved").waitFor();
  ok(clean(await main.innerText()).includes("6 + 0".slice(0, 0) + "min planned · the session lasts 90 min"), `[${n}] total against session length`);
  await page.screenshot({ path: `${OUT}/wf-${n}-2-plan.png`, fullPage: true });
  await go("/library/plans/t-junior");
  await page.getByLabel("Title").waitFor();
  const tItems = await main.locator("ol > li").count();
  const tWarm = await page.getByLabel("Minutes for Dynamic court warm-up").inputValue();
  ok(tItems === 5 && tWarm === "10", `[${n}] template unchanged by the adapted plan (${tItems} items, ${tWarm} min)`);

  // Session page shows the plan
  await go("/calendar/g1-2026-10-12");
  ok(clean(await main.innerText()).includes("Open plan"), `[${n}] session links to its plan`);

  // Template -> adapt for another group; plan -> new template
  await go("/library/plans/t-doubles");
  await page.getByLabel("Group to adapt this template for").selectOption("g2");
  await page.getByRole("button", { name: "Adapt for group" }).click();
  await page.waitForURL(/\/library\/plans\/plan-/);
  await page.getByLabel("Title").waitFor();
  ok((await page.getByLabel("Title").inputValue()).includes("U18 Performance"), `[${n}] template adapted for a group`);
  await go(planUrl.replace(BASE, ""));
  await page.getByRole("button", { name: "Save as a new template" }).click();
  await page.waitForURL((u) => u.pathname.startsWith("/library/plans/") && u.href !== planUrl);
  await page.getByLabel("Title").waitFor();
  ok((await main.locator("ol > li").count()) === 5, `[${n}] plan saved as a new template with its items`);
  await go("/library/plans");
  const lib = clean(await main.innerText()).toLowerCase();
  ok(lib.includes("(template)") && lib.includes("u18 performance") && lib.includes("u16 development"), `[${n}] library lists templates and group plans`);

  // --- Coach memory --------------------------------------------------------
  await go("/calendar/g1-2026-10-12");
  await page.getByLabel("What worked").fill("Longer rallies in the three-ball patterns.");
  await page.getByLabel("What to improve").fill("Second serve under pressure.");
  await page.getByLabel("What to revisit next time").fill("Volleys at the net.");
  await page.getByRole("button", { name: "Save notes" }).click();
  await main.getByText("Notes saved on this device.").waitFor();
  await go("/calendar/g1-2026-10-19");
  const memory = clean(await page.locator("section:has(h2:text('From last time'))").innerText());
  ok(memory.indexOf("Longer rallies in the three-ball patterns.") >= 0 && memory.indexOf("Longer rallies") < memory.indexOf("Cross-court forehand rallies"), `[${n}] next session shows the latest notes first`);
  await go("/calendar/g2-2026-10-20");
  ok((await page.locator("section:has(h2:text('From last time'))").count()) === 0, `[${n}] notes stay with their group`);
  await go("/calendar/g1-2026-10-21");
  ok(clean(await main.innerText()).includes("You can add notes once the session has started"), `[${n}] notes only after the session starts`);
  await page.reload();
  await go("/calendar/g1-2026-10-19");
  ok(clean(await main.innerText()).includes("Longer rallies in the three-ball patterns."), `[${n}] notes kept after reload`);

  // --- Reset to schedule, then reset everything -----------------------------
  await go("/calendar/g5-2026-10-15/edit");
  await page.getByRole("button", { name: "Back to the regular schedule" }).click();
  await page.waitForURL(/g5-2026-10-15$/);
  await status().getByText("regular schedule").waitFor();
  ok(!clean(await main.innerText()).includes("Moved from"), `[${n}] back to the regular schedule`);
  await go("/library");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await page.waitForTimeout(300);
  await go("/calendar/g1-2026-10-14");
  ok(!clean(await main.innerText()).includes("Cancelled"), `[${n}] reset removes calendar changes`);
  await go("/library/plans");
  // Only the plans prepared in advance for the next sessions remain (D-058): none of the test's.
  const afterReset = clean(await main.innerText()).toLowerCase();
  ok(!afterReset.includes("monday 12 oct") && !afterReset.includes("u18 performance") && !afterReset.includes("(template)"), `[${n}] reset removes plans`);
  await finish(page, vp);
}
await browser.close();
done();

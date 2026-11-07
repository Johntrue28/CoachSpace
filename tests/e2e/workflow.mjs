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
  await main.getByRole("link", { name: "Create session" }).click();
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
  await go("/calendar?date=2026-10-18");
  const sun = page.getByRole("list", { name: "Sessions on Sunday 18 Oct" });
  ok(clean(await sun.innerText()).includes("Friendly match"), `[${n}] one-off shown in the month calendar`);
  await go("/");
  ok(clean(await main.getByRole("region", { name: /18 Oct/ }).innerText()).includes("Friendly match"), `[${n}] the agenda lists the extra session on its day`);

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
  await go("/calendar?date=2026-10-15");
  ok(!clean(await page.getByRole("list", { name: "Sessions on Thursday 15 Oct" }).innerText()).includes("Club Competition Team"), `[${n}] gone from its regular day`);
  await go("/calendar?date=2026-10-16");
  ok(clean(await page.getByRole("list", { name: "Sessions on Friday 16 Oct" }).innerText()).includes("Moved from Thursday 15 Oct"), `[${n}] shown on its new day`);
  await go("/calendar?date=2026-10-22");
  ok(clean(await page.getByRole("list", { name: "Sessions on Thursday 22 Oct" }).innerText()).includes("Club Competition Team"), `[${n}] recurring schedule preserved next week`);

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
  await page.getByRole("button", { name: "Cancel session", exact: true }).click();
  await page.getByLabel("Reason (optional)").fill("Courts closed");
  await page.getByRole("button", { name: "Cancel session" }).click();
  await status().getByText("Session cancelled").waitFor();
  ok(clean(await main.innerText()).includes("This session will not take place: Courts closed"), `[${n}] cancelled with reason`);
  ok((await page.getByRole("link", { name: "Take attendance" }).count()) === 0, `[${n}] no attendance for a cancelled session`);
  await go("/");
  const today = main.getByRole("region", { name: /^Today/ });
  await today.waitFor();
  ok(clean(await today.innerText()).includes("Cancelled"), `[${n}] the agenda marks the cancellation`);
  ok((await today.locator("p.line-through").count()) === 1, `[${n}] the cancelled session is struck through`);
  await go("/calendar/g1-2026-10-21");
  ok(!clean(await main.innerText()).includes("Cancelled"), `[${n}] next week's session is not cancelled`);
  await go("/calendar/g1-2026-10-14");
  await page.getByRole("button", { name: "Restore this session" }).click();
  await status().getByText("Session restored").waitFor();
  await page.getByRole("button", { name: "Cancel session", exact: true }).click();
  await page.getByRole("button", { name: "Cancel session" }).click();
  await status().getByText("Session cancelled").waitFor();
  ok(true, `[${n}] restore and cancel again`);
  await page.screenshot({ path: `${OUT}/wf-${n}-1-cancelled.png`, fullPage: true });

  // --- Participant view consistency (Jordan: Adult Improvers + Competition Team) ----------
  await go("/me");
  await main.getByRole("region", { name: "My next sessions" }).locator("ul > li").first().waitFor();
  const meWeek = clean(await main.getByRole("region", { name: "My next sessions" }).innerText());
  ok(meWeek.includes("Friendly match") && meWeek.includes("New location"), `[${n}] the player's Home shows the one-off and the new place`);
  ok(!meWeek.includes("U16 Development"), `[${n}] the player does not see other groups' changes`);
  await go("/me");
  // The player's agenda (D-071): the changed session shows its new place and the change badge.
  const card = clean(await main.getByRole("region", { name: "My next sessions" }).locator("ul > li", { hasText: "Harbour Lane TC, Court 6" }).first().innerText());
  ok(card.includes("Harbour Lane TC, Court 6") && card.includes("New location"), `[${n}] participant next session reflects the place change (${card})`);
  await go("/me/calendar/g5-2026-10-15");
  ok(clean(await main.innerText()).includes("Moved from"), `[${n}] participant session detail shows the move`);
  ok((await page.getByRole("button", { name: /Cancel/ }).count()) === 0 && !clean(await main.innerText()).includes("Notes for next time"), `[${n}] no coach controls or notes for the participant`);
  await go(oneOffUrl.replace(BASE, "").replace("/calendar/", "/me/calendar/"));
  ok(clean(await main.innerText()).includes("Friendly match"), `[${n}] participant can open the one-off of his group`);

  // --- Persistence after reload --------------------------------------------
  await page.reload();
  await page.waitForLoadState("networkidle");
  await go("/calendar/g1-2026-10-14");
  ok(clean(await main.innerText()).includes("Cancelled"), `[${n}] calendar changes kept after reload`);

  // --- Plan: read-only in the session (D-076) -------------------------------
  await go("/calendar/g1-2026-10-12");
  const noPlan = main.getByRole("region", { name: "Plan" });
  ok(clean(await noPlan.innerText()).includes("No plan for this session"), `[${n}] a session without a plan says so in one line`);
  ok((await noPlan.getByRole("link", { name: "Choose a plan in Library" }).getAttribute("href")) === "/library/plans", `[${n}] and links to Library`);
  ok((await noPlan.getByRole("button").count()) === 0 && (await noPlan.locator("select, input").count()) === 0, `[${n}] no plan controls in the session`);
  await go("/calendar/g4-2026-10-14");
  await main.getByRole("region", { name: "Plan" }).getByRole("link", { name: "Open plan" }).click();
  await page.waitForURL(`${BASE}/calendar/g4-2026-10-14/plan`);
  await main.locator("h1").waitFor();
  const view = clean(await main.innerText());
  ok(/^Session .*min in total/.test(view) && view.includes("0–10′") && view.includes("Dynamic court warm-up"), `[${n}] the plan view shows minutes from the start (${view.slice(0, 120)})`);
  ok((await main.locator("input, select, textarea").count()) === 0, `[${n}] the plan view is read-only`);
  await main.getByRole("link", { name: "Edit in Library" }).click();
  await page.waitForURL(`${BASE}/library/plans/t-doubles`);
  await page.getByLabel("Minutes for Dynamic court warm-up").fill("6");
  await page.getByRole("button", { name: "Save plan" }).click();
  await status().getByText("Plan saved").waitFor();
  await go("/calendar/g4-2026-10-14/plan");
  await main.locator("h1").waitFor();
  ok(clean(await main.innerText()).includes("0–6′"), `[${n}] a change made in Library shows in the session's plan`);
  await page.screenshot({ path: `${OUT}/wf-${n}-2-plan.png`, fullPage: true });

  // Library → Plans (D-076): duplicate a plan, use it in a session (taken off its old plan), see it read-only there.
  await go("/library/plans/t-doubles");
  await page.getByLabel("Title").waitFor();
  await page.getByRole("button", { name: "Duplicate this plan" }).click();
  await page.waitForURL(/\/library\/plans\/plan-/);
  await page.getByLabel("Title").waitFor();
  ok((await page.getByLabel("Title").inputValue()).endsWith("(copy)") && (await main.locator("ol > li").count()) === 5, `[${n}] Duplicate copies the plan with its exercises`);
  await page.getByLabel("Title").fill("Doubles for U18");
  await page.getByLabel(/^Group/).selectOption("g2");
  await page.getByRole("button", { name: "Save plan" }).click();
  await status().getByText("Plan saved").waitFor();
  const use = main.getByRole("region", { name: "Use in session" });
  const firstSession = use.getByRole("checkbox").first();
  ok(clean(await use.innerText()).includes("U18 Performance") && !clean(await use.innerText()).includes("U16 Development"), `[${n}] Use in session offers the plan's group's sessions`);
  await firstSession.check();
  await use.getByRole("button", { name: "Save sessions" }).click();
  await use.getByRole("status").getByText("Sessions saved").waitFor();
  await go("/library/plans");
  const lib = clean(await main.innerText()).toLowerCase();
  ok(lib.includes("doubles for u18") && lib.includes("used in 1 session"), `[${n}] the library lists the plan and where it is used`);
  await go("/calendar/g2-2026-10-15");
  ok(clean(await main.getByRole("region", { name: "Plan" }).innerText()).includes("Doubles for U18"), `[${n}] the session shows the plan, read-only`);

  // --- Coach memory --------------------------------------------------------
  await go("/calendar/g1-2026-10-12");
  await page.getByLabel("What worked").fill("Longer rallies in the three-ball patterns.");
  await page.getByLabel("What to improve").fill("Second serve under pressure.");
  await page.getByLabel("What to revisit next time").fill("Volleys at the net.");
  await page.getByRole("button", { name: "Save notes" }).click();
  await main.getByText("Notes saved on this device.").waitFor();
  await go("/calendar/g1-2026-10-19");
  const memory = clean(await main.getByRole("region", { name: "From last time" }).innerText());
  ok(memory.indexOf("Longer rallies in the three-ball patterns.") >= 0 && memory.indexOf("Longer rallies") < memory.indexOf("Cross-court forehand rallies"), `[${n}] next session shows the latest notes first`);
  await go("/calendar/g2-2026-10-20");
  ok((await main.getByRole("region", { name: "From last time" }).count()) === 0, `[${n}] notes stay with their group`);
  await go("/calendar/g1-2026-10-21");
  ok((await main.getByRole("heading", { name: "Notes for next time" }).count()) === 0, `[${n}] notes for next time only after the session starts`);
  await page.reload();
  await go("/calendar/g1-2026-10-19");
  ok(clean(await main.innerText()).includes("Longer rallies in the three-ball patterns."), `[${n}] notes kept after reload`);

  // --- Reset to schedule, then reset everything -----------------------------
  await go("/calendar/g5-2026-10-15/edit");
  await page.getByRole("button", { name: "Back to the regular schedule" }).click();
  await page.waitForURL(/g5-2026-10-15$/);
  await status().getByText("regular schedule").waitFor();
  ok(!clean(await main.innerText()).includes("Moved from"), `[${n}] back to the regular schedule`);
  await go("/settings");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await page.waitForTimeout(300);
  await go("/calendar/g1-2026-10-14");
  ok(!clean(await main.innerText()).includes("Cancelled"), `[${n}] reset removes calendar changes`);
  await go("/library/plans");
  // Only the plans prepared in advance for the next sessions remain (D-058): none of the test's.
  const afterReset = clean(await main.innerText()).toLowerCase();
  ok(!afterReset.includes("doubles for u18") && !afterReset.includes("(copy)"), `[${n}] reset removes the plans made in the test`);
  await finish(page, vp);
}
await browser.close();
done();

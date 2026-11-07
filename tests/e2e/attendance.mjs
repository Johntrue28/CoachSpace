import { chromium, BASE, ok, viewports, newPage, finish, done } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  const n = vp.name;

  // The demo starts with seeded attendance history (D-053): every past session of the last two
  // weeks except each group's most recent one, so 19 saved sessions and 5 still to take.
  // The Agenda says how many registers are waiting (D-071); the Attendance page lists the saved ones.
  await page.goto(`${BASE}/`);
  ok(await page.locator("main").getByRole("link", { name: /\d+ registers? to take/ }).waitFor({ timeout: 5000 }).then(() => true, () => false), `[${n}] the agenda reminds about registers to take`);
  const dash = page.locator("main").getByRole("region", { name: /^Saved attendance/ });
  await page.goto(`${BASE}/attendance`);
  await dash.locator("li").first().waitFor();
  ok((await dash.locator("li").count()) === 19, `[${n}] attendance starts from the seeded history (19 saved sessions)`);

  // From the calendar to the session, then to attendance
  await page.goto(`${BASE}/calendar?date=2026-10-12`);
  await page.getByRole("list", { name: "Sessions on Monday 12 Oct" }).getByRole("link").first().click();
  await page.waitForURL(`${BASE}/calendar/g1-2026-10-12`);
  // The session page may show its loading placeholder first (D-054), so wait for the content.
  ok(await page.getByText(/Not taken yet\./).waitFor({ timeout: 5000 }).then(() => true, () => false), `[${n}] session shows attendance not taken`);
  await page.getByRole("link", { name: "Take attendance" }).click();
  await page.waitForURL(`${BASE}/calendar/g1-2026-10-12/attendance?group=g1`);

  // Let the client-side navigation settle first: marks made while the page is still loading can be lost.
  await page.waitForLoadState("networkidle");
  const rows = page.locator("main form ul > li");
  await rows.first().waitFor();
  const boxes = rows.getByRole("checkbox");
  const names = (await boxes.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")))).map((l) => l.replace(/ present$/, ""));
  ok(names.length === 8 && new Set(names).size === 8, `[${n}] 8 unique participants of U16 Development`);
  ok(names.includes("Chloe Bennett") && !names.includes("Marcus Reid"), `[${n}] only this group's participants`);
  const save = page.getByRole("button", { name: "Save attendance" });
  // D-056, D-071: a new record starts from the answers (Can't go = absent, everyone else present); nobody said
  // Can't go for this session, so everyone starts present and the coach only taps the absentees.
  ok((await boxes.evaluateAll((els) => els.filter((e) => e.checked).length)) === 8, `[${n}] everyone starts as present`);
  ok(await page.getByText("Members who said they can't come start as absent; everyone else as present. Tap to change.").isVisible(), `[${n}] says how the form works`);
  ok(!(await save.isDisabled()), `[${n}] save available straight away`);
  const allPresent = page.getByRole("button", { name: /Mark everyone present|Everyone is marked present/ });
  ok(await allPresent.isDisabled(), `[${n}] "Mark everyone present" disabled while everyone is present`);

  // Tap to mark absent, tap again to correct (the whole row is the target).
  const row = (name) => rows.locator("label").filter({ has: page.getByRole("checkbox", { name: `${name} present`, exact: true }) });
  const box = (name) => page.getByRole("checkbox", { name: `${name} present`, exact: true });
  const counts = async () => (await page.locator("main").getByRole("status").first().innerText()).replace(/\s+/g, " ").trim();
  await row("Chloe Bennett").click();
  ok(!(await box("Chloe Bennett").isChecked()) && (await row("Chloe Bennett").innerText()).includes("Absent"), `[${n}] one tap marks absent`);
  ok((await counts()) === "7 present · 1 absent", `[${n}] live summary (${await counts()})`);
  await row("Chloe Bennett").click();
  ok((await box("Chloe Bennett").isChecked()) && (await row("Chloe Bennett").innerText()).includes("Present"), `[${n}] a mark can be corrected`);
  ok((await counts()) === "8 present · 0 absent", `[${n}] summary back to everyone present (${await counts()})`);
  for (const name of ["Isla Ward", "Max Fischer", "Ava Rossi"]) await row(name).click();
  ok(!(await allPresent.isDisabled()), `[${n}] "Mark everyone present" available after marking absences`);
  await allPresent.click();
  ok((await counts()) === "8 present · 0 absent", `[${n}] "Mark everyone present" resets every mark`);
  for (const name of ["Isla Ward", "Max Fischer"]) await row(name).click();
  ok((await counts()) === "6 present · 2 absent", `[${n}] summary after marking (${await counts()})`);
  // Keyboard: Space on a focused row toggles it.
  await box("Liam Shaw").focus();
  await page.keyboard.press("Space");
  ok(!(await box("Liam Shaw").isChecked()), `[${n}] Space toggles a participant`);
  await page.keyboard.press("Space");
  ok(await box("Liam Shaw").isChecked(), `[${n}] Space toggles back`);

  // Touch targets and the sticky action bar.
  const rowHeights = await rows.locator("label").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
  ok(rowHeights.every((h) => h >= 44 && h <= 72), `[${n}] compact rows with 44 px targets (${rowHeights.map(Math.round).join(",")})`);
  const saveBox = await save.boundingBox();
  ok(saveBox.height >= 44 && (await allPresent.boundingBox()).height >= 44, `[${n}] Save and Mark everyone present are at least 44 px tall`);
  await rows.first().scrollIntoViewIfNeeded();
  const bar = await save.boundingBox();
  ok(bar.y + bar.height <= vp.height, `[${n}] Save stays on screen while the list is scrolled (${Math.round(bar.y + bar.height)} <= ${vp.height})`);
  await page.screenshot({ path: `${OUT}/att-${n}-1-form.png`, fullPage: false });
  // A double tap saves once.
  await save.dblclick();
  await page.waitForURL(`${BASE}/calendar/g1-2026-10-12`);
  await page.getByText("Attendance saved on this device.").waitFor();
  ok(await page.getByText("Attendance saved on this device.").isVisible(), `[${n}] saved confirmation`);
  ok((await page.getByRole("region", { name: "Register" }).innerText()).replace(/\s+/g, " ").includes("6/8 present · 2 absent · 8 participants"), `[${n}] session shows the summary`);
  await page.screenshot({ path: `${OUT}/att-${n}-2-saved.png` });

  // Edit after saving: starts from saved marks
  await page.getByRole("link", { name: "Edit" }).click();
  await page.waitForURL(/attendance\?group=g1$/);
  await box("Isla Ward").waitFor({ state: "attached" });
  ok(!(await box("Isla Ward").isChecked()) && (await box("Max Fischer").isChecked()) === false && (await box("Chloe Bennett").isChecked()), `[${n}] editing starts from the saved marks`);
  ok(await page.getByText("Attendance already saved. Tap anyone to change it.").isVisible(), `[${n}] says the record is already saved`);
  await row("Isla Ward").click();
  await page.getByRole("button", { name: "Save attendance" }).click();
  await page.waitForURL(/\/calendar\/g1-2026-10-12$/);
  await page.getByText("Attendance saved on this device.").waitFor();
  ok((await page.getByRole("region", { name: "Register" }).innerText()).replace(/\s+/g, " ").includes("7/8 present · 1 absent"), `[${n}] corrected attendance saved`);

  // Other sessions are independent
  await page.goto(`${BASE}/calendar/g1-2026-10-14`);
  await page.getByText(/The register opens at|present ·/).first().waitFor();
  ok(await page.getByText("The register opens at 17:00.").isVisible(), `[${n}] another session of the same group is separate, its register opens at the start`);
  await page.goto(`${BASE}/calendar/g2-2026-10-13/attendance`);
  await page.locator("main form ul > li").first().waitFor();
  const g2names = (await page.locator("main form ul > li").getByRole("checkbox").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")))).map((l) => l.replace(/ present$/, ""));
  ok(g2names.length === 6 && g2names.includes("Lucia Ortega") && !g2names.includes("Chloe Bennett"), `[${n}] U18 Performance session lists its own players`);

  // Saved attendance summary + reload persistence + reset
  await page.goto(`${BASE}/attendance`);
  const newest = dash.locator("li", { hasText: "U16 Development" }).filter({ hasText: "12 Oct" });
  await newest.first().waitFor();
  const newestText = (await newest.first().innerText()).replace(/\s+/g, " ");
  ok(newestText.includes("7/8 present") && (await dash.locator("li").count()) === 20, `[${n}] saved attendance summary (${newestText})`);
  await page.reload();
  await newest.first().waitFor();
  ok(true, `[${n}] kept after reload on this device`);
  await page.goto(`${BASE}/settings`);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await page.goto(`${BASE}/attendance`);
  await dash.locator("li").first().waitFor();
  ok((await dash.locator("li").count()) === 19 && !(await newest.count()), `[${n}] reset removes the saved attendance and restores the seeded history`);
  ok(page.errors.length === 0, `[${n}] no console errors before the 404 check ${page.errors.join(" | ")}`);
  // Session pages resolve ids in the browser (D-054), so an unknown session shows a message instead of a 404.
  await page.goto(`${BASE}/calendar/g1-2026-10-13/attendance`);
  ok(await page.getByText("This session was not found.").waitFor({ timeout: 5000 }).then(() => true, () => false), `[${n}] attendance for a non-existent session is handled`);
  page.errors = page.errors.filter((e) => !e.includes("404"));
  await finish(page, vp);
}
await browser.close();
done();

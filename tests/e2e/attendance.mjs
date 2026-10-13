import { chromium, BASE, ok, viewports, newPage, finish, done } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  const n = vp.name;

  // The demo starts with seeded attendance history (D-053): every past session of the last two
  // weeks except each group's most recent one, so 11 saved sessions and 5 still to take.
  await page.goto(`${BASE}/`);
  const dash = page.locator("section:has(h2:text('Attendance'))");
  ok(await dash.getByText("Over 11 saved sessions").waitFor({ timeout: 5000 }).then(() => true, () => false), `[${n}] dashboard attendance starts from the seeded history`);
  ok((await dash.innerText()).replace(/\s+/g, " ").includes("5 recent sessions without attendance"), `[${n}] dashboard reminds about the sessions without attendance`);

  // From the calendar to the session, then to attendance
  await page.goto(`${BASE}/calendar?view=week`);
  await page.getByRole("listitem", { name: "Monday 12 Oct" }).getByRole("link").first().click();
  await page.waitForURL(`${BASE}/calendar/g1-2026-10-12`);
  // The session page may show its loading placeholder first (D-054), so wait for the content.
  ok(await page.getByText("Not taken yet.").waitFor({ timeout: 5000 }).then(() => true, () => false), `[${n}] session shows attendance not taken`);
  await page.getByRole("link", { name: "Take attendance" }).click();
  await page.waitForURL(`${BASE}/calendar/g1-2026-10-12/attendance?group=g1`);

  // Let the client-side navigation settle first: marks made while the page is still loading can be lost.
  await page.waitForLoadState("networkidle");
  const rows = page.locator("main form ul > li");
  await rows.first().waitFor();
  const names = await rows.locator("p.font-medium").allInnerTexts();
  ok(names.length === 8 && new Set(names).size === 8, `[${n}] 8 unique participants of U16 Development`);
  ok(names.includes("Chloe Bennett") && !names.includes("Marcus Reid"), `[${n}] only this group's participants`);
  const save = page.getByRole("button", { name: "Save attendance" });
  ok(await save.isDisabled(), `[${n}] save disabled until everyone is marked`);
  ok(await page.getByText("8 left").isVisible(), `[${n}] shows how many are left`);

  // Mark and correct
  await page.getByRole("group", { name: "Attendance for Chloe Bennett" }).getByRole("button", { name: "Absent" }).click();
  await page.getByRole("group", { name: "Attendance for Chloe Bennett" }).getByRole("button", { name: "Present" }).click();
  ok((await page.getByRole("group", { name: "Attendance for Chloe Bennett" }).getByRole("button", { name: "Present" }).getAttribute("aria-pressed")) === "true", `[${n}] a mark can be corrected`);
  const counts = async () => (await page.locator("main").getByRole("status").first().innerText()).replace(/\s+/g, " ");
  ok((await counts()) === "1 Present 0 Absent 7 Not marked", `[${n}] live summary (${await counts()})`);
  await page.getByRole("button", { name: "Mark everyone present" }).click();
  for (const name of ["Isla Ward", "Max Fischer"]) {
    await page.getByRole("group", { name: `Attendance for ${name}` }).getByRole("button", { name: "Absent" }).click();
  }
  ok((await counts()) === "6 Present 2 Absent 0 Not marked", `[${n}] summary after marking (${await counts()})`);
  ok(!(await save.isDisabled()), `[${n}] save enabled when everyone is marked`);
  await page.screenshot({ path: `${OUT}/att-${n}-1-form.png`, fullPage: true });
  await save.click();
  await page.waitForURL(`${BASE}/calendar/g1-2026-10-12`);
  await page.getByText("Attendance saved on this device.").waitFor();
  ok(await page.getByText("Attendance saved on this device.").isVisible(), `[${n}] saved confirmation`);
  ok((await page.locator("section:has(h2:text('Attendance'))").innerText()).replace(/\s+/g, " ").includes("6 present · 2 absent · 8 participants"), `[${n}] session shows the summary`);
  await page.screenshot({ path: `${OUT}/att-${n}-2-saved.png` });

  // Edit after saving: starts from saved marks
  await page.getByRole("link", { name: "Edit" }).click();
  await page.waitForURL(/attendance\?group=g1$/);
  await page.getByRole("group", { name: "Attendance for Isla Ward" }).waitFor();
  ok((await page.getByRole("group", { name: "Attendance for Isla Ward" }).getByRole("button", { name: "Absent" }).getAttribute("aria-pressed")) === "true", `[${n}] editing starts from the saved marks`);
  await page.getByRole("group", { name: "Attendance for Isla Ward" }).getByRole("button", { name: "Present" }).click();
  await page.getByRole("button", { name: "Save attendance" }).click();
  await page.waitForURL(/\/calendar\/g1-2026-10-12$/);
  await page.getByText("Attendance saved on this device.").waitFor();
  ok((await page.locator("section:has(h2:text('Attendance'))").innerText()).replace(/\s+/g, " ").includes("7 present · 1 absent"), `[${n}] corrected attendance saved`);

  // Other sessions are independent
  await page.goto(`${BASE}/calendar/g1-2026-10-14`);
  await page.getByText(/Not taken yet\.|present ·/).first().waitFor();
  ok(await page.getByText("Not taken yet.").isVisible(), `[${n}] another session of the same group is separate`);
  await page.goto(`${BASE}/calendar/g2-2026-10-13/attendance`);
  await page.locator("main form ul > li p.font-medium").first().waitFor();
  const g2names = await page.locator("main form ul > li p.font-medium").allInnerTexts();
  ok(g2names.length === 6 && g2names.includes("Lucia Ortega") && !g2names.includes("Chloe Bennett"), `[${n}] U18 Performance session lists its own players`);

  // Dashboard summary + reload persistence + reset
  await page.goto(`${BASE}/`);
  // The seeded history already has a 7/8 for U16 Development, so check the newest row is this session.
  const newest = dash.locator("li").first();
  await newest.getByText("Monday 12 Oct").waitFor();
  const newestText = (await newest.innerText()).replace(/\s+/g, " ");
  ok(newestText.includes("U16 Development") && newestText.includes("7/8 present"), `[${n}] dashboard attendance summary (${newestText})`);
  await page.reload();
  await newest.getByText("Monday 12 Oct").waitFor();
  ok(true, `[${n}] kept after reload on this device`);
  await page.goto(`${BASE}/library`);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await page.goto(`${BASE}/`);
  await dash.getByText("Over 11 saved sessions").waitFor();
  ok(!(await dash.getByText("Monday 12 Oct").count()), `[${n}] reset removes the saved attendance and restores the seeded history`);
  ok(page.errors.length === 0, `[${n}] no console errors before the 404 check ${page.errors.join(" | ")}`);
  // Session pages resolve ids in the browser (D-054), so an unknown session shows a message instead of a 404.
  await page.goto(`${BASE}/calendar/g1-2026-10-13/attendance`);
  ok(await page.getByText("This session was not found.").waitFor({ timeout: 5000 }).then(() => true, () => false), `[${n}] attendance for a non-existent session is handled`);
  page.errors = page.errors.filter((e) => !e.includes("404"));
  await finish(page, vp);
}
await browser.close();
done();

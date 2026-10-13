// Attendance page (D-051): group cards with reminders, a group's sessions with their status, the
// form's summary and roster, the saved attendance list, the global switch and the participant view.
import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();

for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00")); // Wednesday, 12:00
  const n = vp.name;
  const desktop = vp.width >= 1024;
  const main = page.locator("main");
  const go = async (p) => {
    await page.goto(BASE + p);
    await page.waitForLoadState("networkidle");
  };
  const saved = () => main.getByRole("region", { name: /^Saved attendance/ });

  // 1. Reach the page from the navigation.
  await go("/");
  if (desktop) await mainNav(page).getByRole("link", { name: "Attendance", exact: true }).click();
  else {
    await mainNav(page).getByRole("link", { name: "More", exact: true }).click();
    await page.waitForURL(`${BASE}/more`);
    await main.getByRole("link", { name: /^Attendance/ }).click();
  }
  await page.waitForURL(`${BASE}/attendance`);
  await page.waitForLoadState("networkidle");
  ok((await page.locator("h1").innerText()) === "Take attendance", `[${n}] page title`);
  ok((await page.getByRole("switch", { name: "Attendance tracking" }).getAttribute("aria-checked")) === "true", `[${n}] switch on`);

  // 2. Group cards with reminders for sessions without attendance.
  const cards = main.getByRole("region", { name: "Which group?" }).getByRole("link");
  ok((await cards.count()) === 5, `[${n}] five groups`);
  const u16 = clean(await cards.filter({ hasText: "U16 Development" }).innerText());
  ok(u16.includes("8 participants") && /\d recent sessions? without attendance/.test(u16), `[${n}] group card shows size and reminder (${u16})`);
  // The demo starts with about three weeks of seeded history (D-053, F-03): 19 saved sessions, none of them from this week.
  const seeded = saved().getByRole("link");
  ok((await seeded.count()) === 19 && clean(await seeded.first().innerText()) === "Transition to the net U18 Performance · Thursday 8 Oct 5/6 present", `[${n}] saved list starts from the seeded history (${clean(await seeded.first().innerText())})`);
  ok(!(await saved().getByText("Monday 12 Oct").count()), `[${n}] the most recent session is still waiting`);
  await page.screenshot({ path: `${OUT}/attpage-${n}-groups.png`, fullPage: true });

  // 3. A group's sessions with their status.
  await cards.filter({ hasText: "U16 Development" }).click();
  await page.waitForURL(`${BASE}/attendance?group=g1`);
  const today = main.getByRole("region", { name: "Today" }).getByRole("link");
  ok((await today.count()) === 1 && clean(await today.first().innerText()).includes("Not taken"), `[${n}] today's session marked Not taken`);
  const recent = main.getByRole("region", { name: "Recent sessions" }).getByRole("link");
  ok((await recent.count()) >= 1, `[${n}] recent sessions listed`);
  ok(clean(await recent.first().innerText()).includes("Monday 12 Oct, 17:00 Not taken"), `[${n}] the most recent session is not taken yet`);
  await recent.first().click();
  await page.waitForURL(/\/calendar\/g1-2026-10-12\/attendance\?group=g1$/);

  // 4. The form: summary tiles, roster, save.
  await page.getByRole("button", { name: /Everyone is marked present|Mark everyone present/ }).waitFor();
  ok(clean(await main.getByRole("status").first().innerText()) === "8 present · 0 absent", `[${n}] summary: everyone starts as present (D-056)`);
  ok(clean(await main.locator("form").innerText()).includes("U16 Development 8 participants"), `[${n}] roster header`);
  await main.locator("form li label").filter({ has: page.getByRole("checkbox", { name: "Zara Khan present", exact: true }) }).click();
  ok(clean(await main.getByRole("status").first().innerText()) === "7 present · 1 absent", `[${n}] summary follows the marks`);
  await page.screenshot({ path: `${OUT}/attpage-${n}-form.png`, fullPage: true });
  await page.getByRole("button", { name: "Save attendance" }).click();
  await page.waitForURL(/\/calendar\/g1-2026-10-12$/);
  await page.getByText("Attendance saved on this device.").waitFor();

  // 5. Back on the page: status and the saved list.
  await go("/attendance?group=g1");
  // Seeded sessions also show "Taken", so check the session that was just saved (the newest).
  ok(clean(await main.getByRole("region", { name: "Recent sessions" }).getByRole("link").first().innerText()).includes("Monday 12 Oct, 17:00 Taken · 7/8"), `[${n}] session shows it was taken`);
  const savedText = clean(await saved().innerText());
  const savedFirst = clean(await saved().getByRole("link").first().innerText());
  ok(savedText.startsWith("Saved attendance · U16 Development") && savedFirst.includes("Monday 12 Oct") && savedFirst.includes("7/8 present"), `[${n}] saved attendance listed (${savedFirst})`);
  await saved().getByRole("link").first().click();
  await page.waitForURL(/\/calendar\/g1-2026-10-12\/attendance\?group=g1$/);
  await page.getByRole("checkbox", { name: "Zara Khan present", exact: true }).waitFor({ state: "attached" });
  ok(!(await page.getByRole("checkbox", { name: "Zara Khan present", exact: true }).isChecked()) && (await page.getByRole("checkbox", { name: "Chloe Bennett present", exact: true }).isChecked()), `[${n}] a saved record opens for correction`);
  await go("/attendance");
  ok(clean(await saved().getByRole("link").first().innerText()).includes("U16 Development · Monday 12 Oct"), `[${n}] saved list on the group step too`);

  // 6. Switched off: the page shows the disabled state and keeps the record.
  await page.getByRole("switch", { name: "Attendance tracking" }).click();
  ok((await page.locator("h1").innerText()) === "Attendance" && (await main.getByText("Attendance is turned off").isVisible()), `[${n}] off: disabled state`);
  ok((await main.getByRole("region", { name: "Which group?" }).count()) === 0 && (await saved().count()) === 0, `[${n}] off: no group choice or saved list`);
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem("coachspace-demo-v2:tennis")).attendance.map((r) => r.sessionId));
  ok(kept.length === 20 && kept.includes("g1-2026-10-12"), `[${n}] off: record kept (${kept.length})`);
  await page.getByRole("switch", { name: "Attendance tracking" }).click();
  ok(clean(await saved().getByRole("link").first().innerText()).includes("Monday 12 Oct 7/8 present"), `[${n}] on again: record back`);

  // 7. Participant view: no attendance anywhere.
  await go("/me");
  ok(!/attendance/i.test(await main.innerText()), `[${n}] participant home has no attendance`);
  ok((await mainNav(page).getByRole("link", { name: /Attendance/ }).count()) === 0, `[${n}] no attendance in the participant navigation`);

  // Clean up.
  await go("/settings?section=demo");
  page.once("dialog", (d) => d.accept());
  await main.getByRole("button", { name: "Reset demo data" }).click();
  await finish(page, vp);
}
await browser.close();
done();

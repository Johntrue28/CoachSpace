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
  ok((await cards.count()) === 4, `[${n}] four groups`);
  const football = clean(await cards.filter({ hasText: "U12 Football" }).innerText());
  ok(football.includes("10 participants") && /\d recent sessions? without attendance/.test(football), `[${n}] group card shows size and reminder (${football})`);
  ok(clean(await saved().innerText()).includes("No attendance saved yet"), `[${n}] nothing saved yet`);
  await page.screenshot({ path: `${OUT}/attpage-${n}-groups.png`, fullPage: true });

  // 3. A group's sessions with their status.
  await cards.filter({ hasText: "U12 Football" }).click();
  await page.waitForURL(`${BASE}/attendance?group=g1`);
  const today = main.getByRole("region", { name: "Today" }).getByRole("link");
  ok((await today.count()) === 1 && clean(await today.first().innerText()).includes("Not taken"), `[${n}] today's session marked Not taken`);
  const recent = main.getByRole("region", { name: "Recent sessions" }).getByRole("link");
  ok((await recent.count()) >= 1, `[${n}] recent sessions listed`);
  await recent.first().click();
  await page.waitForURL(/\/calendar\/g1-2026-10-\d{2}\/attendance\?group=g1$/);

  // 4. The form: summary tiles, roster, save.
  await page.getByRole("button", { name: "Mark everyone present" }).waitFor();
  ok(clean(await main.getByRole("status").first().innerText()) === "0 Present 0 Absent 10 Not marked", `[${n}] summary tiles`);
  ok(clean(await main.locator("form").innerText()).includes("U12 Football 10 participants"), `[${n}] roster header`);
  await page.getByRole("button", { name: "Mark everyone present" }).click();
  await page.getByRole("group", { name: "Attendance for Sofia Molina" }).getByRole("button", { name: "Absent" }).click();
  ok(clean(await main.getByRole("status").first().innerText()) === "9 Present 1 Absent 0 Not marked", `[${n}] summary follows the marks`);
  await page.screenshot({ path: `${OUT}/attpage-${n}-form.png`, fullPage: true });
  await page.getByRole("button", { name: "Save attendance" }).click();
  await page.waitForURL(/\/calendar\/g1-2026-10-\d{2}$/);
  await page.getByText("Attendance saved on this device.").waitFor();

  // 5. Back on the page: status and the saved list.
  await go("/attendance?group=g1");
  ok(clean(await main.getByRole("region", { name: "Recent sessions" }).innerText()).includes("Taken · 9/10"), `[${n}] session shows it was taken`);
  const savedText = clean(await saved().innerText());
  ok(savedText.includes("Saved attendance · U12 Football") && savedText.includes("9/10 present"), `[${n}] saved attendance listed (${savedText})`);
  await saved().getByRole("link").first().click();
  await page.waitForURL(/\/calendar\/g1-2026-10-\d{2}\/attendance\?group=g1$/);
  await page.getByRole("group", { name: "Attendance for Sofia Molina" }).waitFor();
  ok((await page.getByRole("group", { name: "Attendance for Sofia Molina" }).getByRole("button", { name: "Absent" }).getAttribute("aria-pressed")) === "true", `[${n}] a saved record opens for correction`);
  await go("/attendance");
  ok(clean(await saved().innerText()).includes("U12 Football"), `[${n}] saved list on the group step too`);

  // 6. Switched off: the page shows the disabled state and keeps the record.
  await page.getByRole("switch", { name: "Attendance tracking" }).click();
  ok((await page.locator("h1").innerText()) === "Attendance" && (await main.getByText("Attendance is turned off").isVisible()), `[${n}] off: disabled state`);
  ok((await main.getByRole("region", { name: "Which group?" }).count()) === 0 && (await saved().count()) === 0, `[${n}] off: no group choice or saved list`);
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem("coachspace-demo-v1")).attendance.length);
  ok(kept === 1, `[${n}] off: record kept`);
  await page.getByRole("switch", { name: "Attendance tracking" }).click();
  ok(clean(await saved().innerText()).includes("9/10 present"), `[${n}] on again: record back`);

  // 7. Participant view: no attendance anywhere.
  await go("/me");
  ok(!/attendance/i.test(await main.innerText()), `[${n}] participant home has no attendance`);
  ok((await mainNav(page).getByRole("link", { name: /Attendance/ }).count()) === 0, `[${n}] no attendance in the participant navigation`);

  // Clean up.
  await go("/settings?section=general");
  page.once("dialog", (d) => d.accept());
  await main.getByRole("button", { name: "Reset demo data" }).click();
  await finish(page, vp);
}
await browser.close();
done();

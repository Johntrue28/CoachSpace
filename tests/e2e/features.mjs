// Global attendance switch (D-042): off hides every attendance entry point, keeps the saved
// records and survives a reload; on again restores everything.
import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const SESSION = "g1-2026-10-12"; // the latest past U16 session: no seeded attendance
// Records seeded for the Tennis Coaching on Wednesday 14 Oct (src/data/attendance.ts seedAttendance).
const SEEDED = 19; // about three weeks of seeded history in Tennis Coaching (D-053, F-03)

for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  const n = vp.name;
  const desktop = vp.width >= 1024;
  const main = page.locator("main");
  const go = async (path) => {
    await page.goto(`${BASE}${path}`);
    await page.waitForLoadState("networkidle");
  };
  const savedRecords = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("coachspace-demo-v2:tennis") ?? "{}").attendance?.length ?? 0);
  const attendanceSwitch = () => page.getByRole("switch", { name: "Attendance tracking" });
  const bellText = async () => {
    await page.getByRole("button", { name: /Activity in this demo/ }).click();
    const text = await page.getByRole("region", { name: "Activity in this demo" }).innerText();
    await page.keyboard.press("Escape");
    return text;
  };
  const navHasAttendance = async () => {
    if (desktop) return (await mainNav(page).getByRole("link", { name: "Attendance", exact: true }).count()) === 1;
    await go("/more");
    return (await main.getByRole("link", { name: /^Attendance/ }).count()) === 1;
  };

  // 1. Save one attendance record while the feature is on.
  await go(`/calendar/${SESSION}/attendance?group=g1`);
  // Everyone starts as present (D-056), so saving needs one tap.
  await page.getByRole("button", { name: "Save attendance" }).click();
  await page.waitForURL(`${BASE}/calendar/${SESSION}`);
  ok((await savedRecords()) === SEEDED + 1, `[${n}] one attendance record saved`);

  // 2. Every entry point is visible while on.
  ok(await navHasAttendance(), `[${n}] on: Attendance in the navigation`);
  await go("/");
  ok((await main.getByRole("heading", { name: "Attendance" }).count()) === 1, `[${n}] on: dashboard attendance card`);
  ok((await main.getByRole("link", { name: "Take attendance" }).count()) >= 1, `[${n}] on: dashboard take-attendance actions`);
  ok((await bellText()).includes("Attendance not taken"), `[${n}] on: activity lists sessions without attendance`);
  await go("/groups/g1");
  ok((await main.getByRole("link", { name: "Take attendance" }).count()) === 1, `[${n}] on: group page action`);
  await go(`/calendar/${SESSION}`);
  ok((await main.locator("section:has(h2:text('Attendance'))").innerText()).includes("8 present"), `[${n}] on: session shows the saved record`);

  // 3. Switch off on the Attendance page.
  await go("/attendance");
  ok((await attendanceSwitch().getAttribute("aria-checked")) === "true", `[${n}] switch starts on`);
  await attendanceSwitch().click();
  ok((await attendanceSwitch().getAttribute("aria-checked")) === "false", `[${n}] switch turns off`);
  ok(await main.getByText("Attendance is turned off").isVisible(), `[${n}] off: Attendance page shows the disabled state`);
  ok((await main.getByRole("link", { name: "U16 Development" }).count()) === 0, `[${n}] off: no group chooser`);
  await page.screenshot({ path: `${OUT}/features-${n}-off.png`, fullPage: true });

  // 4. Every entry point is hidden; the record is kept.
  const checkOff = async (label) => {
    ok((await savedRecords()) === SEEDED + 1, `[${n}] ${label}: saved record kept`);
    ok(!(await navHasAttendance()), `[${n}] ${label}: no Attendance in the navigation`);
    await go("/");
    ok((await main.getByRole("heading", { name: "Attendance" }).count()) === 0, `[${n}] ${label}: no dashboard attendance card`);
    ok((await page.getByRole("link", { name: /attendance/i }).count()) === 0, `[${n}] ${label}: no attendance links on the dashboard`);
    ok(!(await bellText()).includes("Attendance not taken"), `[${n}] ${label}: activity has no attendance items`);
    await go("/groups/g1");
    ok((await page.getByRole("link", { name: /attendance/i }).count()) === 0, `[${n}] ${label}: no attendance on the group page`);
    ok(await main.getByRole("link", { name: "Group chat", exact: true }).isVisible(), `[${n}] ${label}: group chat action still there`);
    await go(`/calendar/${SESSION}`);
    ok((await main.locator("section:has(h2:text('Attendance'))").count()) === 0, `[${n}] ${label}: no attendance on the session`);
    await go(`/calendar/${SESSION}/attendance?group=g1`);
    ok(await main.getByText("Attendance is turned off").isVisible(), `[${n}] ${label}: direct link shows the disabled state`);
    ok((await page.getByRole("button", { name: "Save attendance" }).count()) === 0, `[${n}] ${label}: no active attendance form`);
  };
  await checkOff("off");

  // 5. The setting survives a reload.
  await page.reload();
  await page.waitForLoadState("networkidle");
  await checkOff("after reload");

  // 6. The participant view never shows attendance.
  await go("/me");
  ok(!/attendance/i.test(await main.innerText()), `[${n}] participant home has no attendance`);

  // 7. Switch on again (from More) and everything comes back with the same record.
  await go("/more");
  await attendanceSwitch().click();
  ok((await attendanceSwitch().getAttribute("aria-checked")) === "true", `[${n}] switched on again from More`);
  ok(await navHasAttendance(), `[${n}] on again: Attendance in the navigation`);
  await go("/");
  ok((await main.getByRole("heading", { name: "Attendance" }).count()) === 1, `[${n}] on again: dashboard attendance card`);
  await go(`/calendar/${SESSION}`);
  ok((await main.locator("section:has(h2:text('Attendance'))").innerText()).includes("8 present"), `[${n}] on again: the saved record is back`);
  await go("/groups/g1");
  ok((await main.getByRole("link", { name: "Take attendance" }).count()) === 1, `[${n}] on again: group page action`);

  await finish(page, vp);
}
await browser.close();
done();

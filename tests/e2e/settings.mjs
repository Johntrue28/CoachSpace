// Settings page (D-043): navigation, the Features section with the global attendance switch,
// the "Coming soon" sections, the Demo section (D-055) and Reset demo data.
import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav, openSecondary } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();

for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  const n = vp.name;
  const desktop = vp.width >= 1024;
  const main = page.locator("main");
  const section = main.locator("section");
  const attendanceSwitch = () => page.getByRole("switch", { name: "Attendance tracking" });
  const savedFeatures = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("coachspace-demo-v2:tennis") ?? "{}").features ?? null);
  const navHasAttendance = async () => {
    if (desktop) return (await mainNav(page).getByRole("link", { name: "Attendance", exact: true }).count()) === 1;
    await page.goto(`${BASE}/more`);
    await page.waitForLoadState("networkidle");
    return (await main.getByRole("link", { name: /^Attendance/ }).count()) === 1;
  };

  // 1. Reach Settings from the navigation.
  await page.goto(`${BASE}/`);
  // A secondary page since D-071: the sidebar's More list on desktop, the avatar menu on phones.
  await openSecondary(page, vp, "Settings");
  await page.waitForURL(`${BASE}/settings`);
  ok((await page.locator("h1").innerText()) === "Settings", `[${n}] Settings page opens from the navigation`);
  const activeNav = desktop ? mainNav(page).getByRole("link", { name: "Settings", exact: true }) : page.getByRole("link", { name: /^Menu:/ });
  ok((await activeNav.getAttribute("aria-current")) === "page", `[${n}] navigation shows Settings as the current section`);
  // Sections in one row (D-073): Demo, Features, General, Notifications.
  const tabs = (await main.getByRole("navigation", { name: "Settings sections" }).getByRole("link").allInnerTexts()).join("|");
  ok(tabs === "Demo|Features|General|Notifications", `[${n}] settings sections (${tabs})`);
  ok((await main.getByText("Configure CoachSpace for the way your organisation works.").isVisible()) === vp.width >= 640, `[${n}] subtitle only from 640 px`);

  // 2. Features is the default section, with the switch on.
  await attendanceSwitch().waitFor();
  ok(await main.getByRole("heading", { name: "Application features" }).isVisible(), `[${n}] Features section by default`);
  ok((await attendanceSwitch().getAttribute("aria-checked")) === "true", `[${n}] attendance starts on`);
  ok(await section.getByText("Enabled", { exact: true }).isVisible(), `[${n}] status label says Enabled`);
  ok(await section.getByText("saved in this browser only").isVisible(), `[${n}] the setting is labelled as a demo setting`);

  // 3. Switch off: confirmation, label and navigation follow.
  await attendanceSwitch().click();
  ok(await main.getByRole("status").getByText("Attendance tracking is off").isVisible(), `[${n}] confirmation after switching off`);
  ok(await section.getByText("Disabled", { exact: true }).isVisible(), `[${n}] status label says Disabled`);
  ok((await savedFeatures())?.attendanceEnabled === false, `[${n}] setting saved in this browser`);
  await page.screenshot({ path: `${OUT}/settings-${n}-off.png`, fullPage: true });
  ok(!(await navHasAttendance()), `[${n}] Attendance gone from the navigation`);

  // 4. The setting survives a reload and matches the Attendance page.
  await page.goto(`${BASE}/settings`);
  await page.reload();
  await page.waitForLoadState("networkidle");
  ok((await attendanceSwitch().getAttribute("aria-checked")) === "false", `[${n}] still off after a reload`);
  await page.goto(`${BASE}/attendance`);
  await page.waitForLoadState("networkidle");
  ok((await attendanceSwitch().getAttribute("aria-checked")) === "false", `[${n}] Attendance page shows the same setting`);
  ok(await main.getByText("Attendance is turned off").isVisible(), `[${n}] Attendance page in its disabled state`);

  // 5. Switch on again from Settings.
  await page.goto(`${BASE}/settings?section=features`);
  await page.waitForLoadState("networkidle");
  await attendanceSwitch().click();
  ok(await main.getByRole("status").getByText("Attendance tracking is on").isVisible(), `[${n}] confirmation after switching on`);
  ok(await navHasAttendance(), `[${n}] Attendance back in the navigation`);

  // 6. General and Notifications are clearly "Coming soon" and have no pretend controls.
  await page.goto(`${BASE}/settings`);
  await page.waitForLoadState("networkidle");
  await main.getByRole("navigation", { name: "Settings sections" }).getByRole("link", { name: "Notifications" }).click();
  await page.waitForURL(`${BASE}/settings?section=notifications`);
  ok(await section.getByText("Coming soon").isVisible(), `[${n}] Notifications marked Coming soon`);
  ok(await section.getByText("does not send notifications").isVisible(), `[${n}] Notifications explains the demo limit`);
  ok((await section.locator("button, input, select, a").count()) === 0, `[${n}] no controls in Notifications`);
  await main.getByRole("navigation", { name: "Settings sections" }).getByRole("link", { name: "General" }).click();
  await page.waitForURL(`${BASE}/settings?section=general`);
  ok(await section.getByText("Coming soon").isVisible(), `[${n}] General marked Coming soon`);
  ok(
    (await main.getByRole("navigation", { name: "Settings sections" }).getByRole("link", { name: "General" }).getAttribute("aria-current")) === "page",
    `[${n}] section navigation shows the current section`,
  );
  ok((await section.locator("button, input, select, a").count()) === 0, `[${n}] no controls in General`);
  await page.screenshot({ path: `${OUT}/settings-${n}-general.png`, fullPage: true });
  // Demo (D-055): the scenario switcher and the demo data resets live here, not in General.
  const sectionLinks = await main.getByRole("navigation", { name: "Settings sections" }).getByRole("link").allInnerTexts();
  ok(sectionLinks.join("|") === "Demo|Features|General|Notifications", `[${n}] Settings sections in one order (${sectionLinks.join("|")})`);
  await main.getByRole("navigation", { name: "Settings sections" }).getByRole("link", { name: "Demo" }).click();
  await page.waitForURL(`${BASE}/settings?section=demo`);
  ok((await section.locator("button").allInnerTexts()).map((t) => t.replace(/\s+/g, " ").trim()).join("|") === "Tennis Coaching Active|Football Academy Northgate Football Academy|Basketball Club Eastfield Basketball Club|Pilates Studio Calma Pilates Studio|Reset demo data|Reset all scenarios", `[${n}] Demo offers the four scenarios and the two resets`);
  ok((await section.getByRole("link", { name: "Open the welcome screen" }).getAttribute("href")) === "/demo", `[${n}] Demo links to the welcome screen`);

  // 7. Reset demo data also restores the default settings.
  await page.goto(`${BASE}/settings?section=features`);
  await page.waitForLoadState("networkidle");
  await attendanceSwitch().click();
  ok((await attendanceSwitch().getAttribute("aria-checked")) === "false", `[${n}] off before the reset`);
  await page.goto(`${BASE}/settings?section=demo`);
  let question = "";
  page.once("dialog", (d) => { question = d.message(); d.accept(); });
  await section.getByRole("button", { name: "Reset demo data" }).click();
  await main.getByRole("status").getByText("Tennis Coaching restored to its fictional demo data.").waitFor();
  ok(question.startsWith("Reset Tennis Coaching?"), `[${n}] reset asks to confirm for the active scenario`);
  await page.goto(`${BASE}/settings?section=features`);
  await page.waitForLoadState("networkidle");
  ok((await attendanceSwitch().getAttribute("aria-checked")) === "true", `[${n}] reset restores attendance to on`);

  // 8. The participant view has no Settings.
  await page.goto(`${BASE}/me`);
  await page.waitForLoadState("networkidle");
  ok((await mainNav(page).getByRole("link", { name: "Settings" }).count()) === 0, `[${n}] no Settings in the participant view`);

  await finish(page, vp);
}
await browser.close();
done();

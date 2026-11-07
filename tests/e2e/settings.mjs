// Settings page (D-043, D-075): reached from the navigation, only the Demo section (no "Coming soon"
// sections, no feature switches), the scenario switcher and Reset demo data.
import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav, openSecondary } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();

for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  const n = vp.name;
  const desktop = vp.width >= 1024;
  const main = page.locator("main");
  const section = main.locator("section").first();

  // 1. Reach Settings from the navigation.
  await page.goto(`${BASE}/`);
  await openSecondary(page, vp, "Settings");
  await page.waitForURL(`${BASE}/settings`);
  ok((await page.locator("h1").innerText()) === "Settings", `[${n}] Settings page opens from the navigation`);
  const activeNav = desktop ? mainNav(page).getByRole("link", { name: "Settings", exact: true }) : page.getByRole("link", { name: /^Menu:/ });
  ok((await activeNav.getAttribute("aria-current")) === "page", `[${n}] navigation shows Settings as the current section`);

  // 2. Nothing that does not work: no Coming soon, no switches.
  ok((await main.getByText("Coming soon").count()) === 0, `[${n}] no Coming soon sections`);
  ok((await main.getByRole("switch").count()) === 0, `[${n}] no feature switches`);

  // 3. Demo: the three scenarios, the welcome screen link and the two resets.
  await section.getByRole("button", { name: "Reset demo data" }).waitFor();
  ok(
    (await section.locator("button").allInnerTexts()).map((t) => t.replace(/\s+/g, " ").trim()).join("|") ===
      "Tennis Coaching Active|Football Academy Northgate Football Academy|Basketball Club Eastfield Basketball Club|Reset demo data|Reset all scenarios",
    `[${n}] Demo offers the three scenarios and the two resets`,
  );
  ok((await section.getByRole("link", { name: "Open the welcome screen" }).getAttribute("href")) === "/demo", `[${n}] Demo links to the welcome screen`);
  await page.screenshot({ path: `${OUT}/settings-${n}.png`, fullPage: true });

  // 4. Reset demo data asks first and confirms honestly.
  let question = "";
  page.once("dialog", (d) => { question = d.message(); d.accept(); });
  await section.getByRole("button", { name: "Reset demo data" }).click();
  await main.getByRole("status").getByText("Tennis Coaching restored to its fictional demo data.").waitFor();
  ok(question.startsWith("Reset Tennis Coaching?"), `[${n}] reset asks to confirm for the active scenario`);

  // 5. The participant view has no Settings.
  await page.goto(`${BASE}/me`);
  await page.waitForLoadState("networkidle");
  ok((await mainNav(page).getByRole("link", { name: "Settings" }).count()) === 0, `[${n}] no Settings in the participant view`);

  await finish(page, vp);
}
await browser.close();
done();

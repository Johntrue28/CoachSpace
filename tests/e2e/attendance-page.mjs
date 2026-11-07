// Attendance page (D-051, D-076), reached from Profile: "Registers to take" at the top, the attendance log by date
// for each group with group chips, a register opening for correction, the form's summary and roster, and the
// player view (only their own percentage).
import { chromium, BASE, ok, viewports, newPage, finish, done, openSecondary, mainNav } from "./lib.mjs";
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
  const toTake = () => main.getByRole("list", { name: "Registers to take" }).getByRole("link");
  const logOf = (name) => main.getByRole("list", { name: `Registers of ${name}` }).getByRole("link");

  // 1. Reach the page from the navigation.
  await go("/");
  // A secondary page since D-071: the sidebar's More list on desktop, the avatar menu on phones.
  await openSecondary(page, vp, "Attendance");
  await page.waitForURL(`${BASE}/attendance`);
  await page.waitForLoadState("networkidle");
  ok((await page.locator("h1").innerText()) === "Attendance", `[${n}] page title`);
  ok((await page.getByRole("switch").count()) === 0, `[${n}] no attendance switch (always on)`);

  // 2. Registers to take: the most recent session of each group, newest first.
  const firstToTake = clean(await toTake().first().innerText());
  ok((await toTake().count()) >= 3 && /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) \d+ Oct · \d\d:\d\d · /.test(firstToTake), `[${n}] registers to take (${firstToTake})`);
  ok(clean(await main.getByRole("list", { name: "Registers to take" }).innerText()).includes("Mon 12 Oct · 17:00 · U16 Development"), `[${n}] U16's Monday register is waiting`);

  // 3. The log by date for each group, with chips; the seeded history (D-053, F-03).
  const u18 = clean(await logOf("U18 Performance").first().innerText());
  ok(u18 === "Thu 8 Oct · U18 · 5/6 present", `[${n}] a log row (${u18})`);
  ok((await main.locator("section[aria-labelledby^='log-']").count()) === 5, `[${n}] one log per group`);
  await main.getByRole("group", { name: "Show groups" }).getByRole("button", { name: "U16 Development" }).click();
  ok((await main.locator("section[aria-labelledby^='log-']").count()) === 1, `[${n}] a chip shows one group`);
  await main.getByRole("group", { name: "Show groups" }).getByRole("button", { name: "All groups" }).click();
  await page.screenshot({ path: `${OUT}/attpage-${n}-log.png`, fullPage: true });
  await toTake().filter({ hasText: "Mon 12 Oct · 17:00 · U16 Development" }).click();
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

  // 5. Back on the page: the register is taken and heads U16's log; a row opens it for correction.
  await go("/attendance");
  ok(!clean(await main.getByRole("list", { name: "Registers to take" }).innerText()).includes("Mon 12 Oct · 17:00 · U16 Development"), `[${n}] no longer to take`);
  ok(clean(await logOf("U16 Development").first().innerText()) === "Mon 12 Oct · U16 · 7/8 present", `[${n}] the new register heads the log`);
  await logOf("U16 Development").first().click();
  await page.waitForURL(/\/calendar\/g1-2026-10-12\/attendance\?group=g1$/);
  await page.getByRole("checkbox", { name: "Zara Khan present", exact: true }).waitFor({ state: "attached" });
  ok(!(await page.getByRole("checkbox", { name: "Zara Khan present", exact: true }).isChecked()) && (await page.getByRole("checkbox", { name: "Chloe Bennett present", exact: true }).isChecked()), `[${n}] a saved register opens for correction`);

  // 6. Participant view: only their own attendance percentage (D-075), no registers or attendance pages.
  await go("/me");
  ok(/Attendance this season: \d+%/.test(clean(await main.innerText())), `[${n}] participant sees their own attendance percentage`);
  ok((await main.getByRole("link", { name: /attendance/i }).count()) === 0, `[${n}] no attendance links for the participant`);
  ok((await mainNav(page).getByRole("link", { name: /Attendance/ }).count()) === 0, `[${n}] no attendance in the participant navigation`);

  // Clean up.
  await go("/settings");
  page.once("dialog", (d) => d.accept());
  await main.getByRole("button", { name: "Reset demo data" }).click();
  await finish(page, vp);
}
await browser.close();
done();

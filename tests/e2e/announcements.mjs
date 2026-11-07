import { chromium, BASE, ok, viewports, newPage, finish, done } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
for (const vp of viewports) {
  const page = await newPage(browser, vp);
  const n = vp.name;
  // Messages → Announcements (D-071: one place to communicate; the dashboard's announcements card is gone).
  await page.goto(`${BASE}/chat`);
  await page.locator("main").getByRole("navigation", { name: "Messages" }).getByRole("link", { name: "Announcements" }).click();
  await page.waitForURL(`${BASE}/announcements`);
  // The newest announcements first on the board.
  const dash = page.locator("main");
  // The board renders after client-side navigation, so wait for it before counting.
  await page.locator("main ul > li h3").first().waitFor();
  ok((await dash.locator("article h3").first().innerText()) === "Junior tournament on Saturday", `[${n}] board newest first`);
  ok((await page.locator("main ul > li").count()) === 4, `[${n}] board shows all 4 announcements`);
  ok(await page.locator("main").getByText("Laura Gomez", { exact: false }).first().isVisible(), `[${n}] author shown`);
  ok(await page.getByText("All groups", { exact: true }).first().isVisible(), `[${n}] all-groups audience shown`);
  await page.screenshot({ path: `${OUT}/ann-${n}-1-board.png`, fullPage: true });

  // Filter
  await page.getByRole("button", { name: "Adult Beginners" }).click();
  await page.waitForURL(/group=g3/);
  const titles = await page.locator("main ul > li h3").allInnerTexts();
  ok(titles.join("|") === "Riverside Park floodlights|Rackets to borrow", `[${n}] filter shows group + all-groups (${titles.join("|")})`);

  // Validation
  await page.locator("main").getByRole("link", { name: "New" }).click();
  await page.waitForURL(/announcements\/new\?group=g3/);
  ok((await page.getByLabel("For").inputValue()) === "g3", `[${n}] form preselects group from filter`);
  await page.getByLabel("Title").fill("   ");
  await page.getByRole("button", { name: "Post announcement" }).click();
  await page.getByText("Write the announcement.").waitFor();
  ok((await page.locator("main").getByRole("alert").count()) === 2, `[${n}] empty title and body show validation messages`);
  ok(page.url().includes("/announcements/new"), `[${n}] invalid form is not posted`);

  // Create for a specific group from the board filtered by that group (no Announcements tab on the group page, D-076)
  await page.goto(`${BASE}/groups/g1`);
  ok((await page.locator("main").getByRole("tab", { name: "Announcements" }).count()) === 0, `[${n}] no Announcements tab on the group page`);
  await page.goto(`${BASE}/announcements/new?group=g1`);
  await page.getByLabel("Title").waitFor();
  ok((await page.getByLabel("For").inputValue()) === "g1", `[${n}] form for that group`);
  await page.getByLabel("Title").fill("Training moved to 18:30");
  await page.getByLabel("Announcement").fill("Wednesday's session starts 30 minutes later because of court maintenance.");
  await page.getByRole("button", { name: "Post announcement" }).click();
  await page.waitForURL(/announcements\?group=g1$/);
  await page.locator("main").getByRole("status").filter({ hasText: /\S/ }).waitFor();
  ok(await page.locator("main").getByRole("status").filter({ hasText: /\S/ }).isVisible(), `[${n}] confirmation message shown`);
  ok((await page.locator("main").getByRole("status").filter({ hasText: /\S/ }).innerText()).includes("have not been notified"), `[${n}] confirmation says nobody was notified`);
  ok((await page.locator("main ul > li h3").first().innerText()) === "Training moved to 18:30", `[${n}] new announcement at the top`);
  ok((await page.locator("main ul > li").first().innerText()).includes("Today"), `[${n}] new announcement dated today`);
  await page.screenshot({ path: `${OUT}/ann-${n}-2-posted.png`, fullPage: true });

  await page.goto(`${BASE}/announcements?group=g2`);
  await page.locator("main ul > li h3").first().waitFor();
  ok(!(await page.getByText("Training moved to 18:30").count()), `[${n}] not shown for another group`);
  await page.goto(`${BASE}/announcements`);
  await dash.locator("article h3", { hasText: "Training moved to 18:30" }).waitFor();
  ok((await dash.locator("article h3").first().innerText()) === "Training moved to 18:30", `[${n}] new announcement first on the board`);

  // Persistence on this device + reset
  await page.reload();
  const kept = await dash.locator("article h3", { hasText: "Training moved to 18:30" }).waitFor({ timeout: 5000 }).then(() => true, () => false);
  ok(kept && (await dash.locator("article h3").first().innerText()) === "Training moved to 18:30", `[${n}] kept after reload (this device only)`);
  await page.goto(`${BASE}/settings`);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await page.waitForTimeout(200);
  await page.goto(`${BASE}/announcements`, { waitUntil: "networkidle" });
  await page.locator("main ul > li").first().waitFor();
  ok((await page.locator("main ul > li").count()) === 4, `[${n}] reset restores the fictional announcements`);

  // All-groups announcement appears on every group
  await page.goto(`${BASE}/announcements/new`);
  await page.getByLabel("Title").fill("Club closed on Sunday");
  await page.getByLabel("Announcement").fill("The club will be closed all day on Sunday.");
  await page.getByRole("button", { name: "Post announcement" }).click();
  await page.waitForURL(/\/announcements$/);
  let all = true;
  for (const g of ["g1", "g2", "g3", "g4", "g5"]) { await page.goto(`${BASE}/announcements?group=${g}`); const ok1 = await page.getByText("Club closed on Sunday").waitFor({ timeout: 5000 }).then(() => true, () => false); all = all && ok1 && (await page.getByText("Club closed on Sunday").count()) === 1; }
  ok(all, `[${n}] all-groups announcement shown on every group`);
  await page.goto(`${BASE}/settings`);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset demo data" }).click();

  // Reset lives in Settings only (nothing in two places, D-082).
  await page.goto(`${BASE}/library`);
  ok((await page.getByRole("button", { name: "Reset demo data" }).count()) === 0, `[${n}] no reset button in the Library`);
  await finish(page, vp);
}
await browser.close();
done();

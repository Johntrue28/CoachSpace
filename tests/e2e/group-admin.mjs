// Group management in the demo (D-072, redesign R7): New group with checks per field, the new group in the
// agenda and calendar from its first day, Add member with a guardian, the Invite sheet (fictional link,
// Copy link, QR placeholder, honest demo line), Edit group, saved after a reload, separate per scenario.
import { chromium, BASE, ok, viewports, newPage, finish, done } from "./lib.mjs";
const browser = await chromium.launch();

for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00")); // Wednesday, 12:00
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  const n = vp.name;
  const main = page.locator("main");
  const go = async (p) => {
    await page.goto(BASE + p);
    await page.waitForLoadState("networkidle");
  };

  // 1. One primary action on Groups opens the form.
  await go("/groups");
  await main.getByRole("link", { name: "New group" }).click();
  await page.waitForURL(`${BASE}/groups/new`);
  ok((await page.locator("h1").innerText()) === "New group", `[${n}] New group form`);
  ok((await main.innerText()).includes("Tennis — the sport of this example"), `[${n}] sport comes from the scenario`);

  // 2. Checks per field, and one weekly session per day.
  await main.getByRole("button", { name: "Create group" }).click();
  ok((await main.getByText("Give the group a name of at least 2 characters.").count()) === 1, `[${n}] name is required`);
  ok((await main.getByText("Enter where the group trains.").count()) === 1, `[${n}] place is required`);
  await main.getByRole("button", { name: "Add a day" }).click();
  await main.getByLabel("Day, session 2").selectOption("1");
  await main.getByLabel("Group name").fill("U16 Development");
  await main.getByRole("button", { name: "Create group" }).click();
  ok((await main.getByText("Another group already has this name.").count()) === 1, `[${n}] names are unique`);
  ok((await main.getByText(/Monday is already in the schedule/).count()) === 1, `[${n}] one session per day`);
  ok(page.url() === `${BASE}/groups/new`, `[${n}] nothing saved while there are errors`);

  // 3. A valid group: Wednesday 18:00 and Saturday 10:00.
  await main.getByLabel("Group name").fill("U10 Saturday Squad");
  await main.getByLabel("Day, session 1").selectOption("3");
  await main.getByLabel("Day, session 2").selectOption("6");
  await main.getByLabel("Start time, session 2").fill("10:00");
  await main.getByLabel("Place").fill("Riverside Club, Court 4");
  await main.getByLabel("Short code (optional)").fill("u10");
  await main.getByRole("button", { name: "Create group" }).click();
  await page.waitForURL(`${BASE}/groups/ng-1`);
  await page.waitForLoadState("networkidle");
  ok((await page.locator("h1").innerText()) === "U10 Saturday Squad", `[${n}] the new group's page opens`);
  ok((await main.getByRole("status").first().innerText()).includes("Group created in this browser only"), `[${n}] honest confirmation`);
  ok((await main.innerText()).includes("Wed & Sat · 18:00 / 10:00"), `[${n}] weekly schedule in the header`);
  ok((await main.getByText("No members yet. Add them here or share the invite link.").count()) === 1, `[${n}] empty group says so`);

  // 4. Add member with a guardian; the name is checked.
  await main.getByRole("button", { name: "Add member" }).click();
  const sheet = page.getByRole("dialog", { name: /Add a member/ });
  await sheet.getByRole("button", { name: "Add member" }).click();
  ok((await sheet.getByText("Enter the member's name.").count()) === 1, `[${n}] member name is required`);
  await sheet.getByRole("textbox", { name: /^Name/ }).fill("Sam Rivers");
  await sheet.getByRole("textbox", { name: /^Parent or guardian/ }).fill("Jo Rivers");
  await sheet.getByRole("button", { name: "Add member" }).click();
  await page.waitForTimeout(300);
  ok((await page.getByRole("dialog").count()) === 0, `[${n}] the sheet closes`);
  ok((await main.getByRole("status").first().innerText()).includes("Sam Rivers added in this browser only. Nobody was told (demo)."), `[${n}] honest member confirmation`);
  ok((await main.innerText()).includes("Guardian: Jo Rivers"), `[${n}] guardian shown`);
  ok((await main.getByRole("heading", { name: "Participants · 1" }).count()) === 1, `[${n}] one participant`);

  // 5. Invite: fictional link, copy, QR placeholder and the demo line; Escape closes it.
  await main.getByRole("button", { name: "Invite" }).click();
  const invite = page.getByRole("dialog", { name: "Invite to U10 Saturday Squad" });
  const link = await invite.getByLabel("Invite link").inputValue();
  ok(/^https:\/\/coachspace\.app\/join\/u10-[a-z2-9]{4}$/.test(link), `[${n}] fictional invite link (${link})`);
  ok((await invite.getByRole("img", { name: /cannot be scanned/ }).count()) === 1, `[${n}] QR placeholder says it cannot be scanned`);
  ok((await invite.innerText()).includes("Demo: this link does not work and nobody is invited."), `[${n}] demo line`);
  await invite.getByRole("button", { name: "Copy link" }).click();
  await invite.getByRole("status").filter({ hasText: /\w/ }).waitFor({ timeout: 5000 }).catch(() => {});
  const copied = await invite.getByRole("status").innerText();
  // Headless browsers may refuse the clipboard: then the sheet says how to copy by hand.
  ok(copied.includes("Link copied. It is a demo link") || copied.includes("Select the link above to copy it"), `[${n}] copy result stated (${copied})`);
  await page.keyboard.press("Escape");
  ok((await page.getByRole("dialog").count()) === 0, `[${n}] Escape closes the invite sheet`);

  // 6. The new group's sessions start today: today's 18:00 in the agenda, none last Saturday.
  await go("/");
  const today = main.getByRole("region", { name: /^Today/ });
  ok((await today.innerText()).includes("U10 Saturday Squad"), `[${n}] the new group is in today's agenda`);
  await go("/calendar/ng-1-2026-10-14");
  ok((await page.locator("h1").innerText()).length > 0 && (await main.innerText()).includes("U10 Saturday Squad"), `[${n}] its session page opens`);
  ok((await main.innerText()).includes("Sam Rivers"), `[${n}] the new member is in Who's coming`);
  await go("/calendar/ng-1-2026-10-10");
  ok((await main.innerText()).includes("not found"), `[${n}] no session before the group existed`);

  // 7. Edit, and everything is still there after a reload.
  await go("/groups/ng-1/edit");
  ok((await main.getByLabel("Group name").inputValue()) === "U10 Saturday Squad", `[${n}] the form starts from the group`);
  await main.getByLabel("Group name").fill("U10 Saturday Stars");
  await main.getByRole("button", { name: "Save changes" }).click();
  await page.waitForURL(`${BASE}/groups/ng-1`);
  await page.reload();
  await page.waitForLoadState("networkidle");
  ok((await page.locator("h1").innerText()) === "U10 Saturday Stars", `[${n}] edit saved after a reload`);
  ok((await main.innerText()).includes("Sam Rivers"), `[${n}] member saved after a reload`);
  await go("/groups");
  ok((await main.getByRole("link", { name: /U10 Saturday Stars/ }).count()) === 1, `[${n}] listed on Groups`);

  // 8. Another scenario does not see it.
  await page.evaluate(() => localStorage.setItem("coachspace-scenario", "football"));
  await go("/groups");
  ok((await main.innerText()).includes("U10 Saturday Stars") === false, `[${n}] not in another scenario`);
  await page.evaluate(() => localStorage.setItem("coachspace-scenario", "tennis"));

  await finish(page, vp);
}
await browser.close();
done();

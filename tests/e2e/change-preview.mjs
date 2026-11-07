// A change made once, seen by the players (D-076): after the coach cancels or moves a session, the notice says
// nobody was notified (demo), "See it as a player" opens the player's view of the same session, which shows the
// change, there is a way back, the change survives a reload, and a reset restores the original session. The
// large "What participants would see" preview card is gone.
import { chromium, BASE, ok, viewports, newPage, finish, done } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();

for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00")); // Wednesday, 12:00
  page.on("dialog", (d) => d.accept());
  const n = vp.name;
  const main = page.locator("main");
  const go = async (p) => {
    await page.goto(BASE + p);
    await page.waitForLoadState("networkidle");
  };
  const asPlayer = () => main.getByRole("link", { name: "See it as a player" });
  const ID = "g4-2026-10-14"; // Adult Improvers, Wednesday 19:00: Jordan Hale, the demo participant, is in this group

  // 1. No preview card; small links at the bottom.
  await go(`/calendar/${ID}`);
  await main.locator("h1").waitFor();
  ok((await main.getByRole("region", { name: /What participants would see/ }).count()) === 0, `[${n}] no preview card`);
  const links = await main.getByRole("navigation", { name: "Change this session" }).getByRole("link").allInnerTexts();
  ok(links.join("|") === "Reschedule or move|See it as a player", `[${n}] small links at the bottom (${links.join("|")})`);

  // 2. Cancel it: the honest notice.
  await main.getByRole("button", { name: "Cancel session" }).click();
  await main.getByLabel("Reason (optional)").fill("Courts flooded");
  await main.getByRole("button", { name: "Cancel session", exact: true }).click();
  const status = clean(await main.getByRole("status").filter({ hasText: /\S/ }).first().innerText());
  ok(status.includes("Players have not been notified (demo)"), `[${n}] the notice says nobody was notified (${status})`);
  ok(!/delivered|notified them|sent to \d|was sent to/i.test(clean(await main.innerText())), `[${n}] no fake delivery confirmation`);
  ok(clean(await main.innerText()).includes("This session will not take place: Courts flooded"), `[${n}] the coach sees the cancellation and its reason`);
  await page.screenshot({ path: `${OUT}/change-${n}-cancelled.png`, fullPage: true });

  // 3. Reload: the change is still there.
  await page.reload();
  await page.waitForLoadState("networkidle");
  ok(clean(await main.innerText()).includes("Courts flooded"), `[${n}] the change survives a reload`);

  // 4. The player's view of the same session, and the way back.
  await asPlayer().click();
  await page.waitForURL(`${BASE}/me/calendar/${ID}`);
  await main.locator("h1").waitFor();
  ok(clean(await main.innerText()).includes("This session will not take place: Courts flooded"), `[${n}] the player sees the cancellation`);
  ok((await page.getByRole("navigation", { name: /^Demo view/ }).first().getByRole("link", { name: /^(Participant|Player)$/ }).getAttribute("aria-current")) === "page", `[${n}] the demo view is now the player`);
  await main.getByRole("link", { name: "Back to the coach view" }).click();
  await page.waitForURL(`${BASE}/calendar/${ID}`);
  await main.getByRole("button", { name: "Restore this session" }).waitFor();
  ok(true, `[${n}] back to the coach view of the same session`);

  // 5. Restore.
  await main.getByRole("button", { name: "Restore this session" }).click();
  await main.getByRole("button", { name: "Cancel session" }).waitFor();
  ok(!clean(await main.innerText()).includes("will not take place"), `[${n}] restored`);

  // 6. Move it to 20:00: the coach and the player see the new time and where it moved from.
  await go(`/calendar/${ID}/edit`);
  await page.getByLabel("Start time").fill("20:00");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForURL(`${BASE}/calendar/${ID}`);
  await main.locator("h1").waitFor();
  const moved = clean(await main.innerText());
  ok(moved.includes("Moved from Wednesday 14 Oct, 19:00") && moved.includes("20:00–21:15"), `[${n}] the coach sees the move`);
  await go(`/me/calendar/${ID}`);
  await main.locator("h1").waitFor();
  const movedMine = clean(await main.innerText());
  ok(movedMine.includes("Moved from Wednesday 14 Oct, 19:00") && movedMine.includes("20:00–21:15"), `[${n}] the player sees the same move`);

  // 7. A group the demo player is not in: no "See it as a player" link.
  await go("/calendar/g1-2026-10-14");
  await main.locator("h1").waitFor();
  ok((await asPlayer().count()) === 0, `[${n}] no link to a view that would not show the session`);

  // 8. Reset: the session is back to the weekly schedule, in the coach and player views.
  await go("/settings");
  await main.getByRole("button", { name: "Reset demo data" }).click();
  await main.getByRole("status").filter({ hasText: "restored to its fictional demo data" }).first().waitFor();
  await go(`/calendar/${ID}`);
  await main.locator("h1").waitFor();
  ok(clean(await main.innerText()).includes("19:00–20:15"), `[${n}] reset restores the original session`);
  await go(`/me/calendar/${ID}`);
  await main.locator("h1").waitFor();
  ok(!/Moved from|will not take place/.test(clean(await main.innerText())), `[${n}] and the player view`);

  await finish(page, vp);
}
await browser.close();
done();

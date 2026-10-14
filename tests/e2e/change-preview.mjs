// The core promise made visible (audit R-04): after the coach cancels or moves a session, a labelled
// demo preview shows the session exactly as its participants would see it, nothing is presented as
// sent, the participant view of the same session is one tap away, there is a way back to the coach
// view, the change survives a reload, and a reset restores the original session.
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
  const preview = () => main.getByRole("region", { name: "What participants would see — demo preview" });
  const ID = "g4-2026-10-14"; // Adult Improvers, Wednesday 19:00: Jordan Hale, the demo participant, is in this group

  // 1. An unchanged session has no preview.
  await go(`/calendar/${ID}`);
  await main.locator("h1").waitFor();
  ok((await preview().count()) === 0, `[${n}] no preview while the session follows the weekly schedule`);

  // 2. Cancel it: the honest notice stays, and the preview appears.
  await main.getByRole("button", { name: "Cancel this session" }).click();
  await main.getByLabel("Reason (optional)").fill("Courts flooded");
  await main.getByRole("button", { name: "Cancel session", exact: true }).click();
  await preview().waitFor();
  const status = clean(await main.getByRole("status").filter({ hasText: /\S/ }).first().innerText());
  ok(status.includes("Participants have not been notified (demo)") && status.includes("preview below"), `[${n}] the notice still says nobody was notified (${status})`);
  const text = clean(await preview().innerText());
  ok(text.includes("Nothing has been sent to anyone"), `[${n}] the preview says nothing was sent`);
  ok(text.includes("This session will not take place: Courts flooded") && text.includes("Cancelled"), `[${n}] the preview shows the cancellation and its reason`);
  ok(!/delivered|notified them|sent to \d|was sent to/i.test(text), `[${n}] no fake delivery confirmation`);
  await page.screenshot({ path: `${OUT}/preview-${n}-cancelled.png`, fullPage: true });

  // 3. Reload: the change and its preview are still there.
  await page.reload();
  await page.waitForLoadState("networkidle");
  await preview().waitFor();
  ok(clean(await preview().innerText()).includes("Courts flooded"), `[${n}] the preview survives a reload`);

  // 4. The participant's view of the same session, and the way back.
  await preview().getByRole("link", { name: "Open Jordan Hale’s view of this session" }).click();
  await page.waitForURL(`${BASE}/me/calendar/${ID}`);
  await main.locator("h1").waitFor();
  const mine = clean(await main.innerText());
  ok(mine.includes("This session will not take place: Courts flooded"), `[${n}] the participant sees the cancellation`);
  ok((await page.getByRole("navigation", { name: "Demo view" }).first().getByRole("link", { name: "Participant" }).getAttribute("aria-current")) === "page", `[${n}] the demo view is now the participant`);
  await main.getByRole("link", { name: "Back to the coach view of this session" }).click();
  await page.waitForURL(`${BASE}/calendar/${ID}`);
  await preview().waitFor();
  ok(true, `[${n}] back to the coach view of the same session`);

  // 5. Restore: the preview disappears.
  await main.getByRole("button", { name: "Restore this session" }).click();
  await main.getByRole("button", { name: "Cancel this session" }).waitFor();
  ok((await preview().count()) === 0, `[${n}] no preview once restored`);

  // 6. Move it to 20:00: the preview shows the new time and where it moved from.
  await go(`/calendar/${ID}/edit`);
  await page.getByLabel("Start time").fill("20:00");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForURL(`${BASE}/calendar/${ID}`);
  await preview().waitFor();
  const moved = clean(await preview().innerText());
  ok(moved.includes("Moved from Wednesday 14 Oct, 19:00") && moved.includes("20:00–21:15"), `[${n}] the preview shows the move (${moved.slice(0, 160)})`);
  ok(clean(await main.getByRole("status").filter({ hasText: /\S/ }).first().innerText()).includes("preview below"), `[${n}] the move notice points to the preview`);
  await page.screenshot({ path: `${OUT}/preview-${n}-moved.png`, fullPage: true });
  await go(`/me/calendar/${ID}`);
  await main.locator("h1").waitFor();
  const movedMine = clean(await main.innerText());
  ok(movedMine.includes("Moved from Wednesday 14 Oct, 19:00") && movedMine.includes("20:00–21:15"), `[${n}] the participant sees the same move`);

  // 7. A group the demo participant is not in: the preview, and an honest note instead of a link.
  await go("/calendar/g1-2026-10-14");
  await main.getByRole("button", { name: "Cancel this session" }).click();
  await main.getByRole("button", { name: "Cancel session", exact: true }).click();
  await preview().waitFor();
  const other = clean(await preview().innerText());
  ok(other.includes("follows Jordan Hale, who is not in U16 Development") && (await preview().getByRole("link").count()) === 0, `[${n}] no link to a view that would not show the session`);

  // 8. Reset: both sessions are back to the weekly schedule, in the coach and participant views.
  await go("/settings?section=demo");
  await main.getByRole("button", { name: "Reset demo data" }).click();
  await main.getByRole("status").filter({ hasText: "restored to its fictional demo data" }).first().waitFor();
  await go(`/calendar/${ID}`);
  await main.locator("h1").waitFor();
  ok((await preview().count()) === 0 && clean(await main.innerText()).includes("19:00–20:15"), `[${n}] reset restores the original session`);
  await go(`/me/calendar/${ID}`);
  await main.locator("h1").waitFor();
  ok(!/Moved from|will not take place/.test(clean(await main.innerText())), `[${n}] and the participant view`);

  await finish(page, vp);
}
await browser.close();
done();

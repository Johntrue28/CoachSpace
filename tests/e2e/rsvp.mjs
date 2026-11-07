// "Are you coming?" (D-071): the player answers with one tap on their agenda and on the session page, can
// take an answer back, and the coach sees it at once in Who's coming; the reminder for non-responders is
// prepared, never sent; a new register starts from the answers (Can't go = absent).
import { chromium, BASE, ok, viewports, newPage, finish, done } from "./lib.mjs";
const browser = await chromium.launch();

for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00")); // Wednesday, 12:00
  const n = vp.name;
  const main = page.locator("main");
  const go = async (p) => {
    await page.goto(BASE + p);
    await page.waitForLoadState("networkidle");
  };
  const waiting = async () => Number((/(\d+) sessions? waiting for your answer/.exec(await main.innerText()) ?? [0, 0])[1]);

  // 1. The player's agenda: every upcoming session waits for an answer.
  await go("/me");
  ok((await page.locator("h1").innerText()) === "Hi Jordan", `[${n}] player agenda`);
  const before = await waiting();
  ok(before > 0, `[${n}] sessions waiting for an answer (${before})`);
  const first = main.getByRole("group", { name: "Are you coming to Serve consistency?", exact: true }).last();
  await first.getByRole("button", { name: "Going" }).click();
  ok((await first.getByRole("button", { name: "Going" }).getAttribute("aria-pressed")) === "true", `[${n}] Going is selected`);
  ok((await waiting()) === before - 1, `[${n}] one fewer waiting`);

  // 2. Tapping it again takes the answer back; then answer Maybe and keep it after a reload.
  await first.getByRole("button", { name: "Going" }).click();
  ok((await first.getByRole("button", { name: "Going" }).getAttribute("aria-pressed")) === "false", `[${n}] answer taken back`);
  ok((await waiting()) === before, `[${n}] waiting again`);
  await first.getByRole("button", { name: "Going" }).click();
  await page.reload();
  await page.waitForLoadState("networkidle");
  ok((await main.getByRole("group", { name: "Are you coming to Serve consistency?", exact: true }).last().getByRole("button", { name: "Going" }).getAttribute("aria-pressed")) === "true", `[${n}] answer kept after a reload`);

  // 2b. Swipe (D-074): drag the next unanswered card right = Going, up = Maybe; a short drag does nothing.
  const deck = main.getByRole("region", { name: /^Are you coming\? \d+ waiting/ });
  const card = deck.locator("div.cursor-grab");
  const title = async () => card.getAttribute("data-session");
  const drag = async (dx, dy) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    const box = await card.boundingBox();
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= 6; i++) await page.mouse.move(x + (dx * i) / 6, y + (dy * i) / 6);
    await page.mouse.up();
    await page.waitForTimeout(400);
  };
  const t1 = await title();
  await drag(40, 0);
  ok((await title()) === t1, `[${n}] a short drag does not answer`);
  await drag(170, 0);
  const t2 = await title();
  ok(t2 !== t1, `[${n}] swiping right answers and shows the next card (${t1} → ${t2})`);
  const answered = main.getByRole("region", { name: "My next sessions" }).locator(`li:has(a[href="/me/calendar/${t1}"])`);
  ok((await answered.getByRole("button", { name: "Going" }).getAttribute("aria-pressed")) === "true", `[${n}] the swiped session is Going`);
  await drag(0, -170);
  const maybe = main.getByRole("region", { name: "My next sessions" }).locator(`li:has(a[href="/me/calendar/${t2}"])`);
  ok((await maybe.getByRole("button", { name: "Maybe" }).getAttribute("aria-pressed")) === "true", `[${n}] swiping up answers Maybe`);

  // 3. The coach sees it in Who's coming on the same session.
  await go("/calendar/g4-2026-10-14");
  const who = main.getByRole("region", { name: "Who’s coming" });
  const going = who.locator("div", { has: page.getByRole("heading", { name: /^Going · \d+/ }) }).first();
  ok((await going.innerText()).includes("Jordan Hale"), `[${n}] the player's answer is in Going`);
  ok(/\d+ going/.test(await who.innerText()), `[${n}] answer count in words`);

  // 4. Remind non-responders: prepared, not sent (a session five days away, when fewer have replied).
  await go("/calendar/g1-2026-10-19");
  await main.getByRole("heading", { name: "Who’s coming" }).waitFor();
  const remind = who.getByRole("button", { name: /^Remind \d+ who haven’t replied$/ });
  ok((await remind.count()) === 1, `[${n}] reminder button for non-responders`);
  await remind.click();
  ok(/Reminder prepared for \d+ (person|people) \(demo\): nobody was notified\./.test(await who.getByRole("status").innerText()), `[${n}] honest reminder message`);

  // 5. A new register starts from the answers: Can't go starts absent, the others present.
  await go("/me/calendar/g5-2026-10-15");
  await main.getByRole("button", { name: "Can't go" }).click();
  ok((await main.getByRole("button", { name: "Can't go" }).getAttribute("aria-pressed")) === "true", `[${n}] Can't go on the session page`);
  await go("/calendar/g5-2026-10-15/attendance");
  ok((await main.getByText("Members who said they can't come start as absent").count()) === 1, `[${n}] the register explains the defaults`);
  ok((await main.getByRole("checkbox", { name: "Jordan Hale present" }).isChecked()) === false, `[${n}] Jordan starts absent`);
  const checks = main.getByRole("checkbox", { name: / present$/ });
  const states = await checks.evaluateAll((els) => els.map((e) => e.checked));
  ok(states.filter((s) => !s).length >= 1 && states.some(Boolean), `[${n}] the others follow their answers (${states.filter((s) => !s).length} absent of ${states.length})`);

  // 6. Cancelled sessions cannot be answered.
  await go("/calendar/g5-2026-10-22");
  await main.getByRole("button", { name: "Cancel this session" }).click();
  await main.getByRole("button", { name: "Cancel session", exact: true }).click();
  ok((await main.getByRole("region", { name: "Who’s coming" }).count()) === 0, `[${n}] no Who's coming on a cancelled session`);
  await go("/me/calendar/g5-2026-10-22");
  ok((await main.getByRole("group", { name: /Are you coming/ }).count()) === 0, `[${n}] no answer buttons for a cancelled session`);

  await finish(page, vp);
}
await browser.close();
done();

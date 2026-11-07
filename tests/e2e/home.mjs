// The coach's Home (D-071, D-076): the latest announcement pinned and closable, the next session as a card that
// opens the session as a whole, the registers to take, then the rest of the next seven days by day (never the
// card's session again), each row opening the session page. No week strip, no session sheet.
import { chromium, BASE, ok, viewports, newPage, finish, done } from "./lib.mjs";
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
  const dayHeadings = () => main.locator("section[aria-labelledby^='day-'] h2").allInnerTexts();

  // 1. Title, the next seven days by day, today first; the card's session is not repeated in the list.
  await go("/");
  ok((await page.locator("h1").innerText()) === "Home", `[${n}] Home title`);
  const days = await dayHeadings();
  ok(days.length >= 5 && days.length <= 7 && days[0].startsWith("Today"), `[${n}] days from today (${days.join(" | ")})`);
  ok(days[1].startsWith("Tomorrow"), `[${n}] tomorrow labelled`);
  const today = main.getByRole("region", { name: /^Today/ });
  const rows = today.getByRole("link");
  ok((await rows.count()) === 1 && clean(await rows.first().innerText()).includes("Serve consistency"), `[${n}] today lists only the session after the card`);
  ok(/\d+ going/.test(await rows.first().innerText()), `[${n}] who is coming on each row`);
  ok(!clean(await main.locator("section[aria-labelledby^='day-']").allInnerTexts().then((t) => t.join(" "))).includes("Footwork and recovery"), `[${n}] the card's session is not repeated`);
  ok((await main.getByRole("group", { name: "Choose a day" }).count()) === 0, `[${n}] no week strip`);
  ok((await main.getByRole("link", { name: "Open the month calendar" }).count()) === 0, `[${n}] the calendar is reached from Profile, not repeated here`);

  // 2. One way to create (D-074): the + in the bottom navigation on phones, "Create" in the header on desktop.
  const create = page.getByRole("button", { name: "Create" }).filter({ visible: true });
  ok((await create.count()) === 1, `[${n}] exactly one visible Create`);
  await create.click();
  const menu = page.getByRole("dialog", { name: "Create" });
  ok((await menu.getByRole("link", { name: /^New session/ }).getAttribute("href")) === "/calendar/new", `[${n}] the Create menu opens`);
  await page.keyboard.press("Escape");

  // 3. The latest announcement, pinned: the whole card opens it in Messages; × hides it until a newer one.
  const pinned = main.getByRole("region", { name: "Latest announcement" });
  const pinnedText = clean(await pinned.innerText());
  ok(pinnedText.includes("Junior tournament on Saturday") && pinnedText.includes("U16 Development"), `[${n}] latest announcement pinned (${pinnedText.slice(0, 70)})`);
  await pinned.getByRole("link").click();
  await page.waitForURL(/\/announcements#an-/);
  ok(true, `[${n}] the pinned card opens the announcement in Messages`);
  await go("/");
  await pinned.getByRole("button", { name: "Hide this announcement" }).click();
  ok((await pinned.count()) === 0, `[${n}] × hides the pinned announcement`);
  await page.reload();
  await page.waitForLoadState("networkidle");
  ok((await pinned.count()) === 0, `[${n}] still hidden after a reload`);
  await go("/announcements/new");
  await page.getByLabel("Title").fill("Courts closed on Friday");
  await page.getByLabel("Announcement").fill("Maintenance all day.");
  await page.getByRole("button", { name: "Post announcement" }).click();
  await page.waitForURL(/\/announcements(\?|$)/);
  await go("/");
  ok(clean(await pinned.innerText()).includes("Courts closed on Friday") && clean(await pinned.innerText()).includes("All groups"), `[${n}] a newer announcement is pinned again`);

  // 4. The next-session card: countdown, who is coming, a reminder that is not sent, and the whole card opens the session.
  const hero = main.getByRole("region", { name: "Footwork and recovery" });
  ok(clean(await hero.innerText()).includes("in 5 h") && /\d+ going/.test(await hero.innerText()), `[${n}] next session with countdown and answers`);
  const remind = hero.getByRole("button", { name: /^Remind \d+$/ });
  if (await remind.count()) {
    await remind.click();
    ok((await hero.getByRole("status").innerText()).includes("nobody was notified") && page.url() === `${BASE}/`, `[${n}] Remind keeps its own action (demo)`);
  } else ok(true, `[${n}] everyone has replied, no reminder offered`);
  const box = await hero.boundingBox();
  await page.mouse.click(box.x + 20, box.y + 20); // on the photo, away from any button
  await page.waitForURL(`${BASE}/calendar/g1-2026-10-14`);
  ok(true, `[${n}] tapping the card's photo opens the session`);
  await go("/");

  // 5. Needs you: only the registers to take (unread messages show on the Messages badge).
  ok((await main.getByRole("link", { name: /\d+ registers? to take/ }).count()) === 1, `[${n}] registers to take`);
  ok(!/unread messages?/.test(clean(await main.innerText())), `[${n}] no unread item on Home`);

  // 6. Group filter: one group only, then all again.
  await main.getByRole("group", { name: "Show groups" }).getByRole("button", { name: "Adult Improvers" }).click();
  const filtered = clean(await main.innerText());
  ok(filtered.includes("Serve consistency") && !filtered.includes("Footwork and recovery"), `[${n}] filter shows one group`);
  await main.getByRole("group", { name: "Show groups" }).getByRole("button", { name: "All groups" }).click();
  ok(clean(await main.innerText()).includes("Footwork and recovery"), `[${n}] all groups again`);

  // 7. A whole row opens the session page (no sheet).
  await rows.first().click();
  await page.waitForURL(/\/calendar\/g4-2026-10-14$/);
  await main.getByRole("heading", { name: "Who’s coming" }).waitFor();
  ok((await page.getByRole("dialog").count()) === 0, `[${n}] a row opens the session page`);

  await finish(page, vp);
}
await browser.close();
done();

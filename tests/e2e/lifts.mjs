// Lifts (carpool) at the bottom of every session (D-076), for the coach and the player: the example lifts, one
// demo line, offering seats (with checks), "I can take you", removing an offer, joining and leaving a car, a full
// car, asking for a lift and withdrawing it, kept after a reload, nothing on a cancelled session.
import { chromium, BASE, ok, viewports, newPage, finish, done } from "./lib.mjs";
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
  const lifts = () => main.getByRole("region", { name: "Lifts" });
  const cars = () => lifts().getByRole("list", { name: "Cars" }).getByRole("listitem");

  // 1. The coach: example lifts on today's U16 session, one demo line, at the bottom of the session.
  await go("/calendar/g1-2026-10-14");
  await lifts().waitFor();
  const text = clean(await lifts().innerText());
  ok(text.includes("Demo: saved in this browser only — nobody is notified."), `[${n}] one demo line`);
  ok((await main.getByText(/^Demo/).count()) === 1, `[${n}] at most one demo line on the screen`);
  const chloe = clean(await cars().first().innerText());
  ok(chloe.startsWith("Chloe Bennett 2 seats left · leaves 16:30") && chloe.includes("With Ethan"), `[${n}] the example car (${chloe})`);
  ok(text.includes("Isla Ward needs a lift"), `[${n}] the example request`);
  const order = await main.locator("section[aria-labelledby]").evaluateAll((els) => els.map((e) => e.getAttribute("aria-labelledby")));
  ok(order.indexOf("lifts-heading") === order.length - 1, `[${n}] Lifts is the last block (${order.join(",")})`);

  // 2. Offer a lift: checks, then the coach's car; "I can take you" moves Isla into it; remove the offer.
  await lifts().getByRole("button", { name: "Offer a lift" }).click();
  await lifts().getByLabel("Leaves at").fill("");
  await lifts().getByRole("button", { name: "Offer seats" }).click();
  ok(await lifts().getByRole("alert").filter({ hasText: "departure time" }).isVisible(), `[${n}] a departure time is needed`);
  await lifts().getByLabel("Free seats").selectOption("2");
  await lifts().getByLabel("Leaves at").fill("16:45");
  await lifts().getByLabel("Note (optional)").fill("Leaving from the school");
  await lifts().getByRole("button", { name: "Offer seats" }).click();
  const mine = cars().filter({ hasText: "Your car" });
  ok(clean(await mine.innerText()).startsWith("Your car 2 seats left · leaves 16:45 Leaving from the school"), `[${n}] the coach's car (${clean(await mine.innerText())})`);
  ok((await lifts().getByRole("button", { name: "Offer a lift" }).count()) === 0, `[${n}] one offer per driver`);
  await lifts().getByRole("button", { name: "I can take you" }).click();
  ok(clean(await mine.innerText()).includes("1 seat left") && clean(await mine.innerText()).includes("With Isla"), `[${n}] I can take you moves Isla into the car`);
  ok(!clean(await lifts().innerText()).includes("needs a lift"), `[${n}] the request is gone`);
  await page.screenshot({ path: `${OUT}/lifts-${n}-coach.png`, fullPage: true });
  await mine.getByRole("button", { name: "Remove offer" }).click();
  ok((await cars().filter({ hasText: "Your car" }).count()) === 0, `[${n}] the driver removes the offer`);

  // 3. The player (Jordan) on Adult Improvers tonight: join, then leave; full; need a lift and withdraw.
  await go("/me/calendar/g4-2026-10-14");
  await lifts().waitFor();
  const sara = cars().filter({ hasText: "Sara Molina" });
  ok(clean(await sara.innerText()).includes("2 seats left · leaves 18:30"), `[${n}] the player sees the example car`);
  await sara.getByRole("button", { name: "Join" }).click();
  ok(clean(await sara.innerText()).includes("1 seat left") && clean(await sara.innerText()).includes("you"), `[${n}] joining takes one seat`);
  ok((await lifts().getByRole("button", { name: /Offer a lift|Need a lift/ }).count()) === 0, `[${n}] a passenger neither offers nor asks`);
  await page.reload();
  await page.waitForLoadState("networkidle");
  await lifts().waitFor();
  ok(clean(await cars().filter({ hasText: "Sara Molina" }).innerText()).includes("1 seat left"), `[${n}] kept after a reload`);
  await cars().filter({ hasText: "Sara Molina" }).getByRole("button", { name: "Leave" }).click();
  ok(clean(await sara.innerText()).includes("2 seats left"), `[${n}] leaving frees the seat`);
  await lifts().getByRole("button", { name: "Need a lift" }).click();
  await lifts().getByLabel("Where from? (optional)").fill("from Son Ferrer");
  await lifts().getByRole("button", { name: "Ask for a lift" }).click();
  ok(clean(await lifts().innerText()).includes("You need a lift · from Son Ferrer"), `[${n}] need a lift`);
  await page.screenshot({ path: `${OUT}/lifts-${n}-player.png`, fullPage: true });
  await lifts().getByRole("button", { name: "Withdraw" }).click();
  ok(!clean(await lifts().innerText()).includes("You need a lift"), `[${n}] the request is withdrawn`);

  // A full car: the coach offers one seat on Adult Improvers and Nina fills it; the player sees "Full".
  await go("/calendar/g4-2026-10-14");
  await lifts().getByRole("button", { name: "Offer a lift" }).click();
  await lifts().getByLabel("Free seats").selectOption("1");
  await lifts().getByRole("button", { name: "Offer seats" }).click();
  await lifts().getByRole("button", { name: "I can take you" }).click();
  await go("/me/calendar/g4-2026-10-14");
  await lifts().waitFor();
  const coachCar = cars().filter({ hasText: "Laura Gomez" });
  ok(clean(await coachCar.innerText()).includes("0 seats left") && (await coachCar.getByText("Full", { exact: true }).count()) === 1 && (await coachCar.getByRole("button").count()) === 0, `[${n}] a full car shows Full`);

  // 4. No lifts on a session without any: one line and the two buttons. None on a cancelled session.
  await go("/calendar/g2-2026-10-15");
  await lifts().waitFor();
  ok(clean(await lifts().innerText()).includes("No lifts yet") && (await lifts().getByRole("button").count()) === 2, `[${n}] empty state with Offer a lift and Need a lift`);
  await main.getByRole("button", { name: "Cancel session", exact: true }).click();
  await main.getByRole("button", { name: "Cancel session", exact: true }).click();
  await main.getByRole("button", { name: "Restore this session" }).waitFor();
  ok((await lifts().count()) === 0, `[${n}] no lifts on a cancelled session`);

  // Clean up.
  await go("/settings");
  page.once("dialog", (d) => d.accept());
  await main.getByRole("button", { name: "Reset demo data" }).click();
  await finish(page, vp);
}
await browser.close();
done();

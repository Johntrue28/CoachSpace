// A coach opening the email link on a phone (D-070): as close to a real visit as a script allows.
// Mobile Chrome profile with touch (taps, not clicks), 4× slower CPU and "slow 4G" (150 ms round
// trip, 1.6 Mbit/s), the real clock (whatever today is), human pauses and typing. The coach taps a
// sport as soon as it is visible (before the page has finished loading), follows the introduction,
// cancels and restores a session with its participant preview, takes attendance, writes in the chat,
// looks at the participant view, switches sport, and opens the link again in a new tab.
// Every tap is timed until its result is on screen; a step over the limit fails.
import { chromium, BASE, ok, done } from "./lib.mjs";
const OUT = process.argv[2];
const LIMIT_MS = Number(process.env.STEP_LIMIT_MS ?? 3000);
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const timings = [];

const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  locale: "en-GB",
  timezoneId: "Europe/Madrid",
  userAgent:
    "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
});
async function phoneTab() {
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
  page.on("dialog", (d) => d.accept());
  return page;
}
/** Runs one coach action and times it until `until` resolves. */
async function step(name, action, until) {
  const t = Date.now();
  await action();
  await until();
  const ms = Date.now() - t;
  timings.push({ name, ms });
  ok(ms <= LIMIT_MS, `${name}: ${ms} ms`);
  await pause(400 + Math.round(Math.random() * 400)); // reading the screen
}

const page = await phoneTab();
const main = page.locator("main");
const h1 = (text) => page.locator("h1").filter({ hasText: text }).first().waitFor({ timeout: 15000 });
const bottomNav = page.getByRole("navigation", { name: "Main" });

// 1. The link from the email: the welcome screen, then a tap on Tennis as soon as it shows.
await step(
  "Open the link: welcome screen visible",
  () => page.goto(`${BASE}/`, { waitUntil: "commit" }),
  () => page.locator('article[data-scenario="tennis"]').waitFor({ state: "visible", timeout: 15000 }),
);
await step(
  "Tap Tennis Coaching straight away",
  () => page.getByRole("link", { name: "Explore Tennis Coaching" }).tap(),
  () => h1("Home"),
);
const intro = main.getByRole("region", { name: "About this demo" });
await intro.waitFor({ timeout: 15000 });
ok(await intro.isVisible(), "the demo guide explains the demo");
ok(clean(await intro.innerText()).includes("nothing is sent to anyone"), "and says nothing is sent");

// 2. The guide's first suggestion: the next session and who is coming (D-071).
await step(
  "Open the next session from the guide",
  () => intro.getByRole("link", { name: /^1\. Open a session/ }).tap(),
  () => main.getByRole("button", { name: "Cancel session", exact: true }).waitFor({ timeout: 15000 }),
);
const sessionUrl = page.url();

// 3. Cancel it with a reason: the honest notice and the participant preview.
await step("Tap Cancel session", () => main.getByRole("button", { name: "Cancel session", exact: true }).tap(), () => main.getByLabel("Reason (optional)").waitFor());
await main.getByLabel("Reason (optional)").tap();
await page.keyboard.type("Courts flooded", { delay: 60 });
const preview = main.getByRole("region", { name: "What participants would see — demo preview" });
await step("Confirm the cancellation", () => main.getByRole("button", { name: "Cancel session", exact: true }).tap(), () => preview.waitFor());
ok(clean(await main.getByRole("status").filter({ hasText: /\S/ }).first().innerText()).includes("not been notified (demo)"), "the notice says nobody was notified");
ok(clean(await preview.innerText()).includes("This session will not take place: Courts flooded"), "the preview shows what participants would see");
await preview.scrollIntoViewIfNeeded();
await page.screenshot({ path: `${OUT}/journey-preview.png` });
const openView = preview.getByRole("link", { name: /view of this session/ });
if (await openView.count()) {
  await step("Open the participant's view of it", () => openView.tap(), () => main.getByText("This session will not take place").waitFor({ timeout: 15000 }));
  await step("Back to the coach view", () => main.getByRole("link", { name: "Back to the coach view of this session" }).tap(), () => preview.waitFor({ timeout: 15000 }));
} else {
  ok((await preview.innerText()).includes("follows"), "the preview explains why there is no participant link");
}
await step("Restore the session", () => main.getByRole("button", { name: "Restore this session" }).tap(), () => main.getByRole("button", { name: "Cancel session", exact: true }).waitFor());
ok(page.url() === sessionUrl, "still on the same session");

// 4. Attendance for a group: everyone starts present, tap two who are missing, save.
await step("Bottom nav: Home", () => bottomNav.getByRole("link", { name: "Home" }).tap(), () => h1("Home"));
await step("Needs you: registers to take", () => main.getByRole("link", { name: /registers? to take/ }).first().tap(), () => h1("Take attendance"));
await step("Choose a group", () => main.locator('a[href^="/attendance?group="]').first().tap(), () => main.locator('a[href*="/attendance?group="][href^="/calendar/"]').first().waitFor({ timeout: 15000 }));
await step(
  "Choose its session",
  () => main.locator('a[href*="/attendance?group="][href^="/calendar/"]').first().tap(),
  () => main.getByRole("checkbox").first().waitFor({ timeout: 15000 }),
);
const boxes = main.getByRole("checkbox");
// A person taps the row (its label), not the hidden checkbox inside it.
await boxes.nth(1).locator("xpath=ancestor::label").tap();
await pause(300);
await boxes.nth(3).locator("xpath=ancestor::label").tap();
ok(!(await boxes.nth(1).isChecked()) && !(await boxes.nth(3).isChecked()), "two participants marked absent with two taps");
await step("Save attendance", () => main.getByRole("button", { name: "Save attendance" }).tap(), () => main.getByRole("status").filter({ hasText: /saved/i }).first().waitFor({ timeout: 15000 }));

// 5. The chat: a message to a group, clearly not delivered.
await step("Bottom nav: Messages", () => bottomNav.getByRole("link", { name: /^Messages/ }).tap(), () => h1("Messages"));
await step("Open a group chat", () => main.locator('a[href^="/chat/c-g"]').first().tap(), () => page.getByPlaceholder("Write a message").waitFor({ timeout: 15000 }));
await page.getByPlaceholder("Write a message").tap();
await page.keyboard.type("See you all on court tomorrow!", { delay: 50 });
await step("Send the message", () => page.getByRole("button", { name: "Send message" }).tap(), () => main.getByText("Not delivered (demo)").last().waitFor());

// 6. The participant view.
await step("Switch to the player view", () => page.getByRole("navigation", { name: /^Demo view/ }).first().getByRole("link", { name: /^(Participant|Player)$/ }).tap(), () => h1("Hi"));
ok(/waiting for your answer/.test(clean(await main.innerText())), "the player sees sessions waiting for an answer");
const going = main.getByRole("group", { name: /Are you coming/ }).first().getByRole("button", { name: "Going" });
await step("Answer Going with one tap", () => going.tap(), () => page.waitForFunction(() => document.querySelector('[role=group][aria-label^="Are you coming"] button[aria-pressed=true]')));
await step("Back to the coach view", () => page.getByRole("navigation", { name: /^Demo view/ }).first().getByRole("link", { name: "Coach" }).tap(), () => h1("Home"));

// 7. Another sport from Settings.
await step("Open the menu", () => page.getByRole("link", { name: /^Menu:/ }).tap(), () => main.getByRole("link", { name: /^Settings/ }).first().waitFor({ timeout: 15000 }));
await step("Open Settings", () => main.getByRole("link", { name: /^Settings/ }).first().tap(), () => h1("Settings"));
await page.goto(`${BASE}/settings`);
await main.getByRole("heading", { name: "Demo scenario" }).waitFor();
await step(
  "Switch to Football Academy",
  () => main.getByRole("list", { name: "Demo scenarios" }).getByRole("button", { name: /Football Academy/ }).tap(),
  () => page.waitForFunction(() => document.querySelector("[data-active-scenario]")?.getAttribute("data-active-scenario") === "football", null, { timeout: 15000 }),
);
await step("Bottom nav: Home", () => bottomNav.getByRole("link", { name: "Home" }).tap(), () => main.getByText("Northgate Football Academy").first().waitFor({ timeout: 15000 }));
ok(page.errors.length === 0, `no console or page errors ${page.errors.join(" | ")}`);
const width = await page.evaluate(() => document.documentElement.scrollWidth);
ok(width <= 390, `no horizontal scroll (${width}px)`);
await page.close();

// 8. Days later: the coach opens the link from the email again, in a new tab.
const again = await phoneTab();
await step(
  "Open the link again: welcome screen",
  () => again.goto(`${BASE}/`, { waitUntil: "commit" }),
  () => again.locator('article[data-scenario="tennis"]').waitFor({ state: "visible", timeout: 15000 }),
);
await again.waitForLoadState("networkidle");
ok(clean(await again.locator('article[data-scenario="football"]').innerText()).includes("Explored last time"), "the three sports again, with the last one marked");
ok(again.errors.length === 0, `no console or page errors ${again.errors.join(" | ")}`);
await again.close();

console.log("\nStep timings (ms):");
for (const t of timings) console.log(`${String(t.ms).padStart(6)}  ${t.name}`);
const sorted = timings.map((t) => t.ms).sort((a, b) => a - b);
console.log(`median ${sorted[Math.floor(sorted.length / 2)]} ms, slowest ${sorted.at(-1)} ms, limit ${LIMIT_MS} ms`);
await context.close();
await browser.close();
done();

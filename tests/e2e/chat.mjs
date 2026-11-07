import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW);
const { returningVisitor } = await import("./lib.mjs");
const BASE = `http://localhost:${process.env.E2E_PORT ?? 3100}`;
const mainNav = (page) => page.getByRole("navigation", { name: "Main" });
const OUT = process.argv[2];
let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? "PASS" : "FAIL"} ${msg}`); if (!cond) failures++; };

const browser = await chromium.launch();
for (const vp of [{ name: "mobile", width: 390, height: 844 }, { name: "desktop", width: 1280, height: 800 }]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, timezoneId: "Europe/Madrid" });
  await returningVisitor(page);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto(`${BASE}/chat`);
  await page.getByRole("heading", { name: "Group chats" }).waitFor();
  ok(await page.getByRole("heading", { name: "Messages", level: 1 }).isVisible(), `[${vp.name}] chat page loads`);
  const groupLinks = page.locator("section:has(h2:text('Group chats')) a");
  const directLinks = page.locator("section:has(h2:text('One-to-one')) a");
  ok((await groupLinks.count()) === 5 && (await directLinks.count()) === 4, `[${vp.name}] 5 group chats and 4 one-to-one chats listed separately`);
  ok((await groupLinks.first().innerText()).includes("Group chat"), `[${vp.name}] group rows say "Group chat"`);
  ok((await directLinks.first().innerText()).includes("One-to-one"), `[${vp.name}] direct rows say "One-to-one"`);
  ok(await page.getByText("No messages yet").isVisible(), `[${vp.name}] empty conversation shown in list`);
  await page.screenshot({ path: `${OUT}/${vp.name}-1-list.png`, fullPage: true });

  // Open a group chat
  await page.getByRole("link", { name: /U16 Development/ }).click();
  await page.getByRole("log").waitFor();
  ok(page.url().endsWith("/chat/c-g1"), `[${vp.name}] selecting a conversation opens it`);
  const times = await page.locator("ol[role=log] time").evaluateAll((els) => els.map((e) => e.getAttribute("datetime")));
  ok(times.every((t, i) => i === 0 || Date.parse(times[i - 1]) <= Date.parse(t)), `[${vp.name}] messages in chronological order (${times.length})`);
  ok(await page.getByText("Zara Khan").first().isVisible(), `[${vp.name}] sender names shown in group chat`);
  ok(await page.getByRole("link", { name: "View group" }).getAttribute("href") === "/groups/g1", `[${vp.name}] group chat links to its group`);

  const send = page.getByRole("button", { name: "Send message" });
  const input = page.getByLabel("Message to U16 Development");
  ok(await send.isDisabled(), `[${vp.name}] send disabled when empty`);
  await input.fill("     ");
  ok(await send.isDisabled(), `[${vp.name}] send disabled for spaces only`);
  const before = await page.locator("ol[role=log] li").count();
  await input.press("Enter");
  ok((await page.locator("ol[role=log] li").count()) === before, `[${vp.name}] Enter with spaces does not send`);

  await input.fill("  Training starts 10 minutes earlier today.  ");
  await send.click();
  const last = page.locator("ol[role=log] li").last();
  await last.getByText("Training starts 10 minutes earlier today.").waitFor();
  ok((await page.locator("ol[role=log] li").count()) === before + 1, `[${vp.name}] message appears immediately`);
  ok((await last.innerText()).includes("Not delivered (demo)"), `[${vp.name}] new message labelled as not delivered`);
  ok(/\d{2}:\d{2}/.test(await last.locator("time").innerText()), `[${vp.name}] new message shows its time`);
  ok((await input.inputValue()) === "", `[${vp.name}] input cleared after sending`);
  const box = await last.boundingBox(); const formBox = await page.locator("form").boundingBox();
  ok(box.y + box.height <= formBox.y + 1, `[${vp.name}] new message visible above the composer`);
  await page.screenshot({ path: `${OUT}/${vp.name}-2-group.png` });

  // Back to list: last message updated and conversation highlighted
  await page.getByRole("link", { name: /^Back to (Chats|Chat)/ }).click();
  const row = page.getByRole("link", { name: /U16 Development/ });
  await row.waitFor();
  ok((await row.innerText()).includes("You: Training starts 10 minutes earlier today."), `[${vp.name}] last message updated in list`);
  ok((await row.getAttribute("aria-current")) === "true", `[${vp.name}] opened conversation highlighted`);
  ok((await groupLinks.first().innerText()).includes("U16 Development"), `[${vp.name}] updated conversation moves to the top`);
  await page.screenshot({ path: `${OUT}/${vp.name}-3-list-after.png`, fullPage: true });

  // One-to-one chat
  await page.getByRole("link", { name: /Marcus Reid/ }).click();
  await page.getByRole("log").waitFor();
  await page.getByLabel("Message to Marcus Reid").fill("See you on Thursday.");
  await page.getByLabel("Message to Marcus Reid").press("Enter");
  await page.locator("ol[role=log] li").last().getByText("See you on Thursday.").waitFor();
  ok(true, `[${vp.name}] message sent in one-to-one chat (Enter key)`);
  await page.screenshot({ path: `${OUT}/${vp.name}-4-direct.png` });

  // Empty conversation
  await page.goto(`${BASE}/chat`);
  await page.getByRole("link", { name: /Nina Patel/ }).click();
  await page.getByText("No messages yet. Write the first message").waitFor();
  ok(true, `[${vp.name}] empty state in conversation`);
  await page.getByLabel("Message to Nina Patel").fill("Welcome to the group, Nina!");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.getByRole("log").getByText("Welcome to the group, Nina!").waitFor();
  ok(true, `[${vp.name}] first message replaces empty state`);
  await page.screenshot({ path: `${OUT}/${vp.name}-5-empty-sent.png` });

  // Reload: messages typed in this browser are kept, still not delivered (D-060).
  await page.reload();
  await page.getByRole("log").getByText("Welcome to the group, Nina!").waitFor();
  const kept = page.locator("ol[role=log] li").filter({ hasText: "Welcome to the group, Nina!" });
  ok((await kept.innerText()).includes("Not delivered (demo)"), `[${vp.name}] reload keeps the demo message, still labelled not delivered`);
  ok((await page.getByText("No messages yet. Write the first message").count()) === 0, `[${vp.name}] no empty state after the reload`);
  // Each scenario keeps its own chat: the football academy does not see it.
  await page.evaluate(() => localStorage.setItem("coachspace-scenario", "football"));
  await page.goto(`${BASE}/chat`);
  await page.waitForLoadState("networkidle");
  ok(!(await page.locator("main").innerText()).includes("Welcome to the group, Nina!"), `[${vp.name}] another scenario's chat does not show it`);
  await page.evaluate(() => localStorage.setItem("coachspace-scenario", "tennis"));
  // Reset demo data removes the typed messages.
  await page.goto(`${BASE}/settings`);
  page.once("dialog", (d) => d.accept());
  await page.locator("main").getByRole("button", { name: "Reset demo data" }).click();
  await page.locator("main").getByRole("status").filter({ hasText: "restored" }).first().waitFor();
  await page.goto(`${BASE}/chat`);
  await page.getByRole("link", { name: /Nina Patel/ }).click();
  await page.getByText("No messages yet. Write the first message").waitFor();
  ok(true, `[${vp.name}] Reset demo data removes the demo messages`);

  // Bottom nav and other routes still work
  await mainNav(page).getByRole("link", { name: "Groups", exact: true }).click();
  await page.waitForURL(`${BASE}/groups`);
  await mainNav(page).getByRole("link", { name: "Library", exact: true }).click();
  await page.waitForURL(`${BASE}/library`);
  await mainNav(page).getByRole("link", { name: /^Messages(,|$)/ }).click();
  await page.waitForURL(`${BASE}/chat`);
  ok(true, `[${vp.name}] bottom navigation works`);

  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(width <= vp.width, `[${vp.name}] no horizontal scroll (${width}px)`);
  ok(errors.length === 0, `[${vp.name}] no console or page errors ${errors.join(" | ")}`);
  await page.close();
}
await browser.close();
console.log(failures === 0 ? "ALL PASSED" : `${failures} FAILED`);
process.exit(failures ? 1 : 0);

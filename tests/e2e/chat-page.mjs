// Chat layout (D-049): list and conversation side by side from 1024 px, separate pages on phones,
// conversation search, keyboard sending, simulated delivery labels and the participant view.
import { chromium, BASE, ok, viewports, newPage, finish, done } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();

for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  const n = vp.name;
  const wide = vp.width >= 1024;
  const main = page.locator("main");
  const go = async (p) => {
    await page.goto(BASE + p);
    await page.waitForLoadState("networkidle");
  };
  const search = () => main.getByRole("searchbox", { name: "Search conversations" });
  const row = (href) => main.locator(`a[href="${href}"]`);

  // 1. The list page.
  await go("/chat");
  ok((await page.locator("h1").innerText()) === "Chat", `[${n}] Chat title`);
  ok(await row("/chat/c-g1").isVisible(), `[${n}] list visible`);
  ok((await main.getByText("Choose a conversation").isVisible()) === wide, `[${n}] ${wide ? "empty conversation side" : "no empty side on phones"}`);
  await page.screenshot({ path: `${OUT}/chatpage-${n}-list.png`, fullPage: false });

  // 2. Search conversations.
  await search().fill("basket");
  const found = await main.locator("section a").allInnerTexts();
  ok(found.length === 1 && found[0].includes("Senior Basketball"), `[${n}] search by name (${found.length})`);
  await search().fill("zzz");
  ok(await main.getByText("No conversations match").isVisible(), `[${n}] search empty state`);
  await search().fill("");
  ok((await main.locator("section a").count()) === 8, `[${n}] clearing the search shows every conversation`);

  // 3. Open a conversation: side by side on wide screens, its own page on phones.
  await row("/chat/c-g2").click();
  await page.waitForURL(`${BASE}/chat/c-g2`);
  await page.getByRole("log").waitFor();
  ok((await page.locator("h1").innerText()) === "Senior Basketball", `[${n}] conversation title is the page heading`);
  if (wide) {
    const list = await row("/chat/c-g2").boundingBox();
    const log = await page.getByRole("log").boundingBox();
    ok(list && log && list.x + list.width <= log.x, `[${n}] list on the left, conversation on the right`);
    ok((await row("/chat/c-g2").getAttribute("aria-current")) === "true", `[${n}] open conversation marked in the list`);
    const form = await main.locator("form").boundingBox();
    ok(form.y + form.height <= vp.height, `[${n}] composer visible without scrolling the page`);
    await row("/chat/c-p11").click();
    await page.waitForURL(`${BASE}/chat/c-p11`);
    await page.locator("h1", { hasText: "Marcus Reid" }).waitFor();
    ok(await row("/chat/c-g1").isVisible(), `[${n}] list stays while switching conversations`);
  } else {
    ok(!(await row("/chat/c-g1").isVisible()), `[${n}] list hidden while a conversation is open on phones`);
    await main.getByRole("link", { name: /^Back to/ }).click();
    await page.waitForURL(`${BASE}/chat`);
    await row("/chat/c-p11").click();
    await page.waitForURL(`${BASE}/chat/c-p11`);
    await page.locator("h1", { hasText: "Marcus Reid" }).waitFor();
    ok(true, `[${n}] back to the list and into another conversation`);
  }
  await page.screenshot({ path: `${OUT}/chatpage-${n}-conversation.png`, fullPage: false });

  // 4. Keyboard: focus the composer, type, Enter sends; the message is labelled as simulated.
  const input = main.getByLabel("Message to Marcus Reid");
  await input.focus();
  await page.keyboard.type("Keyboard message");
  await page.keyboard.press("Enter");
  const last = page.locator("ol[role=log] li").last();
  await last.getByText("Keyboard message").waitFor();
  ok(clean(await last.innerText()).includes("Not delivered (demo)"), `[${n}] sent message marked as not delivered`);
  ok((await last.locator(".sr-only").first().innerText()).startsWith("You"), `[${n}] screen readers hear who sent it`);
  ok((await main.getByRole("button", { name: "Send message" }).isDisabled()), `[${n}] Send disabled after sending`);
  if (wide) ok(clean(await row("/chat/c-p11").innerText()).includes("You: Keyboard message"), `[${n}] list updates beside the conversation`);
  ok(clean(await main.innerText()).includes("not delivered to anyone"), `[${n}] simulation explained in the conversation`);

  // 5. Participant view: same layout, own conversations only, links stay in /me.
  await go("/me/chat");
  ok((await page.locator("h1").innerText()) === "Chat", `[${n}] participant chat title`);
  ok((await main.locator("section a").count()) === 3 && (await row("/me/chat/c-g1").count()) === 0, `[${n}] participant sees only own conversations`);
  await row("/me/chat/c-g2").click();
  await page.waitForURL(`${BASE}/me/chat/c-g2`);
  await page.getByRole("log").waitFor();
  ok((await main.getByRole("link", { name: "View group" }).getAttribute("href")) === "/me/groups/g2", `[${n}] participant group link stays in the participant view`);
  if (wide) ok(await row("/me/chat/c-p12").isVisible(), `[${n}] participant list beside the conversation`);
  await page.screenshot({ path: `${OUT}/chatpage-${n}-participant.png`, fullPage: false });

  await finish(page, vp);
}
await browser.close();
done();

import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (t) => t.replace(/\s+/g, " ").trim();
for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  const n = vp.name;
  const nav = mainNav(page);
  // The chat link in the main navigation carries the unread total (the old home header icon is gone, D-044).
  const navChat = () => nav.getByRole("link", { name: /^Chat(,|$)/ });
  const unreadStat = async () => { const l = (await navChat().getAttribute("aria-label")) ?? ""; const m = l.match(/(\d+) unread/); return m ? m[1] : "0"; };
  const groupBadge = async (name) => {
    const t = clean(await page.locator("main section:has(h2:text('My groups')) li", { hasText: name }).innerText());
    const m = t.match(/(\d+) unread in the group chat/);
    return m ? Number(m[1]) : 0;
  };
  const rowBadge = async (href) => {
    const t = clean(await page.locator(`a[href="${href}"]`).innerText());
    const m = t.match(/(\d+) unread/);
    return m ? Number(m[1]) : 0;
  };

  // Initial state, derived from the messages
  await page.goto(`${BASE}/`);
  ok((await unreadStat()) === "4", `[${n}] dashboard total starts at 4 (${await unreadStat()})`);
  const start = [await groupBadge("U12 Football"), await groupBadge("Senior Basketball"), await groupBadge("Junior Tennis"), await groupBadge("Morning Pilates")];
  ok(start.join(",") === "1,1,0,0", `[${n}] group badges from group chats (${start.join(",")})`);
  await nav.getByRole("link", { name: "Groups" }).click();
  await page.waitForURL(`${BASE}/groups`);
  const gl = clean(await page.locator("main").innerText());
  ok((gl.match(/unread in the group chat/g) ?? []).length === 2, `[${n}] groups list shows the same two badges`);
  await nav.getByRole("link", { name: /^Chat(,|$)/ }).click();
  await page.waitForURL(`${BASE}/chat`);
  const rows = { g1: await rowBadge("/chat/c-g1"), g2: await rowBadge("/chat/c-g2"), g3: await rowBadge("/chat/c-g3"), g4: await rowBadge("/chat/c-g4"), p11: await rowBadge("/chat/c-p11"), p29: await rowBadge("/chat/c-p29"), p31: await rowBadge("/chat/c-p31"), p12: await rowBadge("/chat/c-p12") };
  ok(JSON.stringify(rows) === JSON.stringify({ g1: 1, g2: 1, g3: 0, g4: 0, p11: 1, p29: 0, p31: 0, p12: 1 }), `[${n}] chat list badges (${JSON.stringify(rows)})`);
  ok((await page.locator('a[href="/chat/c-g1"] p.font-semibold.text-ink').count()) === 1 && (await page.locator('a[href="/chat/c-g3"] p.font-semibold.text-ink').count()) === 0, `[${n}] unread last message shown in bold`);
  await page.screenshot({ path: `${OUT}/unread-${n}-1-list.png`, fullPage: true });

  // Open one conversation: it becomes read everywhere
  await page.locator('a[href="/chat/c-g1"]').click();
  await page.waitForURL(`${BASE}/chat/c-g1`);
  await page.getByRole("log").waitFor();
  await page.getByRole("link", { name: /^Back to (Chats|Chat)/ }).click();
  await page.waitForURL(`${BASE}/chat`);
  ok((await rowBadge("/chat/c-g1")) === 0 && (await rowBadge("/chat/c-g2")) === 1, `[${n}] opened conversation marked as read, others unchanged`);
  await nav.getByRole("link", { name: "Dashboard" }).click();
  await page.waitForURL(`${BASE}/`);
  ok((await unreadStat()) === "3" && (await groupBadge("U12 Football")) === 0, `[${n}] dashboard updates after reading (total 3, U12 badge gone)`);

  // Own messages never count
  await navChat().click();
  await page.waitForURL(`${BASE}/chat`);
  await page.locator('a[href="/chat/c-p11"]').click();
  await page.waitForURL(`${BASE}/chat/c-p11`);
  await page.getByLabel("Message to Marcus Reid").fill("See you on Thursday.");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.locator("ol[role=log] li").last().getByText("See you on Thursday.").waitFor();
  await page.getByRole("link", { name: /^Back to (Chats|Chat)/ }).click();
  await page.waitForURL(`${BASE}/chat`);
  ok((await rowBadge("/chat/c-p11")) === 0, `[${n}] own message does not create an unread badge`);

  // Navigate between conversations
  await page.locator('a[href="/chat/c-g2"]').click();
  await page.waitForURL(`${BASE}/chat/c-g2`);
  await page.getByRole("log").waitFor();
  await page.getByRole("link", { name: "View group" }).click();
  await page.waitForURL(`${BASE}/groups/g2`);
  await nav.getByRole("link", { name: /^Chat(,|$)/ }).click();
  await page.waitForURL(`${BASE}/chat`);
  await page.locator('a[href="/chat/c-p12"]').click();
  await page.waitForURL(`${BASE}/chat/c-p12`);
  await page.getByRole("log").waitFor();
  await nav.getByRole("link", { name: "Dashboard" }).click();
  await page.waitForURL(`${BASE}/`);
  ok((await unreadStat()) === "0", `[${n}] all read after visiting each conversation (${await unreadStat()})`);

  // Participant view: separate read state, coherent with the same messages
  await page.getByRole("navigation", { name: "Demo view" }).getByRole("link", { name: "Participant" }).click();
  await page.waitForURL(`${BASE}/me`);
  await nav.getByRole("link", { name: /^Chat(,|$)/ }).click();
  await page.waitForURL(`${BASE}/me/chat`);
  const me = { g2: await rowBadge("/me/chat/c-g2"), g4: await rowBadge("/me/chat/c-g4"), p12: await rowBadge("/me/chat/c-p12") };
  ok(JSON.stringify(me) === JSON.stringify({ g2: 1, g4: 2, p12: 0 }), `[${n}] participant badges from the explicit initial state (${JSON.stringify(me)})`);
  await page.locator('a[href="/me/chat/c-g4"]').click();
  await page.waitForURL(`${BASE}/me/chat/c-g4`);
  await page.getByRole("log").waitFor();
  await page.getByRole("link", { name: /^Back to (Chats|Chat)/ }).click();
  await page.waitForURL(`${BASE}/me/chat`);
  ok((await rowBadge("/me/chat/c-g4")) === 0 && (await rowBadge("/me/chat/c-g2")) === 1, `[${n}] participant can mark a chat as read`);
  // Jordan writes in the basketball chat: it is his own message, and unread for the coach
  await page.locator('a[href="/me/chat/c-g2"]').click();
  await page.waitForURL(`${BASE}/me/chat/c-g2`);
  await page.getByLabel("Message to Senior Basketball").fill("I'll bring the ball pump.");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.locator("ol[role=log] li").last().getByText("I'll bring the ball pump.").waitFor();
  await page.getByRole("link", { name: /^Back to (Chats|Chat)/ }).click();
  await page.waitForURL(`${BASE}/me/chat`);
  ok((await rowBadge("/me/chat/c-g2")) === 0, `[${n}] Jordan's own message is not unread for him`);
  await page.getByRole("navigation", { name: "Demo view" }).getByRole("link", { name: "Coach" }).click();
  await page.waitForURL(`${BASE}/`);
  ok((await unreadStat()) === "1" && (await groupBadge("Senior Basketball")) === 1, `[${n}] the coach sees Jordan's message as unread`);
  await page.screenshot({ path: `${OUT}/unread-${n}-2-dashboard.png` });

  // Reload: read state and demo messages are in memory only
  await page.reload();
  await navChat().waitFor();
  ok((await unreadStat()) === "4", `[${n}] reload restores the initial demo state (${await unreadStat()})`);
  await finish(page, vp);
}
await browser.close();
done();

import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (t) => t.replace(/\s+/g, " ").trim();
for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  const n = vp.name;
  const nav = mainNav(page);
  // The Messages link in the main navigation carries the unread total (D-071).
  const navChat = () => nav.getByRole("link", { name: /^Messages(,|$)/ });
  const unreadStat = async () => { const l = (await navChat().getAttribute("aria-label")) ?? ""; const m = l.match(/(\d+) unread/); return m ? m[1] : "0"; };
  // Group badges are on the Groups list (D-073 rows; the dashboard's "My groups" card is gone).
  const groupBadge = async (name) => {
    if (!page.url().endsWith("/groups")) {
      await page.goto(`${BASE}/groups`);
      await page.waitForLoadState("networkidle");
    }
    const t = clean(await page.locator("main").getByRole("link", { name: new RegExp(name) }).first().innerText());
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
  ok((await unreadStat()) === "5", `[${n}] agenda total starts at 5 (${await unreadStat()})`);
  const start = [await groupBadge("U16 Development"), await groupBadge("U18 Performance"), await groupBadge("Adult Beginners"), await groupBadge("Adult Improvers"), await groupBadge("Club Competition Team")];
  ok(start.join(",") === "1,0,2,0,1", `[${n}] group badges from group chats (${start.join(",")})`);
  await nav.getByRole("link", { name: "Groups" }).click();
  await page.waitForURL(`${BASE}/groups`);
  const gl = clean(await page.locator("main").innerText());
  ok((gl.match(/unread in the group chat/g) ?? []).length === 3, `[${n}] groups list shows the same three badges`);
  await navChat().click();
  await page.waitForURL(`${BASE}/chat`);
  const rows = { g1: await rowBadge("/chat/c-g1"), g2: await rowBadge("/chat/c-g2"), g3: await rowBadge("/chat/c-g3"), g4: await rowBadge("/chat/c-g4"), g5: await rowBadge("/chat/c-g5"), p27: await rowBadge("/chat/c-p27"), p16: await rowBadge("/chat/c-p16"), p24: await rowBadge("/chat/c-p24"), p12: await rowBadge("/chat/c-p12") };
  ok(JSON.stringify(rows) === JSON.stringify({ g1: 1, g2: 0, g3: 2, g4: 0, g5: 1, p27: 0, p16: 0, p24: 0, p12: 1 }), `[${n}] chat list badges (${JSON.stringify(rows)})`);
  ok((await page.locator('a[href="/chat/c-g1"] p.font-semibold.text-ink').count()) === 1 && (await page.locator('a[href="/chat/c-g2"] p.font-semibold.text-ink').count()) === 0, `[${n}] unread last message shown in bold`);
  await page.screenshot({ path: `${OUT}/unread-${n}-1-list.png`, fullPage: true });

  // Open one conversation: it becomes read everywhere
  await page.locator('a[href="/chat/c-g1"]').click();
  await page.waitForURL(`${BASE}/chat/c-g1`);
  await page.getByRole("log").waitFor();
  await page.getByRole("link", { name: /^Back to (Chats|Chat)/ }).click();
  await page.waitForURL(`${BASE}/chat`);
  ok((await rowBadge("/chat/c-g1")) === 0 && (await rowBadge("/chat/c-g3")) === 2, `[${n}] opened conversation marked as read, others unchanged`);
  await nav.getByRole("link", { name: "Agenda" }).click();
  await page.waitForURL(`${BASE}/`);
  ok((await unreadStat()) === "4" && (await groupBadge("U16 Development")) === 0, `[${n}] total and group badge update after reading (total 4, U16 badge gone)`);

  // Own messages never count
  await navChat().click();
  await page.waitForURL(`${BASE}/chat`);
  await page.locator('a[href="/chat/c-p27"]').click();
  await page.waitForURL(`${BASE}/chat/c-p27`);
  await page.getByLabel("Message to Marcus Reid").fill("See you on Thursday.");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.locator("ol[role=log] li").last().getByText("See you on Thursday.").waitFor();
  await page.getByRole("link", { name: /^Back to (Chats|Chat)/ }).click();
  await page.waitForURL(`${BASE}/chat`);
  ok((await rowBadge("/chat/c-p27")) === 0, `[${n}] own message does not create an unread badge`);

  // Navigate between conversations (the Tennis Coaching has three more unread conversations to visit)
  await page.locator('a[href="/chat/c-g3"]').click();
  await page.waitForURL(`${BASE}/chat/c-g3`);
  await page.getByRole("log").waitFor();
  await page.getByRole("link", { name: "View group" }).click();
  await page.waitForURL(`${BASE}/groups/g3`);
  await navChat().click();
  await page.waitForURL(`${BASE}/chat`);
  await page.locator('a[href="/chat/c-g5"]').click();
  await page.waitForURL(`${BASE}/chat/c-g5`);
  await page.getByRole("log").waitFor();
  await page.getByRole("link", { name: /^Back to (Chats|Chat)/ }).click();
  await page.waitForURL(`${BASE}/chat`);
  await page.locator('a[href="/chat/c-p12"]').click();
  await page.waitForURL(`${BASE}/chat/c-p12`);
  await page.getByRole("log").waitFor();
  await nav.getByRole("link", { name: "Agenda" }).click();
  await page.waitForURL(`${BASE}/`);
  ok((await unreadStat()) === "0", `[${n}] all read after visiting each conversation (${await unreadStat()})`);

  // Participant view: separate read state, coherent with the same messages
  await page.getByRole("navigation", { name: /^Demo view/ }).getByRole("link", { name: /^(Participant|Player)$/ }).click();
  await page.waitForURL(`${BASE}/me`);
  await navChat().click();
  await page.waitForURL(`${BASE}/me/chat`);
  const me = { g4: await rowBadge("/me/chat/c-g4"), g5: await rowBadge("/me/chat/c-g5"), p12: await rowBadge("/me/chat/c-p12") };
  ok(JSON.stringify(me) === JSON.stringify({ g4: 2, g5: 2, p12: 0 }), `[${n}] participant badges from the explicit initial state (${JSON.stringify(me)})`);
  await page.locator('a[href="/me/chat/c-g4"]').click();
  await page.waitForURL(`${BASE}/me/chat/c-g4`);
  await page.getByRole("log").waitFor();
  await page.getByRole("link", { name: /^Back to (Chats|Chat)/ }).click();
  await page.waitForURL(`${BASE}/me/chat`);
  ok((await rowBadge("/me/chat/c-g4")) === 0 && (await rowBadge("/me/chat/c-g5")) === 2, `[${n}] participant can mark a chat as read`);
  // Jordan writes in the team chat: it is his own message, and unread for the coach
  await page.locator('a[href="/me/chat/c-g5"]').click();
  await page.waitForURL(`${BASE}/me/chat/c-g5`);
  await page.getByLabel("Message to Club Competition Team").fill("I'll bring a spare tube of balls.");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.locator("ol[role=log] li").last().getByText("I'll bring a spare tube of balls.").waitFor();
  await page.getByRole("link", { name: /^Back to (Chats|Chat)/ }).click();
  await page.waitForURL(`${BASE}/me/chat`);
  ok((await rowBadge("/me/chat/c-g5")) === 0, `[${n}] Jordan's own message is not unread for him`);
  await page.getByRole("navigation", { name: /^Demo view/ }).getByRole("link", { name: "Coach" }).click();
  await page.waitForURL(`${BASE}/`);
  ok((await unreadStat()) === "1" && (await groupBadge("Club Competition Team")) === 1, `[${n}] the coach sees Jordan's message as unread`);
  await page.screenshot({ path: `${OUT}/unread-${n}-2-dashboard.png` });

  // Reload: read state and demo messages are kept in this browser (D-060).
  await page.reload();
  await navChat().waitFor();
  await page.waitForLoadState("networkidle");
  ok((await unreadStat()) === "1", `[${n}] reload keeps the read state and Jordan's message (${await unreadStat()})`);
  // Reset demo data returns to the fictional starting point.
  await page.goto(`${BASE}/settings?section=demo`);
  page.once("dialog", (d) => d.accept());
  await page.locator("main").getByRole("button", { name: "Reset demo data" }).click();
  await page.locator("main").getByRole("status").filter({ hasText: "restored" }).first().waitFor();
  await page.goto(`${BASE}/`);
  await navChat().waitFor();
  await page.waitForLoadState("networkidle");
  ok((await unreadStat()) === "5", `[${n}] Reset demo data restores the initial unread state (${await unreadStat()})`);
  await finish(page, vp);
}
await browser.close();
done();

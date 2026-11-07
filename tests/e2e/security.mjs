// Security and robustness for a public link (D-069): security headers on pages and files, nothing
// loaded from other sites, no Content Security Policy violations, saved data that is malformed or
// hostile cannot break a page or become a script link, and unknown addresses get a helpful page.
import { chromium, BASE, ok, viewports, newPage, finish, done } from "./lib.mjs";
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();
const vp = viewports[0];

// 1. Headers on a page built in advance, an on-demand session page, a script file and a 404.
const demoHtml = await (await fetch(`${BASE}/demo`)).text();
const script = demoHtml.match(/\/_next\/static\/chunks\/[^"']+\.js/)?.[0];
for (const path of ["/demo", "/", "/calendar/g1-2026-10-14", script, "/no-such-page"]) {
  const res = await fetch(BASE + path, { redirect: "manual" });
  const h = (k) => res.headers.get(k) ?? "";
  ok(h("content-security-policy").includes("frame-ancestors 'none'") && h("content-security-policy").includes("default-src 'self'"), `${path}: Content-Security-Policy`);
  ok(h("x-frame-options") === "DENY" && h("x-content-type-options") === "nosniff", `${path}: X-Frame-Options and nosniff`);
  ok(h("referrer-policy") === "strict-origin-when-cross-origin" && h("permissions-policy").includes("camera=()"), `${path}: Referrer-Policy and Permissions-Policy`);
  ok(!res.headers.has("x-powered-by"), `${path}: no X-Powered-By`);
}

// 2. A full visit: every request stays on this site and the policy blocks nothing.
{
  const page = await newPage(browser, vp, { fresh: true });
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  const hosts = new Set();
  const violations = [];
  page.on("request", (r) => hosts.add(new URL(r.url()).host));
  page.on("console", (m) => /Content Security Policy|Refused to/.test(m.text()) && violations.push(m.text()));
  await page.goto(`${BASE}/`);
  await page.waitForURL(`${BASE}/demo`);
  await page.getByRole("link", { name: "Explore Tennis Coaching" }).click();
  await page.waitForURL(`${BASE}/`);
  for (const path of ["/calendar", "/calendar/g4-2026-10-14", "/chat/c-g1", "/library", "/me", "/me/calendar/g4-2026-10-14", "/settings"]) {
    await page.goto(BASE + path);
    await page.waitForLoadState("networkidle");
  }
  ok([...hosts].every((h) => h === new URL(BASE).host), `only this site is contacted (${[...hosts].join(", ")})`);
  ok(violations.length === 0, `no Content Security Policy violations ${violations.join(" | ")}`);
  await finish(page, vp);
}

// 3. Malformed saved data falls back to the fictional data instead of breaking the page.
{
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  await page.addInitScript(() => {
    if (sessionStorage.getItem("corrupted")) return;
    sessionStorage.setItem("corrupted", "1");
    localStorage.setItem(
      "coachspace-demo-v2:tennis",
      JSON.stringify({ scenario: "tennis", exercises: "oops", assignments: [null, 3], announcements: 5, schedule: { overrides: 3 }, plans: {}, attendance: "x", notes: [{}] }),
    );
    localStorage.setItem("coachspace-demo-v2:tennis:chat", "{not json");
  });
  for (const [path, heading] of [["/", "Home"], ["/library", "Library"], ["/calendar", "Calendar"], ["/announcements", "Messages"], ["/chat", "Messages"]]) {
    await page.goto(BASE + path);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(300);
    const h1 = clean(await page.locator("h1").first().innerText());
    ok(h1 === heading, `malformed saved data: ${path} still shows "${heading}" (${h1})`);
  }
  ok(clean(await page.locator("main").innerText()).length > 0 && (await page.getByText("Something went wrong").count()) === 0, "no error screen was needed");
  await finish(page, vp);
}

// 4. A hostile link saved for an exercise is never rendered as a link.
{
  const page = await newPage(browser, vp);
  await page.addInitScript(() => {
    localStorage.setItem(
      "coachspace-demo-v2:tennis",
      JSON.stringify({
        scenario: "tennis",
        exercises: [{ id: "evil", title: "Evil drill", description: "", discipline: "Tennis", category: "Technique", durationMin: 10, equipment: "", instructions: "", videoUrl: "javascript:alert(document.domain)" }],
        assignments: [],
      }),
    );
  });
  await page.goto(`${BASE}/library/evil`);
  await page.waitForLoadState("networkidle");
  await page.locator("h1").filter({ hasText: "Evil drill" }).waitFor();
  const hrefs = await page.locator("a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  ok(hrefs.every((h) => !/^\s*javascript:/i.test(h)), "no javascript: link on the page");
  ok(await page.getByText("No video link.").isVisible(), "the bad link is shown as text");
  await finish(page, vp);
}

// 5. An unknown address gets a page that leads back into the demo.
{
  const page = await newPage(browser, vp);
  page.on("console", () => {});
  const res = await page.goto(`${BASE}/this-does-not-exist`);
  ok(res.status() === 404, `unknown address answers 404 (${res.status()})`);
  ok(clean(await page.locator("h1").first().innerText()) === "This page does not exist", "a helpful not-found page");
  ok((await page.getByRole("link", { name: "Choose a sport" }).getAttribute("href")) === "/demo", "with a way back to the welcome screen");
  page.errors = page.errors.filter((e) => !e.includes("404"));
  await finish(page, vp);
}

await browser.close();
done();

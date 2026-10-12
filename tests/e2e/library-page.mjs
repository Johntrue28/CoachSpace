// Exercise Library and Session plans (D-048): header, tabs, search, sport and category filters,
// empty state, exercise cards and their actions, exercise detail, the plans tab and navigation.
import { chromium, BASE, ok, viewports, newPage, finish, done, mainNav } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
const clean = (s) => s.replace(/\s+/g, " ").trim();

for (const vp of viewports) {
  const page = await newPage(browser, vp);
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+02:00"));
  const n = vp.name;
  const desktop = vp.width >= 1024;
  const main = page.locator("main");
  const go = async (p) => {
    await page.goto(BASE + p);
    await page.waitForLoadState("networkidle");
  };
  const cards = () => main.locator("article");
  const count = async () => clean(await main.locator("p[aria-live]").innerText());
  const chip = (name) => main.getByRole("group", { name: "Category" }).getByRole("button", { name });

  // 1. Reach the library from the navigation.
  await go("/");
  if (desktop) await mainNav(page).getByRole("link", { name: "Exercise Library" }).click();
  else {
    await mainNav(page).getByRole("link", { name: "More", exact: true }).click();
    await page.waitForURL(`${BASE}/more`);
    await main.getByRole("link", { name: /^Exercise Library/ }).click();
  }
  await page.waitForURL(`${BASE}/library`);
  await page.waitForLoadState("networkidle");
  ok((await page.locator("h1").innerText()) === "Exercise Library", `[${n}] library title`);
  ok((await main.getByRole("link", { name: "Add exercise" }).getAttribute("href")) === "/library/new", `[${n}] Add exercise opens the form`);
  const tabs = main.getByRole("navigation", { name: "Library sections" });
  ok((await tabs.getByRole("link", { name: "Exercises" }).getAttribute("aria-current")) === "page", `[${n}] Exercises tab current`);
  const total = (await cards().count());
  ok(total >= 8 && (await count()) === `${total} exercises`, `[${n}] every exercise listed with a count (${total})`);

  // 2. Exercise card content and actions.
  const warm = cards().filter({ hasText: "Dynamic warm-up routine" });
  const warmText = clean(await warm.innerText());
  ok(warmText.includes("WARM-UP") && warmText.includes("10 min") && warmText.includes("Gets the whole group moving") && warmText.includes("General") && warmText.includes("Video"), `[${n}] card shows category, duration, description, sport, video (${warmText})`);
  ok(/Used in \d group|Not assigned yet/.test(warmText), `[${n}] card shows where it is used`);
  ok((await warm.getByRole("link", { name: "View details: Dynamic warm-up routine" }).getAttribute("href")) === "/library/e1", `[${n}] View details link`);
  ok((await warm.getByRole("link", { name: "Assign Dynamic warm-up routine" }).getAttribute("href")) === "/library/e1/assign", `[${n}] Assign link`);
  await page.screenshot({ path: `${OUT}/libpage-${n}-list.png`, fullPage: true });

  // 3. Search, sport and category filters, and the empty state.
  await main.getByRole("searchbox", { name: "Search exercises" }).fill("rondo");
  ok((await cards().count()) === 1 && (await count()) === "1 exercise", `[${n}] search by title`);
  await main.getByRole("searchbox", { name: "Search exercises" }).fill("cones");
  ok((await cards().count()) >= 1, `[${n}] search by equipment`);
  await main.getByRole("searchbox", { name: "Search exercises" }).fill("");
  await main.getByLabel("Sport").selectOption("Tennis");
  const tennis = await cards().allInnerTexts();
  ok(tennis.length > 0 && tennis.every((t) => t.includes("Tennis")), `[${n}] sport filter`);
  await chip("Strength").click();
  ok((await chip("Strength").getAttribute("aria-pressed")) === "true", `[${n}] category chip pressed`);
  ok(await main.getByText("No exercises match your filters").isVisible(), `[${n}] empty state`);
  await main.getByRole("button", { name: "Clear filters" }).click();
  ok((await cards().count()) === total && (await chip("All categories").getAttribute("aria-pressed")) === "true", `[${n}] Clear filters restores the list`);
  await chip("Technique").focus();
  await page.keyboard.press("Enter");
  const tech = await main.locator("article span.uppercase").allInnerTexts();
  ok(tech.length === 3 && tech.every((t) => t.toLowerCase() === "technique"), `[${n}] category chip works with the keyboard (${tech.join("|")})`);
  await chip("All categories").click();

  // 4. Exercise detail.
  await warm.getByRole("link", { name: "View details: Dynamic warm-up routine" }).click();
  await page.waitForURL(`${BASE}/library/e1`);
  await page.locator("h1").waitFor();
  const detail = clean(await main.innerText());
  ok((await page.locator("h1").innerText()) === "Dynamic warm-up routine" && detail.includes("Base instructions") && detail.includes("Equipment: Cones"), `[${n}] detail shows instructions and equipment`);
  ok((await main.getByRole("link", { name: /Watch on YouTube/ }).getAttribute("target")) === "_blank", `[${n}] video opens on YouTube in a new tab`);
  ok((await main.getByRole("link", { name: "Edit", exact: true }).first().getAttribute("href")) === "/library/e1/edit", `[${n}] Edit from the detail`);
  ok((await main.locator("section:has(h2:text('Used in'))").count()) === 1, `[${n}] where it is used`);
  await page.screenshot({ path: `${OUT}/libpage-${n}-detail.png`, fullPage: true });

  // 5. Session plans tab.
  await go("/library");
  await tabs.getByRole("link", { name: "Session plans" }).click();
  await page.waitForURL(`${BASE}/library/plans`);
  await page.waitForLoadState("networkidle");
  ok((await main.getByRole("navigation", { name: "Library sections" }).getByRole("link", { name: "Session plans" }).getAttribute("aria-current")) === "page", `[${n}] Session plans tab current`);
  const templates = main.getByRole("region", { name: /^Templates/ }).getByRole("link");
  ok((await templates.count()) >= 2, `[${n}] templates listed`);
  ok(/\d+ exercises? · \d+ min/.test(clean(await templates.first().innerText())), `[${n}] template shows exercises and minutes`);
  await templates.first().click();
  await page.waitForURL(/\/library\/plans\/t-/);
  await page.getByLabel("Title").waitFor();
  ok(true, `[${n}] template opens in the editor`);
  await go("/library/plans");
  await main.getByRole("button", { name: "New template" }).click();
  await page.waitForURL(/\/library\/plans\/plan-|\/library\/plans\/tpl-|\/library\/plans\/[^/]+$/);
  await page.getByLabel("Title").waitFor();
  ok((await page.getByLabel("Title").inputValue()) === "New template", `[${n}] New template creates one`);
  await page.screenshot({ path: `${OUT}/libpage-${n}-plans.png`, fullPage: true });

  // Clean up for the next viewport.
  await go("/library");
  page.once("dialog", (d) => d.accept());
  await main.getByRole("button", { name: "Reset demo data" }).click();
  await finish(page, vp);
}
await browser.close();
done();

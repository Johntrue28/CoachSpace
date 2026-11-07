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
  const main = page.locator("main");
  const go = async (p) => {
    await page.goto(BASE + p);
    await page.waitForLoadState("networkidle");
  };
  // One surface of rows since D-073: a row per exercise, linking to its page.
  const cards = () => main.getByRole("list", { name: "Exercises" }).getByRole("listitem");
  const category = async () => (await cards().evaluateAll((els) => els.map((e) => e.querySelectorAll("a span span")[1]?.textContent ?? ""))).map((t) => t.split(" · ")[0]);
  const count = async () => clean(await main.locator("p[aria-live]:not(.sr-only)").innerText());
  const chip = (name) => main.getByRole("group", { name: "Category" }).getByRole("button", { name });

  // 1. Reach the library from the navigation.
  await go("/");
  // One of the four main places since D-071.
  await mainNav(page).getByRole("link", { name: "Library", exact: true }).click();
  await page.waitForURL(`${BASE}/library`);
  await page.waitForLoadState("networkidle");
  ok((await page.locator("h1").innerText()) === "Library", `[${n}] library title`);
  ok((await main.getByRole("link", { name: "Add exercise" }).getAttribute("href")) === "/library/new", `[${n}] Add exercise opens the form`);
  const tabs = main.getByRole("navigation", { name: "Library sections" });
  ok((await tabs.getByRole("link", { name: "Exercises" }).getAttribute("aria-current")) === "page", `[${n}] Exercises tab current`);
  const total = (await cards().count());
  ok(total >= 8 && (await count()) === `${total} exercises`, `[${n}] every exercise listed with a count (${total})`);

  // 2. Exercise row content: one link to the exercise, where it is assigned (D-073).
  const warm = cards().filter({ hasText: "Dynamic court warm-up" });
  const warmText = clean(await warm.innerText());
  ok(warmText.includes("Warm-up · 10 min · General") && !warmText.includes("Video") && !warmText.includes("Watch"), `[${n}] row shows category, duration, sport and no video for a search link (D-057) (${warmText})`);
  ok(/Used in \d group|Not assigned yet/.test(warmText), `[${n}] row shows where it is used`);
  ok((await warm.getByRole("link").count()) === 1 && (await warm.getByRole("link").getAttribute("href")) === "/library/e1", `[${n}] the row opens the exercise`);
  await page.screenshot({ path: `${OUT}/libpage-${n}-list.png`, fullPage: true });

  // 3. Search, sport and category filters, and the empty state.
  await main.getByRole("searchbox", { name: "Search exercises" }).fill("ladder");
  ok((await cards().count()) === 1 && (await count()) === "1 exercise", `[${n}] search by title`);
  await main.getByRole("searchbox", { name: "Search exercises" }).fill("cones");
  ok((await cards().count()) >= 1, `[${n}] search by equipment`);
  await main.getByRole("searchbox", { name: "Search exercises" }).fill("");
  await main.getByLabel("Sport").selectOption("Tennis");
  const tennis = await cards().allInnerTexts();
  ok(tennis.length > 0 && tennis.length < total && tennis.every((t) => !t.includes("General")), `[${n}] sport filter (general exercises left out)`);
  // Only the categories this library uses are offered (Tennis Coaching has no strength exercise).
  ok((await chip("Strength").count()) === 0 && (await chip("Mobility").count()) === 1, `[${n}] category chips follow the library`);
  // Tennis + Mobility: the only mobility exercise is a general one, so nothing matches.
  await chip("Mobility").click();
  ok((await chip("Mobility").getAttribute("aria-pressed")) === "true", `[${n}] category chip pressed`);
  ok(await main.getByText("No exercises match your filters").isVisible(), `[${n}] empty state`);
  await main.getByRole("button", { name: "Clear filters" }).click();
  ok((await cards().count()) === total && (await chip("All categories").getAttribute("aria-pressed")) === "true", `[${n}] Clear filters restores the list`);
  await chip("Technique").focus();
  await page.keyboard.press("Enter");
  const tech = await category();
  ok(tech.length === 4 && tech.every((t) => t === "Technique"), `[${n}] category chip works with the keyboard (${tech.join("|")})`);
  await chip("All categories").click();

  // 4. Exercise detail.
  await warm.getByRole("link").click();
  await page.waitForURL(`${BASE}/library/e1`);
  await page.locator("h1").waitFor();
  const detail = clean(await main.innerText());
  ok((await page.locator("h1").innerText()) === "Dynamic court warm-up" && detail.includes("Base instructions") && detail.includes("Equipment: Cones"), `[${n}] detail shows instructions and equipment`);
  // D-057: the seeded link is a YouTube search, so it is not presented as a video.
  const search = main.getByRole("link", { name: /Find example videos on YouTube \(opens a search\)/ });
  ok((await search.getAttribute("target")) === "_blank" && (await search.getAttribute("href")).startsWith("https://www.youtube.com/results?search_query="), `[${n}] example video search opens on YouTube in a new tab`);
  ok((await main.getByRole("link", { name: /Watch on/ }).count()) === 0 && detail.includes("No specific video is chosen for this exercise yet"), `[${n}] no search link is presented as a video`);
  ok((await main.getByRole("link", { name: "Edit", exact: true }).first().getAttribute("href")) === "/library/e1/edit", `[${n}] Edit from the detail`);
  ok((await main.getByRole("link", { name: /^Assign/ }).first().getAttribute("href")) === "/library/e1/assign", `[${n}] Assign from the detail`);
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

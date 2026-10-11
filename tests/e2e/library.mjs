import { chromium, BASE, ok, viewports, newPage, finish, done } from "./lib.mjs";
const OUT = process.argv[2];
const browser = await chromium.launch();
for (const vp of viewports) {
  const page = await newPage(browser, vp);
  const n = vp.name;
  await page.goto(`${BASE}/library`);
  const headings = await page.locator("main section > h2").allInnerTexts();
  ok(headings[0].startsWith("WARM-UP") || headings[0].toLowerCase().startsWith("warm-up"), `[${n}] library organised by category (${headings.join(", ")})`);
  ok(await page.getByText("Gets the whole group moving and ready to train.").isVisible(), `[${n}] description shown in list`);
  await page.getByLabel("Category").selectOption("Mobility");
  ok((await page.locator("main section").count()) === 1 && (await page.locator("main section li").count()) === 1, `[${n}] category filter`);
  await page.getByLabel("Category").selectOption("All");
  await page.screenshot({ path: `${OUT}/lib-${n}-1-list.png`, fullPage: true });

  // Create with validation
  await page.getByRole("link", { name: "New" }).click();
  await page.waitForURL(`${BASE}/library/new`);
  await page.getByRole("button", { name: "Save to library" }).click();
  ok((await page.locator("main").getByRole("alert").count()) === 3, `[${n}] title, description and instructions required`);
  await page.getByLabel("Title").fill("Passing triangle");
  await page.getByLabel("Description").fill("Quick passing in triangles");
  await page.getByLabel("Base instructions").fill("Three players pass in a triangle, two touches maximum.");
  for (const bad of ["https://example.com/clip.mp4", "https://www.youtube.com/results?search_query=x", "https://vimeo.com/channels"]) {
    await page.getByLabel("Video link (optional)").fill(bad);
    await page.getByRole("button", { name: "Save to library" }).click();
    ok(await page.getByText("Use a YouTube or Vimeo video link").isVisible(), `[${n}] rejects ${bad}`);
  }
  await page.getByLabel("Video link (optional)").fill("https://vimeo.com/76979871");
  await page.getByRole("button", { name: "Save to library" }).click();
  await page.waitForURL(/\/library\/ex-[^/]*$/);
  await page.locator("main").getByRole("status").getByText("Exercise saved").waitFor();
  ok((await page.locator("main").getByRole("status").first().innerText()).includes("Exercise saved"), `[${n}] accessible confirmation after create`);
  ok(await page.getByRole("link", { name: /Watch on Vimeo/ }).isVisible(), `[${n}] Vimeo link shown`);
  const exUrl = page.url().split("?")[0];

  // Edit
  await page.getByRole("link", { name: "Edit", exact: true }).first().click();
  await page.waitForURL(/\/edit$/);
  await page.getByLabel("Title").waitFor();
  ok((await page.getByLabel("Title").inputValue()) === "Passing triangle", `[${n}] edit form prefilled`);
  await page.getByLabel("Title").fill("Passing triangle (2 touches)");
  await page.getByLabel("Category").selectOption("Warm-up");
  await page.getByLabel("Video link (optional)").fill("https://youtu.be/dQw4w9WgXcQ");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForURL(/\/library\/ex-[^/]*$/);
  await page.locator("main").getByRole("status").getByText("Changes saved").waitFor();
  ok((await page.locator("h1").innerText()) === "Passing triangle (2 touches)" && (await page.getByText("Football · Warm-up").count() + await page.getByText("General · Warm-up").count()) > 0, `[${n}] edited title and category saved`);
  ok(await page.getByRole("link", { name: /Watch on YouTube/ }).isVisible(), `[${n}] edited YouTube link`);

  // Assign whole group + selected participants in one go
  await page.getByRole("link", { name: "Assign" }).click();
  await page.waitForURL(/assign$/);
  await page.getByRole("group", { name: "Who in U12 Football" }).getByRole("button", { name: "Whole group" }).click();
  await page.getByRole("group", { name: "Who in Senior Basketball" }).getByRole("button", { name: "Selected" }).click();
  await page.getByRole("button", { name: "Save assignments" }).click();
  ok(await page.locator("main").getByRole("alert").getByText("Select at least one participant in Senior Basketball").isVisible(), `[${n}] selected with nobody is blocked`);
  await page.locator("#group-g2").getByLabel("Jordan Hale").check();
  await page.locator("#group-g2").getByLabel("Marcus Reid").check();
  await page.locator("#group-g1").getByLabel(/Instructions for this group/).fill("U12: one touch only in the last round.");
  ok((await page.getByText("2 groups · 2 selected participants").count()) === 1, `[${n}] live summary of the assignment`);
  await page.screenshot({ path: `${OUT}/lib-${n}-2-assign.png`, fullPage: true });
  await page.getByRole("button", { name: "Save assignments" }).click();
  await page.waitForURL(/\/library\/ex-[^/]*$/);
  await page.locator("main").getByRole("status").getByText("Assignments saved").waitFor();
  const usedIn = (await page.locator("section:has(h2:text('Used in'))").innerText()).replace(/\s+/g, " ");
  ok(usedIn.includes("U12 Football") && usedIn.includes("Whole group") && usedIn.includes("Senior Basketball") && usedIn.includes("Jordan Hale and Marcus Reid"), `[${n}] both assignments saved (${usedIn.slice(0, 120)}…)`);
  ok(usedIn.includes("U12: one touch only in the last round."), `[${n}] group instructions saved`);
  ok((await page.locator("main").getByRole("status").first().innerText()).includes("not been notified"), `[${n}] confirmation says nobody was notified`);

  // Edit one group's assignment, then remove it
  await page.locator("section:has(h2:text('Used in'))").getByRole("link", { name: "Edit" }).nth(1).click();
  await page.waitForURL(/assign\?group=g2/);
  await page.locator("#group-g2").getByLabel("Marcus Reid").waitFor();
  ok(await page.locator("#group-g2").getByLabel("Marcus Reid").isChecked(), `[${n}] assign screen prefilled from saved assignments`);
  await page.locator("#group-g2").getByLabel("Marcus Reid").uncheck();
  await page.getByRole("button", { name: "Save assignments" }).click();
  await page.waitForURL(/\/library\/ex-[^/]*$/);
  await page.locator("main").getByRole("status").getByText("Assignments saved").waitFor();
  ok((await page.locator("section:has(h2:text('Used in'))").innerText()).includes("Jordan Hale") && !(await page.locator("section:has(h2:text('Used in'))").innerText()).includes("Marcus"), `[${n}] edit saved`);
  page.once("dialog", (d) => d.accept());
  await page.locator("section:has(h2:text('Used in'))").getByRole("button", { name: "Remove" }).first().click();
  await page.getByText("Removed from U12 Football.").waitFor();
  ok(true, `[${n}] removal confirmed with a status message`);

  // Group page section
  await page.goto(`${BASE}/groups/g2`);
  const sec = page.locator("section:has(h2:text('Videos & Exercises'))");
  await sec.getByText("Passing triangle (2 touches)").waitFor();
  ok((await sec.innerText()).includes("Jordan Hale"), `[${n}] group shows Videos & Exercises with audience`);
  ok((await sec.getByText("Video").count()) > 0, `[${n}] video badge on group section`);

  // Edit a seed exercise: its existing demo link is kept
  await page.goto(`${BASE}/library/e1/edit`);
  await page.getByLabel("Title").waitFor();
  await page.getByLabel("Duration (min)").fill("12");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForURL(/\/library\/e1$/);
  ok((await page.locator("main").innerText()).includes("12 min"), `[${n}] seed exercise editable without changing its link`);

  // Reload keeps changes, reset restores
  await page.goto(exUrl);
  await page.locator("h1").waitFor();
  ok((await page.locator("h1").innerText()) === "Passing triangle (2 touches)", `[${n}] changes kept after reload (this device)`);
  await page.goto(`${BASE}/library`);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await page.waitForTimeout(200);
  ok(!(await page.getByText("Passing triangle").count()) && (await page.getByText("10 min").count()) > 0, `[${n}] reset restores the library`);
  await page.goto(`${BASE}/library/nope/edit`);
  ok(await page.getByText("This exercise was not found.").isVisible(), `[${n}] unknown exercise handled`);
  await finish(page, vp);
}
await browser.close();
done();

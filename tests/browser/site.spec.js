import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#total")).not.toHaveText("—");
});

test("loads all curated resources", async ({ page }) => {
  await expect(page.locator("#total")).toHaveText("25");
  await expect(page.locator(".card")).toHaveCount(25);
});

test("searches inside resource content", async ({ page }) => {
  await page.locator("#search").fill("boundary");
  await expect(page.locator(".card h3", { hasText: "Generate practical software test cases" })).toBeVisible();
});

test("filters by collection and difficulty", async ({ page }) => {
  await page.locator("#collection").selectOption("Project Builder");
  await expect(page.locator(".card")).not.toHaveCount(0);
  await page.locator("#difficulty").selectOption("advanced");
  await expect(page.locator(".card h3", { hasText: "Build a practical project risk register" })).toBeVisible();
});

test("saves and filters favourites", async ({ page }) => {
  await page.locator('[data-fav="prompt-clear-explainer"]').click();
  await expect(page.locator('[data-fav="prompt-clear-explainer"]')).toHaveAttribute("aria-pressed", "true");
  await page.locator("#favourites").check();
  await expect(page.locator(".card")).toHaveCount(1);
  await expect(page.locator(".card h3")).toContainText("Explain a complex topic clearly");
});

test("personalises a prompt and updates its preview", async ({ page }) => {
  await page.locator('[data-open="prompt-clear-explainer"]').click();
  await page.locator('[data-variable="TOPIC"]').fill("photosynthesis");
  await page.locator('[data-variable="KNOWLEDGE LEVEL"]').fill("middle school");
  await expect(page.locator("#resourceText")).toContainText("photosynthesis");
  await expect(page.locator("#resourceText")).toContainText("middle school");
});

test("opens a resource from a direct link", async ({ page }) => {
  await page.locator('[data-open="prompt-study-planner"]').click();
  await expect(page).toHaveURL(/resource=prompt-study-planner/);
  await page.reload();
  await expect(page.locator("#detail")).toBeVisible();
  await expect(page.locator("#detailTitle")).toHaveText("Build a realistic study plan");
});

test("downloads a personalised resource", async ({ page }) => {
  await page.locator('[data-open="prompt-clear-explainer"]').click();
  await page.locator('[data-variable="TOPIC"]').fill("photosynthesis");
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#download-resource").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("prompt-clear-explainer.txt");
});

test("exports the full catalogue", async ({ page }) => {
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#download-catalogue").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("prompt-vault-catalogue.json");
});

test("keeps the mobile layout within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth
  }));
  expect(widths.page).toBeLessThanOrEqual(widths.viewport);
});

test("supports offline navigation after the service worker is ready", async ({ page, context }) => {
  await page.evaluate(async () => { await navigator.serviceWorker.ready; return true; });
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("h1")).toContainText("Find the right words");
  await context.setOffline(false);
});


test("exports a versioned favourites backup", async ({ page }) => {
  await page.locator('[data-fav="prompt-clear-explainer"]').click();
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#export-favourites").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("prompt-vault-favourites.json");
  const file = await download.path();
  const fs = await import("node:fs/promises");
  const backup = JSON.parse(await fs.readFile(file, "utf8"));
  expect(backup.format).toBe("prompt-vault-favourites");
  expect(backup.version).toBe(1);
  expect(backup.favourites).toContain("prompt-clear-explainer");
});

test("imports valid favourites and ignores unknown resource IDs", async ({ page }) => {
  page.on("dialog", dialog => dialog.accept());
  const chooserPromise = page.waitForEvent("filechooser");
  await page.locator("#import-favourites").click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: "favourites.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({
      format: "prompt-vault-favourites",
      version: 1,
      favourites: ["prompt-clear-explainer", "not-a-real-resource"]
    }))
  });
  await page.locator("#favourites").check();
  await expect(page.locator(".card")).toHaveCount(1);
  await expect(page.locator(".card h3")).toContainText("Explain a complex topic clearly");
});

test("restores a shareable filtered view from the URL", async ({ page }) => {
  await page.goto("/?q=risk&difficulty=advanced");
  await expect(page.locator("#search")).toHaveValue("risk");
  await expect(page.locator("#difficulty")).toHaveValue("advanced");
  await expect(page.locator(".card")).not.toHaveCount(0);
});

test("persists the selected theme after reload", async ({ page }) => {
  const initiallyLight = await page.locator("body").evaluate((body) => body.classList.contains("light"));
  const expectedLight = !initiallyLight;
  await page.locator("#theme").click();
  await expect.poll(() => page.locator("body").evaluate((body) => body.classList.contains("light"))).toBe(expectedLight);
  await page.reload();
  await expect.poll(() => page.locator("body").evaluate((body) => body.classList.contains("light"))).toBe(expectedLight);
});


test("rejects an invalid favourites backup without changing saved items", async ({ page }) => {
  page.on("dialog", dialog => dialog.accept());
  await page.locator('[data-fav="prompt-clear-explainer"]').click();
  const chooserPromise = page.waitForEvent("filechooser");
  await page.locator("#import-favourites").click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ format: "wrong-format", version: 9, favourites: [] }))
  });
  await page.locator("#favourites").check();
  await expect(page.locator(".card")).toHaveCount(1);
  await expect(page.locator(".card h3")).toContainText("Explain a complex topic clearly");
});

test("keeps unfilled placeholders in the personalised preview", async ({ page }) => {
  await page.locator('[data-open="prompt-clear-explainer"]').click();
  await page.locator('[data-variable="TOPIC"]').fill("ecosystems");
  await expect(page.locator("#resourceText")).toContainText("ecosystems");
  await expect(page.locator("#resourceText")).toContainText("[KNOWLEDGE LEVEL]");
});

test("resets every active filter", async ({ page }) => {
  await page.locator("#search").fill("boundary");
  await page.locator("#difficulty").selectOption("advanced");
  await page.locator("#clear-filters").click();
  await expect(page.locator("#search")).toHaveValue("");
  await expect(page.locator("#difficulty")).toHaveValue("all");
  await expect(page.locator(".card")).toHaveCount(25);
});

test("handles unknown direct resource IDs without opening a broken dialog", async ({ page }) => {
  await page.goto("/?resource=not-a-real-resource");
  await expect(page.locator("#detail")).not.toBeVisible();
  await expect(page.locator(".card")).toHaveCount(25);
});

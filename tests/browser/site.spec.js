import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#total")).not.toHaveText("—");
});

test("loads all curated resources", async ({ page }) => {
  await expect(page.locator("#total")).toHaveText("30");
  await expect(page.locator(".card")).toHaveCount(30);
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
  await expect(page.locator("#network-status")).toBeVisible();
  await context.setOffline(false);
  await expect(page.locator("#network-status")).toBeHidden();
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
  await expect(page.locator(".card")).toHaveCount(30);
});

test("handles unknown direct resource IDs without opening a broken dialog", async ({ page }) => {
  await page.goto("/?resource=not-a-real-resource");
  await expect(page.locator("#detail")).not.toBeVisible();
  await expect(page).not.toHaveURL(/resource=not-a-real-resource/);
  await expect(page.locator(".card")).toHaveCount(30);
});

test("keeps the visited guide available when navigating offline", async ({ page, context }) => {
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.goto("/guide.html");
  await expect(page.locator("h1")).toHaveText("Make the library work for you.");
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("h1")).toHaveText("Make the library work for you.");
  await context.setOffline(false);
});

test("opens and closes a resource using only the keyboard", async ({ page }) => {
  const openButton = page.locator('[data-open="prompt-clear-explainer"]');
  await openButton.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#detail")).toBeVisible();
  await expect(page.locator("#copy")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#detail")).not.toBeVisible();
  await expect(page).not.toHaveURL(/resource=prompt-clear-explainer/);
  await expect(openButton).toBeFocused();
});

test("provides a working skip link for keyboard navigation", async ({ page }) => {
  await page.keyboard.press("Tab");
  const skipLink = page.locator(".skip-link");
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("#main-content")).toBeFocused();
});


test("rejects oversized favourites backups without changing saved items", async ({ page }) => {
  await page.locator('[data-fav="prompt-clear-explainer"]').click();
  const chooserPromise = page.waitForEvent("filechooser");
  await page.locator("#import-favourites").click();
  const chooser = await chooserPromise;
  page.once("dialog", dialog => dialog.accept());
  await chooser.setFiles({
    name: "oversized.json",
    mimeType: "application/json",
    buffer: Buffer.alloc(100001, 65)
  });
  await page.locator("#favourites").check();
  await expect(page.locator(".card")).toHaveCount(1);
  await expect(page.locator(".card h3")).toContainText("Explain a complex topic clearly");
});


test("shows the review status on resource cards and details", async ({ page }) => {
  const card = page.locator(".card").first();
  await expect(card.locator(".kind")).toContainText("curated");
  await card.locator('[data-open]').click();
  await expect(page.locator("#detailBody")).toContainText("Review: curated");
});

test("search includes resource review metadata", async ({ page }) => {
  await page.locator("#search").fill("curated");
  await expect(page.locator(".card")).toHaveCount(30);
});


test("restores a selected tag from a shareable URL", async ({ page }) => {
  await page.locator('[data-tag="learning"]').click();
  await expect(page).toHaveURL(/tag=learning/);
  await page.reload();
  await expect(page.locator('[data-tag="learning"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".card")).not.toHaveCount(0);
});

test("filters by resource type and category", async ({ page }) => {
  await page.locator("#type").selectOption("skill");
  await expect(page.locator(".card")).not.toHaveCount(0);
  await expect(page.locator(".card .kind").first()).toContainText("skill");
  await page.locator("#category").selectOption("Productivity");
  await expect(page.locator(".card")).toHaveCount(2);
  await expect(page.locator(".card .kind").first()).toContainText("Productivity");
});

test("shows a helpful empty state when nothing matches", async ({ page }) => {
  await page.locator("#search").fill("no-resource-can-match-this-query-92741");
  await expect(page.locator(".card")).toHaveCount(0);
  await expect(page.locator("#empty")).toBeVisible();
});


test("restores alphabetical sorting from a shareable URL", async ({ page }) => {
  await page.locator("#sort").selectOption("az");
  await expect(page).toHaveURL(/sort=az/);
  await page.reload();
  await expect(page.locator(".card h3").first()).toHaveText("Build a practical project risk register");
});


test("has no serious or critical automated accessibility violations", async ({ page }) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const seriousViolations = results.violations.filter((violation) =>
    violation.impact === "serious" || violation.impact === "critical"
  );
  expect(seriousViolations).toEqual([]);
});

test("guide, privacy, and offline pages have no serious or critical accessibility violations", async ({ page }) => {
  for (const path of ["/guide.html", "/privacy.html", "/offline.html"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const seriousViolations = results.violations.filter((violation) =>
      violation.impact === "serious" || violation.impact === "critical"
    );
    expect(seriousViolations, path).toEqual([]);
  }
});

test("resource detail dialog has no serious or critical accessibility violations", async ({ page }) => {
  await page.locator('[data-open="prompt-clear-explainer"]').click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const seriousViolations = results.violations.filter((violation) =>
    violation.impact === "serious" || violation.impact === "critical"
  );
  expect(seriousViolations).toEqual([]);
});


test("ranks title matches ahead of mentions in resource content", async ({ page }) => {
  await page.locator("#search").fill("study");
  await expect(page.locator(".card h3").first()).toHaveText("Build a realistic study plan");
});


test("matches multi-word searches across different resource fields", async ({ page }) => {
  await page.locator("#search").fill("software boundary");
  await expect(page.locator(".card h3", { hasText: "Generate practical software test cases" })).toBeVisible();
});


test("removes stale favourite IDs from browser storage on load", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("pv-favs", JSON.stringify(["prompt-clear-explainer", "deleted-resource"]));
  });
  await page.reload();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("pv-favs")));
  expect(stored).toEqual(["prompt-clear-explainer"]);
  await page.locator("#favourites").check();
  await expect(page.locator(".card")).toHaveCount(1);
});


test("focuses search with the Ctrl+K keyboard shortcut", async ({ page }) => {
  await page.keyboard.press("Control+k");
  await expect(page.locator("#search")).toBeFocused();
});


test("follows live device color-scheme changes when no theme is saved", async ({ page }) => {
  await page.evaluate(() => localStorage.removeItem("pv-theme"));
  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  await expect(page.locator("body")).toHaveClass(/light/);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("body")).not.toHaveClass(/light/);
});


test("renders personalised user input as text rather than executable HTML", async ({ page }) => {
  await page.locator('[data-open="prompt-clear-explainer"]').click();
  const payload = '<img src=x onerror="alert(1)">';
  await page.locator('[data-variable="TOPIC"]').fill(payload);
  await expect(page.locator("#resourceText")).toContainText(payload);
  await expect(page.locator("#resourceText img")).toHaveCount(0);
});


test("falls back to document copy when clipboard permission is denied", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => { throw new Error("permission denied"); } }
    });
    document.execCommand = () => true;
  });
  await page.reload();
  await page.locator('[data-open="prompt-clear-explainer"]').click();
  await page.locator("#copy").click();
  await expect(page.locator("#copy")).toHaveText("Copied ✓");
});

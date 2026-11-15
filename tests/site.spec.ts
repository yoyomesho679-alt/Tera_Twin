import { test, expect, type Page } from "@playwright/test";

async function runAnalysis(page: Page) {
  await page.getByRole("button", { name: /Analyze selected sites/ }).click();
  try { await page.getByRole("button", { name: /Skip analysis animation/ }).click({ timeout: 5000 }); } catch { /* finished */ }
  await expect(page.locator(".results-content")).toBeVisible({ timeout: 30000 });
}

test("unified shell, explorer, mission lab, language, and report export", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page).toHaveTitle(/Tera Twin/);
  await expect(page.locator(".site-header .brand-mark")).toHaveText("TERA TWIN");
  await expect(page.locator("#twin-finder")).toBeVisible();
  await expect(page.locator("#mission-lab")).toBeVisible();
  await expect(page.locator("#twin-finder canvas")).toHaveCount(2);
  await page.getByRole("button", { name: /Show similar places/ }).click();
  await page.getByRole("button", { name: /Show details/ }).click();
  await page.locator("#mission-lab").scrollIntoViewIfNeeded();
  await runAnalysis(page);
  await expect(page.locator(".comparison-card")).toHaveCount(2);
  await expect(page.locator("#radar-chart polygon.radar-polygon")).toHaveCount(2);
  await expect(page.locator(".gravity-row")).toHaveCount(3);
  await page.getByRole("checkbox", { name: /Atacama Desert/ }).check();
  await runAnalysis(page);
  await expect(page.locator(".comparison-card")).toHaveCount(3);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export mission report/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain("tera-twin-mission-report");
  await page.locator(".header-language").click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("#lab-title")).toContainText("أرضاً للمجهول");
  await page.screenshot({ path: "artifacts/desktop-ar.png", fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".menu-toggle").click();
  await page.locator(".header-language").click();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await page.screenshot({ path: "artifacts/mobile-en.png", fullPage: false });
  expect(errors, errors.join("\n")).toEqual([]);
});

test("candidate sites expose six directions and seven comparison criteria", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const section = page.locator("#candidate-sites");
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator(".direction-chip")).toHaveCount(6);
  await expect(section.locator(".candidate-matrix tbody tr")).toHaveCount(6);
  await expect(section.locator(".criterion-row")).toHaveCount(7);
  await expect(section.locator(".candidate-disclaimer")).toBeVisible();
  await section.locator(".direction-chip").nth(3).click();
  await expect(section.locator(".direction-chip.is-active")).toContainText("Moon");
  await expect(section.locator(".similarity-score")).toBeVisible();
  await expect(section.locator(".candidate-card")).toHaveCount(2);
  await section.locator(".candidate-selectors select").first().selectOption({ index: 1 });
  await section.locator(".candidate-selectors select").nth(1).selectOption({ index: 2 });
  await expect(section.locator(".criterion-row")).toHaveCount(7);
  await page.screenshot({ path: "artifacts/candidates-en.png" });
});

test("layout, RTL, theme toggle, and text-rendering audit", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const enText = await page.locator("body").innerText();
  expect(enText).not.toContain("<br>");
  expect(enText).not.toContain("MARS Mars");
  expect(enText).not.toContain("EARTH Earth");
  await expect(page.locator('.direction-chip[dir="ltr"]')).toHaveCount(6);
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(450);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  // Theme toggle: dark -> light -> dark, persisted in URL + localStorage.
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator(".theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(() => localStorage.getItem("tera-twin-theme"))).toBe("light");
  await page.screenshot({ path: "artifacts/light-hero.png" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.locator(".theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  // Arabic RTL
  await page.locator(".header-language").click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  const arText = await page.locator("body").innerText();
  expect(arText).not.toContain("<br>");
  await expect(page.locator('.direction-chip[dir="ltr"]')).toHaveCount(6);
  expect(errors, errors.join("\n")).toEqual([]);
});

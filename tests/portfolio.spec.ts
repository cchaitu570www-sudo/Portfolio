import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import path from "path";

function portfolioFileUrl() {
  const htmlPath = path.resolve(__dirname, "..", "index.html");
  return `file:///${htmlPath.replace(/\\/g, "/")}`;
}

test.beforeEach(async ({ page }) => {
  await page.goto(portfolioFileUrl());
});

test("format: page metadata and semantic structure are present", async ({ page }) => {
  await expect(page.locator("html")).toHaveAttribute("lang", /en/i);
  await expect(page).toHaveTitle(/portfolio|chaitanya/i);
  await expect(page.locator("meta[name='viewport']")).toHaveCount(1);
  await expect(page.locator("meta[name='description']")).toHaveCount(1);
  await expect(page.locator("main#main-content")).toHaveCount(1);

  const sectionIds = await page.locator("main section[id]").evaluateAll((nodes) =>
    nodes.map((n) => n.getAttribute("id") ?? "")
  );

  const uniqueCount = new Set(sectionIds).size;
  expect(sectionIds.length).toBeGreaterThanOrEqual(5);
  expect(uniqueCount).toBe(sectionIds.length);

  const h1Count = await page.locator("h1").count();
  expect(h1Count).toBe(1);

  await expect(page.locator("img[alt]")).toHaveCount(1);
  await expect(page.locator("nav[aria-label='Primary']")).toHaveCount(1);
});

test("visibility: key hero and section headings are visible and readable in viewport flow", async ({ page }) => {
  await expect(page.locator(".hero h1")).toBeVisible();
  await expect(page.locator(".hero img[alt]")).toBeVisible();

  const keyHeadings = [
    "Professional Experience",
    "Delivery Leadership Across Key Programs",
    "What I Bring to Your Delivery Programs",
    "Academic Background",
    "Tools I Use Daily",
    "Let's Coordinate Your Next Delivery Program",
  ];

  for (const heading of keyHeadings) {
    const locator = page.getByRole("heading", { name: heading });
    await locator.scrollIntoViewIfNeeded();
    await expect(locator).toBeVisible();
  }
});

test("motion: subtle hero graphics animate and respect reduced motion", async ({ page }) => {
  await expect(page.locator(".hero-motion-layer[aria-hidden='true']")).toHaveCount(1);
  await expect(page.locator(".hero-motion-orbit")).toHaveCount(2);
  await expect(page.locator(".hero-motion-pulse")).toHaveCount(1);
  await expect(page.locator(".hero-motion-dot")).toHaveCount(4);
  await expect(page.locator(".hero-flow-card")).toHaveCount(3);
  await expect(page.locator(".hero-flow-line")).toHaveCount(3);

  const orbitAnimationNames = await page.locator(".hero-motion-orbit").evaluateAll((nodes) =>
    nodes.map((node) => getComputedStyle(node).animationName)
  );
  expect(orbitAnimationNames.every((name) => name !== "none")).toBeTruthy();

  const visibleMotionAnimationNames = await page.locator(".hero-flow-card, .hero-flow-line").evaluateAll((nodes) =>
    nodes.map((node) => getComputedStyle(node).animationName)
  );
  expect(visibleMotionAnimationNames.every((name) => name !== "none")).toBeTruthy();

  const revealOrders = await page.locator(".reveal").evaluateAll((nodes) =>
    nodes.slice(0, 6).map((node) => getComputedStyle(node).getPropertyValue("--reveal-order").trim())
  );
  expect(revealOrders).toEqual(["0", "1", "2", "3", "4", "5"]);

  await page.emulateMedia({ reducedMotion: "reduce" });

  const reducedOrbitAnimationNames = await page.locator(".hero-motion-orbit").evaluateAll((nodes) =>
    nodes.map((node) => getComputedStyle(node).animationName)
  );
  expect(reducedOrbitAnimationNames).toEqual(["none", "none"]);

  const reducedVisibleMotionAnimationNames = await page.locator(".hero-flow-card, .hero-flow-line").evaluateAll((nodes) =>
    nodes.map((node) => getComputedStyle(node).animationName)
  );
  expect(reducedVisibleMotionAnimationNames).toEqual(["none", "none", "none", "none", "none", "none"]);
});

test("readability: content sizing and spacing baseline stays healthy", async ({ page }) => {
  const readabilityMetrics = await page.evaluate(() => {
    const bodyStyles = getComputedStyle(document.body);
    const bodyFontSize = parseFloat(bodyStyles.fontSize);
    const bodyLineHeight = parseFloat(bodyStyles.lineHeight);

    const contentNodes = Array.from(document.querySelectorAll("p, li"));
    const firstTen = contentNodes.slice(0, 10);
    const nodeFontSizes = firstTen.map((node) =>
      parseFloat(getComputedStyle(node).fontSize)
    );
    const minNodeFontSize = nodeFontSizes.length ? Math.min(...nodeFontSizes) : bodyFontSize;

    const hasHorizontalOverflow = document.documentElement.scrollWidth > window.innerWidth;
    return { bodyFontSize, bodyLineHeight, minNodeFontSize, hasHorizontalOverflow };
  });

  expect(readabilityMetrics.bodyFontSize).toBeGreaterThanOrEqual(16);
  expect(readabilityMetrics.bodyLineHeight).toBeGreaterThanOrEqual(1.4 * readabilityMetrics.bodyFontSize);
  expect(readabilityMetrics.minNodeFontSize).toBeGreaterThanOrEqual(15);
  expect(readabilityMetrics.hasHorizontalOverflow).toBeFalsy();
});

test("readability/accessibility: no critical or serious axe violations", async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  const severe = results.violations.filter((v) =>
    v.impact === "serious" || v.impact === "critical"
  );
  expect(severe, JSON.stringify(severe, null, 2)).toEqual([]);
});

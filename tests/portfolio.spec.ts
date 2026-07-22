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

test("format: metadata and semantic structure are present", async ({ page }) => {
  await expect(page.locator("html")).toHaveAttribute("lang", /en/i);
  await expect(page).toHaveTitle(/chaitanya|technical project coordinator/i);
  await expect(page.locator("meta[name='viewport']")).toHaveCount(1);
  await expect(page.locator("meta[name='description']")).toHaveCount(1);
  await expect(page.locator("main#main-content")).toHaveCount(1);

  const sectionIds = await page.locator("main section[id]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("id") ?? "")
  );
  expect(sectionIds.length).toBeGreaterThanOrEqual(5);
  expect(new Set(sectionIds).size).toBe(sectionIds.length);
  await expect(page.locator("h1")).toHaveCount(1);
  expect(await page.locator("img[alt]").count()).toBeGreaterThanOrEqual(2);
  await expect(page.locator("nav[aria-label='Primary']")).toHaveCount(1);
  await expect(page.locator("a.skip-link")).toHaveAttribute("href", "#main-content");
});

test("visibility: recruiter-first content is present in viewport flow", async ({ page }) => {
  await expect(page.getByRole("heading", { name: /Technical Project Coordinator/i, level: 1 })).toBeVisible();
  await expect(page.locator(".hero img[alt]:visible").first()).toBeVisible();

  const headings = [
    "Evidence before adjectives.",
    "Delivery across software and industry.",
    "One strong credential. One clear capability map.",
    "Technical roots. Delivery focus.",
    "Need a steady hand on delivery?",
  ];

  for (const heading of headings) {
    const locator = page.getByRole("heading", { name: heading });
    await locator.scrollIntoViewIfNeeded();
    await expect(locator).toBeVisible();
  }
});

test("hero: proof is static, concise, and free of continuous canvas animation", async ({ page }) => {
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".delivery-step")).toHaveCount(3);
  await expect(page.locator(".proof")).toHaveCount(3);
  await expect(page.locator(".hero")).toContainText("Clear plans. Visible risks. Steady go-lives.");

  const animationNames = await page.locator(".hero *").evaluateAll((nodes) =>
    nodes.map((node) => getComputedStyle(node).animationName)
  );
  expect(animationNames.every((name) => name === "none")).toBeTruthy();
});

test("navigation: mobile menu supports toggle, Escape, and focus return", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const button = page.locator(".menu-button");
  await expect(button).toBeVisible();
  await expect(button).toHaveAccessibleName("Open navigation");
  await expect(page.locator("#primary-nav")).toBeHidden();

  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(button).toHaveAccessibleName("Close navigation");
  await expect(page.locator("#primary-nav")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(button).toBeFocused();
  await expect(page.locator("#primary-nav")).toBeHidden();

  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(button).toBeHidden();
  await expect(page.locator("#primary-nav")).toBeVisible();
});

test("readability: content sizing and spacing baseline stays healthy", async ({ page }) => {
  const metrics = await page.evaluate(() => {
    const bodyStyles = getComputedStyle(document.body);
    const bodyFontSize = parseFloat(bodyStyles.fontSize);
    const bodyLineHeight = parseFloat(bodyStyles.lineHeight);
    const contentNodes = Array.from(document.querySelectorAll("p, li"));
    const sample = contentNodes.slice(0, 12);
    const fontSizes = sample.map((node) => parseFloat(getComputedStyle(node).fontSize));
    const minNodeFontSize = fontSizes.length ? Math.min(...fontSizes) : bodyFontSize;
    return {
      bodyFontSize,
      bodyLineHeight,
      minNodeFontSize,
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

  expect(metrics.bodyFontSize).toBeGreaterThanOrEqual(16);
  expect(metrics.bodyLineHeight).toBeGreaterThanOrEqual(1.4 * metrics.bodyFontSize);
  expect(metrics.minNodeFontSize).toBeGreaterThanOrEqual(14);
  expect(metrics.hasHorizontalOverflow).toBeFalsy();
});

test("layout: programs and first-fold hierarchy adapt across breakpoints", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  const desktop = await page.evaluate(() => {
    const rowCounts = (selector: string) => {
      const counts = new Map<number, number>();
      for (const node of Array.from(document.querySelectorAll(selector))) {
        const y = Math.round(node.getBoundingClientRect().top);
        counts.set(y, (counts.get(y) ?? 0) + 1);
      }
      return Array.from(counts.values());
    };
    return {
      programRows: rowCounts(".program-card"),
      educationRows: rowCounts(".education-card"),
      credentialRows: rowCounts(".credential-grid > *"),
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

  expect(desktop.programRows).toEqual([2, 2]);
  expect(desktop.educationRows).toEqual([2]);
  expect(desktop.credentialRows).toEqual([2]);
  expect(desktop.hasHorizontalOverflow).toBeFalsy();

  await page.getByRole("link", { name: "Delivery work", exact: true }).click();
  const anchor = await page.evaluate(() => {
    const header = document.querySelector(".site-header");
    const label = document.querySelector("#programs .section-label");
    if (!header || !label) throw new Error("Missing header or program label");
    return {
      headerBottom: Math.round(header.getBoundingClientRect().bottom),
      labelTop: Math.round(label.getBoundingClientRect().top),
    };
  });
  expect(anchor.labelTop).toBeGreaterThanOrEqual(anchor.headerBottom + 8);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  const mobile = await page.evaluate(() => {
    const rect = (selector: string) => {
      const node = document.querySelector(selector);
      if (!node) throw new Error(`Missing ${selector}`);
      const bounds = node.getBoundingClientRect();
      return { top: Math.round(bounds.top), bottom: Math.round(bounds.bottom), height: Math.round(bounds.height) };
    };
    return {
      header: rect(".site-header"),
      actions: rect(".hero-actions"),
      proof: rect(".proof-grid"),
      programRows: Array.from(document.querySelectorAll(".program-card")).map((node) =>
        Math.round(node.getBoundingClientRect().left)
      ),
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

  expect(mobile.header.height).toBeLessThanOrEqual(68);
  expect(mobile.actions.bottom).toBeLessThan(650);
  expect(mobile.proof.bottom).toBeLessThan(780);
  expect(new Set(mobile.programRows).size).toBe(1);
  expect(mobile.hasHorizontalOverflow).toBeFalsy();
});

test("content: supporting credentials remain available without visual overload", async ({ page }) => {
  const details = page.locator(".training-details");
  await expect(details).not.toHaveAttribute("open", "");
  await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
  await expect(page.locator(".training-item")).toHaveCount(9);
});

test("readability/accessibility: no critical or serious axe violations", async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  const severe = results.violations.filter((violation) =>
    violation.impact === "serious" || violation.impact === "critical"
  );
  expect(severe, JSON.stringify(severe, null, 2)).toEqual([]);
});

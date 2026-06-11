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

test("motion: subtle decorative hero graphics animate without workflow cards", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await expect(page.locator(".hero-motion-layer[aria-hidden='true']")).toHaveCount(1);
  await expect(page.locator(".hero-motion-orbit")).toHaveCount(2);
  await expect(page.locator(".hero-motion-pulse")).toHaveCount(1);
  await expect(page.locator(".hero-motion-dot")).toHaveCount(4);
  await expect(page.locator(".hero-flow-card")).toHaveCount(0);
  await expect(page.locator(".hero-motion-layer")).not.toContainText(/Scope|RAID|Status/);

  const orbitAnimationNames = await page.locator(".hero-motion-orbit").evaluateAll((nodes) =>
    nodes.map((node) => getComputedStyle(node).animationName)
  );
  expect(orbitAnimationNames.every((name) => name !== "none")).toBeTruthy();

  const dotAnimationNames = await page.locator(".hero-motion-dot").evaluateAll((nodes) =>
    nodes.map((node) => getComputedStyle(node).animationName)
  );
  expect(dotAnimationNames.every((name) => name !== "none")).toBeTruthy();

  const revealOrders = await page.locator(".reveal").evaluateAll((nodes) =>
    nodes.slice(0, 6).map((node) => getComputedStyle(node).getPropertyValue("--reveal-order").trim())
  );
  expect(revealOrders).toEqual(["0", "1", "2", "3", "4", "5"]);

  await page.emulateMedia({ reducedMotion: "reduce" });

  const reducedOrbitAnimationNames = await page.locator(".hero-motion-orbit").evaluateAll((nodes) =>
    nodes.map((node) => getComputedStyle(node).animationName)
  );
  expect(reducedOrbitAnimationNames).toEqual(["none", "none"]);

  const reducedDotAnimationNames = await page.locator(".hero-motion-dot").evaluateAll((nodes) =>
    nodes.map((node) => getComputedStyle(node).animationName)
  );
  expect(reducedDotAnimationNames).toEqual(["none", "none", "none", "none"]);
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

test("layout: key sections stay aligned across desktop, tablet, and phone", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });

  const desktopRows = await page.evaluate(() => {
    const rowCounts = (selector: string) => {
      const counts = new Map<number, number>();
      for (const node of Array.from(document.querySelectorAll(selector))) {
        const y = Math.round(node.getBoundingClientRect().top);
        counts.set(y, (counts.get(y) ?? 0) + 1);
      }
      return Array.from(counts.values());
    };

    return {
      projectRows: rowCounts(".project-card"),
      competencyRows: rowCounts(".competency-group"),
      certRows: rowCounts(".cert-card"),
      projectBadgeOverflow: Array.from(document.querySelectorAll(".project-card")).some((card) => {
        const badge = card.querySelector(".status-badge");
        if (!badge) return false;

        const cardRect = card.getBoundingClientRect();
        const badgeRect = badge.getBoundingClientRect();
        return badgeRect.left < cardRect.left - 1 || badgeRect.right > cardRect.right + 1;
      }),
      timelineOffset: Math.round(
        (document.querySelector(".experience-card")?.getBoundingClientRect().left ?? 0) -
          (document.querySelector("#experience .section-header")?.getBoundingClientRect().left ?? 0)
      ),
    };
  });

  expect(desktopRows.projectRows).toEqual([4]);
  expect(desktopRows.competencyRows).toEqual([4]);
  expect(desktopRows.certRows).toEqual([3, 3, 3]);
  expect(desktopRows.projectBadgeOverflow).toBeFalsy();
  expect(desktopRows.timelineOffset).toBeLessThanOrEqual(20);

  await page.locator("nav a[href='#experience']").click();

  const sectionAnchor = await page.evaluate(() => {
    const header = document.querySelector("header");
    const label = document.querySelector("#experience .section-label");
    if (!header || !label) throw new Error("Missing header or experience label");

    return {
      headerBottom: Math.round(header.getBoundingClientRect().bottom),
      labelTop: Math.round(label.getBoundingClientRect().top),
    };
  });

  expect(sectionAnchor.labelTop).toBeGreaterThanOrEqual(sectionAnchor.headerBottom + 8);

  await page.setViewportSize({ width: 820, height: 1180 });

  const tabletHeader = await page.evaluate(() => {
    const rect = (selector: string) => {
      const node = document.querySelector(selector);
      if (!node) throw new Error(`Missing ${selector}`);
      const bounds = node.getBoundingClientRect();
      return {
        top: Math.round(bounds.top),
        bottom: Math.round(bounds.bottom),
        height: Math.round(bounds.height),
      };
    };

    return {
      logo: rect(".logo"),
      nav: rect(".nav"),
      header: rect("header"),
    };
  });

  expect(tabletHeader.nav.top).toBeGreaterThanOrEqual(tabletHeader.logo.bottom);
  expect(tabletHeader.header.height).toBeLessThanOrEqual(130);

  await page.setViewportSize({ width: 390, height: 844 });

  const phoneMetrics = await page.evaluate(() => {
    const rect = (selector: string) => {
      const node = document.querySelector(selector);
      if (!node) throw new Error(`Missing ${selector}`);
      const bounds = node.getBoundingClientRect();
      return {
        left: Math.round(bounds.left),
        right: Math.round(bounds.right),
        height: Math.round(bounds.height),
      };
    };

    return {
      header: rect("header"),
      heroInner: rect(".hero-inner"),
      statsGrid: rect(".stats-grid"),
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

  expect(phoneMetrics.header.height).toBeLessThanOrEqual(132);
  expect(Math.abs(phoneMetrics.heroInner.left - phoneMetrics.statsGrid.left)).toBeLessThanOrEqual(2);
  expect(phoneMetrics.hasHorizontalOverflow).toBeFalsy();
});

test("readability/accessibility: no critical or serious axe violations", async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  const severe = results.violations.filter((v) =>
    v.impact === "serious" || v.impact === "critical"
  );
  expect(severe, JSON.stringify(severe, null, 2)).toEqual([]);
});

# Subtle Motion Graphics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add subtle moving graphics to the portfolio hero and refine existing scroll reveals while preserving accessibility and GitHub Pages simplicity.

**Architecture:** Keep the site static and dependency-free. Add decorative motion markup inside `.hero-visual`, CSS keyframes in `index.html`, and a tiny reveal-order enhancement in the existing script.

**Tech Stack:** Static HTML, CSS keyframes, vanilla JavaScript, Playwright tests.

---

### Task 1: Add Motion Coverage

**Files:**
- Modify: `tests/portfolio.spec.ts`

- [ ] **Step 1: Write the failing test**

Add a Playwright test that loads the portfolio, checks for `.hero-motion-layer`, `.hero-motion-orbit`, `.hero-motion-pulse`, and `.hero-motion-dot`, verifies normal animation is active, verifies reduced-motion disables it, and checks reveal elements receive stagger order values.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/portfolio.spec.ts -g "motion"`

Expected: FAIL because the hero motion elements do not exist yet.

### Task 2: Implement Subtle Hero Motion

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add decorative markup**

Inside `.hero-visual`, add an `aria-hidden="true"` motion layer with pulse, orbit rings, and small dots.

- [ ] **Step 2: Add CSS animation**

Add CSS for slow orbit, pulse, float, and dot movement. Keep all animated elements `pointer-events: none` and behind the portrait/badge.

- [ ] **Step 3: Add reduced-motion overrides**

Extend the existing `prefers-reduced-motion: reduce` block so hero motion elements use `animation: none` and reveal effects become static.

### Task 3: Refine Reveal Staggering

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Update reveal CSS**

Use `--reveal-order` to add capped transition delays and a light blur that resolves when `.in-view` is applied.

- [ ] **Step 2: Update reveal script**

Assign `--reveal-order` to `.reveal` elements before observing them, grouped in small cycles so long pages do not accumulate huge delays.

### Task 4: Keep Scratch Files Out Of Git

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Ignore visual companion files**

Add `.superpowers/` to `.gitignore` so brainstorming mockups stay local.

### Task 5: Verify And Publish

**Files:**
- Test: `tests/portfolio.spec.ts`

- [ ] **Step 1: Run focused motion test**

Run: `npm test -- tests/portfolio.spec.ts -g "motion"`

Expected: PASS.

- [ ] **Step 2: Run full suite**

Run: `npm test`

Expected: 10 tests pass.

- [ ] **Step 3: Browser QA**

Open the local site in the in-app browser, confirm the hero motion appears, check console warnings/errors, and verify a mobile viewport does not clip the hero.

- [ ] **Step 4: Commit and push**

Stage `.gitignore`, `index.html`, `tests/portfolio.spec.ts`, and the docs under `docs/superpowers/`. Commit with `add subtle portfolio motion graphics`, then push `main`.

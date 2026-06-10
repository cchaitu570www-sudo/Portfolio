# Subtle Motion Graphics Design

## Goal

Add restrained movement to the portfolio so the page feels more polished and alive without distracting recruiters or slowing down the static GitHub Pages site.

## Selected Direction

Use option A from the visual companion: subtle executive motion. The motion should feel calm, premium, and professional. It should support the existing hero portrait and delivery message rather than becoming a separate visual gimmick.

## User-Facing Behavior

- The hero portrait gains a slow orbit ring, soft pulse ring, and a few tiny accent dots.
- The portrait and PMP badge can float very slightly to make the hero feel active.
- Existing scroll reveals become a little smoother through blur removal and staggered timing.
- Motion must stop or become effectively static when the visitor has reduced-motion enabled.

## Architecture

This remains a static single-file portfolio. The implementation will use semantic decorative HTML inside the existing `.hero-visual` container, CSS keyframe animations, and the existing IntersectionObserver reveal script. No canvas, animation library, bundler, or runtime dependency is needed.

## Components

- `index.html`: add decorative hero motion markup, CSS animation classes, reduced-motion overrides, and reveal staggering.
- `tests/portfolio.spec.ts`: add coverage that the hero motion exists, animates under normal motion preferences, and is disabled under reduced-motion preferences.
- `.gitignore`: ignore `.superpowers/` so visual-companion scratch files do not appear as publishable site changes.

## Data Flow

The page loads static HTML and CSS. The browser applies keyframe animation to decorative hero elements. On scroll, the existing IntersectionObserver adds `.in-view`; the script also assigns `--reveal-order` custom properties so reveal transitions can stagger without hard-coded per-section classes.

## Accessibility And Safety

The moving graphics are decorative and hidden from assistive technology with `aria-hidden="true"`. `pointer-events: none` prevents them from interfering with links. The `prefers-reduced-motion: reduce` media query disables animation and transition effects.

## Testing

Run the Playwright suite locally with `npm test`. Visual QA should open the local static server and verify the hero motion on desktop and the first mobile viewport, plus console health.

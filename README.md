# Portfolio (GitHub Pages Ready)

This is a static portfolio site ready for GitHub Pages.

## Publish steps

1. Create or use a GitHub repo.
2. Push this folder content to the repo root.
3. In GitHub: `Settings -> Pages`.
4. Under `Build and deployment`, set:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` (or `master`), folder `/ (root)`
5. Save and wait for publish.

## Notes

- All links are static and relative, so they work on GitHub Pages.
- Main entrypoint: `index.html`
- Assets: `assets/`

## Testing

This portfolio includes free automated tests using Playwright.

1. Install dependencies:
   - `npm install`
2. Run all tests:
   - `npm test`
3. Optional interactive run:
   - `npm run test:ui`

The suite validates:
- Format: metadata, semantic structure, headings, and section IDs
- Visibility: key content visibility across desktop and mobile viewports
- Readability: baseline typography spacing/sizing and no horizontal overflow
- Accessibility readability signals: no serious/critical Axe violations

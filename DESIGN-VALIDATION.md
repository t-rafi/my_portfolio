# Design validation

Tested locally on 2026-10-01 using Google Chrome, Lighthouse 13.5.0 and axe through Playwright. The preview uses the GitHub Pages project path `/my_portfolio/`.

## Lighthouse mobile

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS |
|---|---:|---:|---:|---:|---:|---:|
| Home | 99 | 100 | 100 | 100 | 1.957 s | 0 |
| RDLC reporting | 99 | 100 | 100 | 100 | 1.580 s | 0 |
| ERP APIs | 99 | 100 | 100 | 100 | 1.655 s | 0 |

These are the final local mobile lab results with Lighthouse's default simulated throttling. They are not field data or a guarantee for every device/network. Repeat against the published URL after deployment. Raw reports are generated in `.qa/lighthouse/` by `npm run audit`.

## Browser and accessibility checks

`npm test` passed all 32 combinations of four pages, four widths (360/768/1280/1920px), and light/dark themes. The automated axe scans reported zero violations. A separate axe scan of the open visual dialog also passed.

Behavior checks passed for:

- Keyboard skip link, theme persistence and direct PDF download.
- No dialog on page load; project disclosure and navigation.
- Visual preview, zoom, Escape dismissal and focus restoration.
- Mobile navigation hiding while a form input has focus.
- Mocked EmailJS success and blocked-request failure with preserved input.
- Honeypot rejection and an XSS string used as plain input text.
- Visible no-JavaScript content, native disclosures and email fallback.
- Internal links, page fragments, responsive images and horizontal overflow.

Visual reviews covered the home page in mobile dark and desktop light themes. All pages have one h1. Reduced motion disables transition/reveal animation. Automated accessibility checks are complemented by keyboard and focus checks; they do not certify full WCAG conformance.

## Asset budgets

- Runtime JavaScript: 2,649 bytes gzip, below the 60 KB limit.
- Largest profile image variant: 68,756 bytes, below 100 KB.
- Self-hosted subset fonts: Inter 36,904 bytes; Plus Jakarta Sans 22,888 bytes.
- Project visuals provide AVIF/WebP srcsets; the social card is 1200 × 630 PNG.

## Remaining external/content checks

- No email was sent during testing. The owner must verify delivery with the existing EmailJS account/template and configure account-level spam controls.
- The design has not been deployed. GitHub Pages must use `main /docs` for this version.
- Case-study evidence TODOs remain visible until approved examples are supplied.
- The root legacy site and Python consolidation are outside this design change and remain for their agreed phases.

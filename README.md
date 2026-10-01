# Towhidul Islam Rafi's portfolio

A static portfolio for a Junior Software Engineer working with ASP.NET Core and enterprise ERP in Bangladesh. The new site is in `docs/`, with a home page and two sanitized Clarra ERP case studies.

The root site, `src/`, `public/` and the existing Python tools remain while the agreed critical-fix and Python phases are handled separately. `docs/` becomes the published site after the GitHub Pages source is configured.

## Preview

Use Node.js 22 or later:

```sh
npm ci
npm start
```

Open **http://127.0.0.1:4173/my_portfolio/**. The checked-in site needs no build step.

## Design and behavior

- Mobile navigation keeps Profile, Work, Experience and Contact within reach. It hides while a form field has focus.
- Project navigation shows the current project. Native disclosures make details compact on phones and remain usable without JavaScript.
- Report and diagram previews open on request, support zoom and Escape, and return focus when closed. Without JavaScript, the same links open the image.
- The theme follows the system before paint and remembers an explicit selection.
- The CV is a direct PDF download. Contact supports copying the email address and sending through the existing EmailJS account.

The report motif, portrait, typography and asymmetric sections are the main visual elements. Illustrations use dummy data and are labeled. The site uses self-hosted Inter and Plus Jakarta Sans, one blue accent, an 8px spacing scale, and short motion with reduced-motion support. There is no analytics, visitor database, lead gate or browser AI in the new site.

## Edit

| File | Purpose |
|---|---|
| `docs/index.html` | Profile, work, experience, skills and contact |
| `docs/work/rdlc-reporting.html` | Reporting case study |
| `docs/work/erp-api.html` | API and delivery case study |
| `docs/assets/css/tokens.css` | Fonts, themes and design tokens |
| `docs/assets/css/site.css` | Layout and components |
| `docs/assets/js/site.js` | Theme, navigation, previews and EmailJS |
| `source/` | Portrait, illustrative artwork and CV source |

To regenerate responsive images and subset fonts:

```sh
python -m pip install -r scripts/requirements-fonts.txt
npm run assets
```

Font licenses are included beside the WOFF2 files. Fonts contain Latin characters and punctuation; other scripts use browser fallback fonts. Keep the inline theme script and its CSP hash in agreement when changing that bootstrap.

The original Python generators are outside the new publishing path and contain outdated content. Some overwrite the root README and assets. Their consolidation is a separate phase. Python is confirmed as build-time tooling; there is no Python API.

## Contact and privacy

The form uses the existing EmailJS service, template and public key. There is no private API key in browser code. A honeypot, input limits, minimum completion time, retry delay and timeout handle basic abuse and failures. Account-level origin restrictions and CAPTCHA must be configured in EmailJS; browser checks are not a server rate limiter.

A failure preserves the message and displays retry/email options. The email link opens the visitor's mail application; it does not claim to send automatically. The site explains that form data goes through EmailJS to Rafi's inbox.

Tests mock EmailJS and send no real email. The owner still needs to verify delivery using the existing account/template.

## Validate

Keep the preview server running, then run:

```sh
npm test
npm run audit
```

Tests use an installed Google Chrome, Playwright and axe. They cover 360/768/1280/1920px in both themes, keyboard access, dialogs, project disclosures, theme persistence, direct CV access, mocked contact errors/success, no-JavaScript content and local links.

Lighthouse runs against all three content pages with its mobile configuration. Reports are written to `.qa/`. See [DESIGN-VALIDATION.md](DESIGN-VALIDATION.md) for measured results. Set `CHROME_PATH` for Lighthouse if Chrome is installed elsewhere, or `TEST_URL` to check another running preview.

## Deploy to GitHub Pages

1. Commit reviewed `docs/` files and push the intended branch.
2. Open repository **Settings → Pages**.
3. Select **Deploy from a branch → main → /docs**.
4. Check **https://t-rafi.github.io/my_portfolio/** after deployment.
5. Test case-study links, direct CV download, theme selection and a real form submission.

Canonical/OG URLs and the sitemap use that exact project URL. The sitemap has no fragments. The 404 links use `/my_portfolio/`. No custom domain is configured. Update canonical/OG/sitemap/robots paths together if adding one.

The local commands do not deploy the site or execute Supabase migrations. Repeat the audits against the published URL after deployment.

## Content TODOs

- One approved report example: requirement, decisions, difficult issue and verifiable result.
- One approved API/module example: precise contribution, decisions, testing/deployment details and verifiable result.
- Sanitized production screenshots with permission to publish, if available.
- A typical response-time expectation for contact.
- Specific internship outcomes, if you want more than the confirmed role and dates shown.
- The Python build-tool scope for its separate consolidation phase.

Case-study TODOs are visible on the pages. No business impact, uptime or availability claim is inferred.

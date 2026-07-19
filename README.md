# E&E — Estad & Ellingson Plumbing

Marketing website for **Estad & Ellingson Plumbing (E&E)**, a 24/7 plumbing company serving Greater Grand Forks, Eastern North Dakota, and Western Minnesota (the Red River Valley).

The site is a single-page, static marketing site covering services, service area, reviews, a maintenance-plan band, and a "Request Service" form powered by Netlify Forms.

## Tech stack

- **Static HTML/CSS/JS** — a single hand-authored `index.html` with inline styles and vanilla JavaScript. No framework, no build step.
- **Netlify Forms** — the service-request form (`data-netlify="true"`) is detected at deploy time; submissions appear in the Netlify UI.
- **Netlify** — hosting and deploy.
- Google Fonts (Barlow / Barlow Condensed) loaded from the CDN; brand imagery shipped as `.webp`.

## Project structure

- `index.html` — the entire page: markup, styles, structured data (`schema.org/Plumber`), and scripts.
- `lockup.webp` — full brand lockup shown in the masthead.
- `badge.webp` — E&E badge used in the nav, hero, footer, and standards card.
- `netlify.toml` — publishes the repository root with no build command.

## Running locally

It's a static site, so any static server works. With the Netlify CLI (recommended, so form handling is emulated):

```bash
netlify dev --port 8889
```

Then open http://localhost:8889.

## Before going fully public

- The reviews are labeled sample testimonials — swap in real customer reviews.
- Pricing on the maintenance plan ("From $12/mo") is placeholder copy.
- The Minnesota license number in the footer (`#PC-XXXXXX`) is a placeholder.
- Configure form-submission email/webhook notifications in the Netlify UI.

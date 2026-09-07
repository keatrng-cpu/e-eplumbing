# AGENTS.md

Guidance for AI agents working on this project.

## What this is

A single-page static marketing site for E&E (Estad & Ellingson Plumbing). The public site lives in `index.html` — markup, CSS (one `<style>` block), JSON-LD, and vanilla JS. Chat styles/behavior live in `ee-chat.css` and `ee-chat.js`. There is **no build system** for the site itself.

Do not introduce Next.js, a bundler, or an account system unless the owner explicitly asks. Pick It Up E is a booking product. This is a 24/7 plumber. Keep the phone number the primary CTA.

## Architecture

- **`index.html`** — the whole site. Anchors: `#services`, `#why`, `#code`, `#area`, `#how`, `#season`, `#reviews`, `#faq`, `#contact`.
- **CSS** — custom properties in `:root` (kelly green `--kelly:#009A44`, ink, mist). Display font = Barlow Condensed. Body = Barlow.
- **JS** — sticky header, hamburger, scroll reveal, footer year, form guard, season banner.
- **Images** — `lockup.webp` (masthead), `badge.webp` (nav/footer), `favicon.svg`.
- **Do not** restore the old jsDelivr/GitHub raw HTML loader. The site must render without a network fetch of another commit.

## Brand

- Color: kelly green `#009A44`. Keep contrast accessible.
- Voice: Valley-specific, two names on the truck, flat-rate, plumber answers the phone.
- Phone `(218) 779-2553` and email `nateplumb97@icloud.com` appear in many places — update all of them together.

## Netlify

- Form `#serviceForm` (`name="service-request"`) uses `data-netlify="true"` + honeypot.
- Submit guard allows `*.netlify.app`, hostnames containing `eeplumbing` or `estad`, or `body[data-live="true"]`.
- When a custom domain ships, set `data-live="true"` on `<body>` and put absolute URLs in `canonical`, `og:image`, `robots.txt`, and `sitemap.xml`.

## Known placeholders (intentional, pre-launch)

Sample reviews, Home Team Plan price, MN license `#PC-XXXXXX`. Do not treat these as bugs unless asked to finalize them.

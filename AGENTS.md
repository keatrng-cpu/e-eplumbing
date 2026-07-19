# AGENTS.md

Guidance for AI agents working on this project.

## What this is

A single-page static marketing site for E&E (Estad & Ellingson Plumbing). Everything lives in one file, `index.html` — markup, CSS (in a single `<style>` block), JSON-LD structured data, and vanilla JS (in a single `<script>` block at the end of `<body>`). There is **no build system, framework, or package manifest** for the site itself. `node_modules/` in the repo is environment tooling, not a site dependency.

## Architecture

- **`index.html`** — the whole site. Sections are anchored by `id` (`#services`, `#why`, `#code`, `#area`, `#reviews`, `#contact`) and linked from the sticky nav.
- **CSS** — custom properties in `:root` define the brand palette (kelly green `--kelly:#009A44`, ink, mist, etc.) and typography (`--display` = Barlow Condensed, `--body` = Barlow). Layout is CSS grid; the design is responsive with breakpoints at ~920px / ~720px / ~560px. There is no CSS framework.
- **JS** — small progressive-enhancement scripts only: sticky-header shadow, mobile hamburger nav, `IntersectionObserver` scroll reveals, footer year, and a form-submit guard.
- **Images** — `lockup.webp` (masthead) and `badge.webp` (nav/hero/footer). Referenced by relative path.

## Netlify specifics

- **Forms** — the `#serviceForm` (`name="service-request"`) uses `data-netlify="true"` with a `netlify-honeypot="bot-field"` and a hidden `form-name` input. Because the site is static HTML, Netlify's build bot detects it automatically — no skeleton file is needed. If you add or rename a form, re-run the Forms enable script from the netlify-forms skill.
- **Form JS guard** — the submit handler only shows the local "demo mode" message and blocks submission when NOT on a `*.netlify.app` host (or when `body[data-live="true"]`). On the deployed netlify.app domain it performs a native POST that Netlify captures. If a custom domain is added, set `data-live="true"` on `<body>` (or broaden the hostname check) so native submission still fires.
- **`netlify.toml`** — publishes the repo root (`publish = "."`), no build command. Long-cache headers for `.webp`.

## Conventions

- Keep it dependency-free and single-file unless there's a strong reason to split. Match the existing inline-everything style.
- Brand color is kelly green `#009A44`; keep contrast accessible.
- Preserve accessibility affordances already present: skip link, `aria-*` on nav/menu, `role="radiogroup"` on urgency, alt text.
- Phone `(218) 779-2553` and email `nateplumb97@icloud.com` appear in multiple places (top bar, hero, contact cards, footer, JSON-LD, floating call button) — update all of them together.

## Known placeholders (intentional, pre-launch)

Sample reviews, placeholder plan pricing, and the MN license number `#PC-XXXXXX`. Don't treat these as bugs unless asked to finalize them.

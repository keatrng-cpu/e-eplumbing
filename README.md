# E&E — Estad & Ellingson Plumbing

Marketing website and operating system for **Estad & Ellingson Plumbing (E&E)**, a 24/7 plumbing company serving Greater Grand Forks, Eastern North Dakota, and Western Minnesota (the Red River Valley).

**Live repo:** https://github.com/keatrng-cpu/e-eplumbing

---

## What’s in this repo

| File | Purpose |
|------|---------|
| `index.html` | Full marketing site (HTML/CSS/JS, single file) |
| `lockup.webp` / `badge.webp` | Brand assets |
| `netlify.toml` | Netlify deploy config |
| `BUSINESS-PLAN.md` | Full launch plan — legal, ops, marketing, 90-day roadmap |
| `OPERATIONS.md` | Day-to-day service playbook (intake → review) |
| `AGENTS.md` | Guidance for AI agents editing the site |

---

## Tech stack

- **Static HTML/CSS/JS** — no framework, no build step
- **Netlify** — hosting + Forms for the service-request form
- Google Fonts (Barlow / Barlow Condensed)
- `schema.org/Plumber` structured data already embedded

---

## Run locally

```bash
netlify dev --port 8889
```

Open http://localhost:8889

Any static server also works; Netlify CLI is preferred so form handling is emulated.

---

## Deploy & go live

1. Connect this repo to a Netlify site (or `netlify deploy --prod`).
2. Add a custom domain.
3. In Netlify UI → Forms → enable notifications (email + optional webhook/Zapier → SMS).
4. Set `data-live="true"` on `<body>` if using a custom domain so the form posts natively.
5. Replace placeholders (see below).

---

## Before public launch (checklist)

From `BUSINESS-PLAN.md` and the site itself:

- [ ] Real customer reviews (replace the three sample testimonials)
- [ ] Real Home Team Plan pricing (replace “From $12/mo — placeholder pricing”)
- [ ] Minnesota Plumbing Contractor license number (replace `#PC-XXXXXX` in the footer)
- [ ] Netlify form notifications configured
- [ ] Google Business Profile claimed and verified
- [ ] Field service software (Jobber recommended) connected to the phone + form workflow
- [ ] LLC, EIN, insurance, ND Master + MN Contractor credentials in hand

---

## Contact (current)

- Phone: **(218) 779-2553**
- Email: **nateplumb97@icloud.com**

Update these in every location if they change (top bar, hero, contact cards, footer, JSON-LD, floating button) — see `AGENTS.md`.

---

## Next steps

Read **[BUSINESS-PLAN.md](./BUSINESS-PLAN.md)** for the full 90-day launch roadmap, then **[OPERATIONS.md](./OPERATIONS.md)** for the service order flow.

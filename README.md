# E&E — Estad & Ellingson Plumbing

Marketing site and operating system for **Estad & Ellingson Plumbing (E&E)** — 24/7 plumbing for Greater Grand Forks, Eastern North Dakota, and Western Minnesota.

**Repo:** https://github.com/keatrng-cpu/e-eplumbing

---

## What this is (and is not)

This is a **plumbing company site**, not a booking product like Pick It Up E and not a parcel engine like RealEstate Genius.

Parity with those properties means:

| Bar those sites set | How E&E matches it in its own way |
|---|---|
| Self-hosted, no remote HTML loader | Full site lives in `index.html` |
| Distinct local voice | Valley freeze / melt / hard water — not generic plumber stock copy |
| Clear “how a job moves” | Three-step **The call** (answer → flat-rate → fix + photos) |
| Live operational surface | **Valley season board** instead of a haul crew board |
| Trust + SEO | Dual-state license strip, FAQPage schema, favicon, manifest |
| Help without a phone tree | On-site chatbot (`ee-chat.js`) + floating call on mobile |
| Ops depth behind the page | Business plan, pricebook, Jobber, GBP, templates |

It does **not** become a Next.js app with account login. A 2 a.m. burst pipe needs a number that works, not a signup.

---

## Repo map

| File | Purpose |
|------|---------|
| `index.html` | Full marketing site (markup, CSS, JSON-LD, JS) |
| `ee-chat.css` / `ee-chat.js` | Customer help chat |
| `lockup.webp` / `badge.webp` | Brand assets |
| `favicon.svg` / `site.webmanifest` | Icons + install metadata |
| `robots.txt` / `sitemap.xml` | Crawlers — point these at the custom domain when it is live |
| `netlify.toml` | Deploy + security / cache headers |
| `BUSINESS-PLAN.md` | Launch plan + 90-day roadmap |
| `OPERATIONS.md` | Service playbook |
| `PRICEBOOK.md` | Flat-rate structure for FSM software |
| `JOBBER-SETUP.md` | Field service software checklist |
| `GBP-CONTENT.md` | Google Business Profile copy |
| `MARKETING-KIT.md` | Referral, social, partners |
| `TEMPLATES.md` | SMS / call / email |
| `AGENTS.md` | Notes for AI editors |

---

## You own

- Netlify deploy + custom domain + form notifications
- Legal entity, licensing (ND Master / MN Contractor), bond, insurance
- Replacing sample reviews after real jobs
- Pointing `robots.txt` / `sitemap.xml` / `og:image` at the live domain

## Already built

- Self-contained marketing site (no CDN HTML fetch)
- Season board, how-it-works, FAQ, trust bar
- Chat + Netlify form
- Business plan, ops playbook, pricebook, Jobber path, GBP pack

---

## Local dev

```bash
npx netlify dev --port 8889
```

Or any static server from the repo root.

---

## Launch checklist (remaining)

- [ ] Deploy Netlify + form email/SMS notifications
- [ ] Custom domain (eeplumbing.com / estadellingson.com) and set `data-live="true"` on `<body>`
- [ ] Claim Google Business Profile (use `GBP-CONTENT.md`)
- [ ] Jobber trial + import `PRICEBOOK.md`
- [ ] LLC / licenses / bond / insurance
- [ ] Replace sample reviews after first real jobs
- [ ] Lock Home Team Plan price → update site
- [ ] Replace `#PC-XXXXXX` with real MN contractor number
- [ ] Swap `og:image` to an absolute `https://yourdomain/…` URL

---

**Phone:** (218) 779-2553 · **Email:** nateplumb97@icloud.com

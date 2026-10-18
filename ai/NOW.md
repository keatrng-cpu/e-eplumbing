# NOW — e-eplumbing current truth

**As of:** 2026-10-18

> Current truth only; history goes in `ai/DECISIONS.md`.

## Goal
Win plumbing jobs across Eastern ND + Western MN with an order flow detailed enough
that the plumber can load the truck and drive without a diagnostic phone call.

## In flight
- Order flow v2 + analytics + checkout + Supabase calendar are **on branch
  `order-flow-v2`, pushed, not merged and not deployed**. See `ORDER-FLOW-AUDIT.md`.
- Owner-side blockers (not code): fix the `ellingsonplumbing.com` DNS, send one real
  test lead, lawyer call on the name, claim the Google Business Profile.

## Known facts / constraints
- **Canonical points at a parked domain.** `ellingsonplumbing.com` serves a 114-byte
  registrar lander. `index.html` canonical, `og:url`, `sitemap.xml` and `robots.txt`
  all name it. The site is effectively invisible to search until this is fixed.
- **Lead form has never fired.** Netlify form `service-request`
  (`6a5cd388227f640007e8b2be`), created 2026-07-19: `submission_count: 0`.
- **Three live hosts** serve identical content: `plumbingmidwest.netlify.app` (deploy
  target, site id `5b9e7eb6-95e0-4f75-925f-315090b70f9d`),
  `ellingson-plumbing.netlify.app` (`8e218d30-826e-41f2-87ce-ee0792bc5be6`), and the
  parked apex. Team `6a278c07e7f058c5a18f6361`, both `nf_team_pro`, forms enabled.
- **Name collision.** "Ellingson Plumbing, Heating, A/C & Electrical", Alexandria MN,
  4.8★/465 reviews, trading since 1980, rank 1 absolute for the name. This business is
  seeking MN licensing + a $25k MN bond. Repo/ops docs say E&E / Estad & Ellingson.
- `pricebook.js` and `schedule.js` are god nodes — loaded in the browser *and*
  `require()`d by `netlify/functions/book.js`. Changing either moves both the quoted
  price and the server-authoritative one.
- One truck: `DAILY_SLOTS = 4`. Capacity binds before lead volume does.
- `submission-created.js` now texts dispatch, but needs `TWILIO_SID`, `TWILIO_TOKEN`,
  `TWILIO_FROM`, `DISPATCH_SMS` set in Netlify site env. Unset = log only.
- Lighthouse 2026-10-18: desktop 95/92/100/100 (CLS 0.125, over threshold),
  mobile 90/92/100/100 (LCP 2,877 ms, over 2.5 s). `seo: 100` is a false pass.
- PostHog is wired (`analytics.js`, project `671305`, token is a publishable
  `phc_` client key). Autocapture and session recording are deliberately OFF —
  the form holds a name, phone and home address. No events have landed yet
  (`ingested_event: false`); it opts out on localhost and under Do Not Track.
- Home Team Plan checkout is built (`netlify/functions/checkout.js` + two buttons)
  but inert until `STRIPE_SECRET_KEY`, `STRIPE_PRICE_HTP_MONTHLY` and
  `STRIPE_PRICE_HTP_YEARLY` exist; it falls back to "call us". Install deposits
  (30–50%, OPERATIONS.md §5) are still collected by hand.
- Calendar holds: `supabase/001_schedule.sql` is written but **not applied** to any
  Supabase project (e-eplumbing has none). Until `SUPABASE_URL` +
  `SUPABASE_SERVICE_ROLE_KEY` are set, `book.js` uses the racy Blobs fallback.
- All new env keys are listed in `.env.example`; `.env` is gitignored.

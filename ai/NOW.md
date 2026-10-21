# NOW — e-eplumbing current truth

**As of:** 2026-10-21

> Current truth only; history goes in `ai/DECISIONS.md`.

## Goal
Win plumbing jobs across Eastern ND + Western MN with an order flow detailed enough
that the plumber can load the truck and drive without a diagnostic phone call.

## In flight
- `north-fork-production` combines the mascot work and order-flow v2, adds the
  **North Fork Plumbing Co.** identity, and is awaiting a deploy verification.
- Owner-side blockers (not code): connect a verified North Fork domain, configure
  the form notification/SMS destination, apply the atomic calendar migration, and
  complete entity, license, insurance, and Google Business Profile setup.

- `nf-flow-scenes` (draft PR): scenes wired to every pricebook job (inline
  preview on job tap + full scene on thanks.html), shorter booking ticket, booking
  validation fix, service-card contrast fix. Awaiting review.
  - v7 hand-inked scenes: 28 of 34 done (20 earlier + thaw, frozenburst, freezethaw,
    slab, softinstall, softservice, ironro, disposal). Still v6: shower, cartridge,
    diagnose, remodel, commercial, other. Isolated-mascot compositing:
    `assets/kf6/place2.py`. Pipeline: `assets/kf6/` (kf6.py SPEC7, `<scene>build.py` plates,
    `dmask.py` diff-mask compositor, sheet7.py, check7.py).
  - Job picker: one-line plain-language hint under every option (`SCOPE_HINT` in
    app.js). 4 jobs appended at DIAG-01 price: hidden leak, sewer smell, leaking
    tank, low water pressure (38 options now).

## Known facts / constraints
- **Scene mapping** = `EEScenes.OPTION_SCENES` in `scenes.js`, keyed by pricebook
  service + option *index*. Reordering options in `pricebook.js` silently
  remaps scenes — update both together. `scenes.js` loads only after the first
  job tap (homepage: 0 scene requests before interaction); reduced motion
  fetches only the end frame.
- Booking form uses `noValidate`; `validate()` in `app.js` is the only client
  check (the native check used to block on the hidden service `<select>`).
- **Canonical uses the live Netlify host for now.** It must move to the verified North
  Fork domain when one is connected; do not point it at an unowned or parked host.
- **Lead form has never fired.** Netlify form `service-request`
  (`6a5cd388227f640007e8b2be`), created 2026-07-19: `submission_count: 0`.
- **Three live hosts** serve identical content: `plumbingmidwest.netlify.app` (deploy
  target, site id `5b9e7eb6-95e0-4f75-925f-315090b70f9d`),
  `ellingson-plumbing.netlify.app` (`8e218d30-826e-41f2-87ce-ee0792bc5be6`), and the
  parked apex. Team `6a278c07e7f058c5a18f6361`, both `nf_team_pro`, forms enabled.
- **Prior-name collision retired.** The public identity is North Fork Plumbing Co.; do
  not reintroduce Ellingson or E&E in customer-facing material.
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

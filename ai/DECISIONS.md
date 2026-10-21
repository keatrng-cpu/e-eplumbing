# DECISIONS — e-eplumbing (append-only)

Newest last. Never edit or delete entries.

## 2026-10-13 — auto-memory protocol adopted
Agents (Claude Code via hooks, Grok/Codex via AGENTS.md / .grok/GROK.md) read `ai/NOW.md` + a graph slice at task start and update NOW/DECISIONS at task end; graph refresh by post-commit hook and the `graphify-refresh` Action (writes only to the `graph` branch). Why: shared memory without being asked, low token use (graph query, not GRAPH_REPORT).

## 2026-10-18 — Order flow v2: one state object, scope picker, dispatch-grade intake

Rebuilt the booking card after probing the live site and finding the submitted payload
contradicted itself. Three root causes: the urgency radios had no listener and were
overwritten by `renderQuote()`; the service `<select>` was reset from `state.job.service`
on every render, silently discarding the customer's choice; and `optionIndex` was
hardcoded one-per-pill, so the UI could reach 10 of ~25 pricebook line items and priced
every drain call as a sink auger.

Why this shape:
- **One `state`, one `render()`, listeners on every control.** The old code derived
  urgency from the rail and wrote back into controls the customer had touched. The form
  elements are now canonical (the `<select>` and the radios), chips are enhancement, so
  the form still submits something coherent with JS off.
- **Two-tap scope picker** over a longer pill list — reaches every pricebook option and
  keeps the first tap as fast as it was.
- **No job selected at boot.** Previously a cold visitor saw `$824–$1,493` for a burst
  pipe they never picked. The 1.5× after-hours line is now itemised rather than buried
  inside one range.
- **Address, photo, job-specific questions, access details** — the form now asks what
  OPERATIONS.md §1 already scripts for the phone, so the callback confirms instead of
  interrogating. Answers serialize into a hidden `details` field, so Netlify Forms needs
  no schema change.
- **Never auto-select a day.** The old grid picked tomorrow on the customer's behalf and
  `book.js` could silently move it; the move is now surfaced in the UI.
- ZIP is prefill-only and never rejects anyone — a wrong ZIP in a hand-written map would
  turn away a real customer, so an unmatched ZIP is accepted silently.
- Geolocation attaches a Google Maps pin rather than reverse-geocoding; no API key, and
  a tappable pin is more use to a driver than a guessed street. Needed
  `Permissions-Policy: geolocation=(self)` in `netlify.toml`.
- `submission-created.js` sends the full dispatch ticket plus a one-SMS summary; it
  previously only `console.log`ed when `NOTIFY_WEBHOOK` was unset.

Also written: `ORDER-FLOW-AUDIT.md` (findings + build order), `FORGE-ATLAS.md`
(registration payload for Forge Command), `HELIX-ASSESSMENT.md` (Helix desk run).

Not done, and owner-side: the parked `ellingsonplumbing.com` canonical, the zero-submission
form test, and the MN name collision. Those three outrank every code change here.

## 2026-10-18 — Analytics, Home Team Plan checkout, Supabase calendar; run through Forge Command and HELIX

Three builds on top of order flow v2, then the business was loaded into both dashboards.

**PostHog on the booking funnel** (`analytics.js`). The form had sat at zero submissions
for three months with no way to tell "no traffic" from "broken form"; that is now
answerable. Autocapture and session recording are **off by design** — this form holds a
customer's name, phone and home address, autocapture sweeps the DOM around those fields
and recording captures the fields themselves. Every event is fired by hand and carries
shape only (service, price band, step), never a value that identifies a household.
`contact_tapped` instruments `tel:`/`sms:` because for a plumber the phone is probably
the larger half of the funnel and was completely invisible. Opts out on localhost and
under Do Not Track. `window.EETrack` is a no-op if PostHog fails, so the booking card
never depends on it.

**Home Team Plan checkout** (`netlify/functions/checkout.js`, `plan.js`). $29/mo · $279/yr
had been advertised on the live page with an anchor tag where the buy button should be.
It is the only offer the shop has that sells without a truck leaving, so it is the only
recurring line available today. Amounts live in Stripe as price IDs rather than in this
repo, matching the one-source-of-truth rule the pricebook already follows. No Stripe SDK —
one POST to the REST API keeps the single existing dependency. Unconfigured, the buttons
fall back to the phone number: a dead button beside a price is worse than no button.

**Supabase calendar** (`supabase/001_schedule.sql`, `netlify/functions/_schedule-store.js`).
The Blobs implementation read-modify-wrote one `fill` blob, so concurrent submits oversold
a day, and a hold had no identity so an abandoned request consumed a slot forever — a
quarter of a truck on a 4-slot day. `ee_hold_slot()` claims under an advisory lock, is
idempotent on the reference number, and keys every hold to the ref the customer sees, so
cancelling returns the slot. RLS denies anon and authenticated explicitly rather than
relying on the implicit deny; only the service role (server-side, in a Netlify function)
touches it. Backend selection is automatic so nothing breaks before the DB exists.

**Forge Command** already tracked this business — `plumbingmidwest` and `e-eplumbing` are
in `scripts/config.json`, and Atlas, site health, deploys and activity all show rows. No
config change was needed. Two Windows-only build bugs found and written up in
`FORGE-ATLAS.md` (`build_site.py` encoding, `dist` mkdir).

Income tracking is the real gap: `fetch-income.mjs` regenerates `income.json` from three
hardcoded streams, and the `income_manual.json` hook it names is unimplemented, so there is
no way to track a stream without a connector. I added the row, saw it would be overwritten,
and reverted rather than leaving something that looks tracked and is not.

**HELIX** now holds the business on the `trades` template: 11 pricebook lines, the two plan
offers, one roster entry, 1 × 40 tech-hours capacity. Every money figure renders blank,
which is the correct answer — no job has been done. Seeded through the browser store, not
into production Supabase: `005_helix_business_core.sql` says it is not applied by agents,
and a real org row needs a real auth user. Also patched a Windows path bug in helixscales'
`scripts/build.mjs` locally; worth landing in that repo.

Unchanged and still ahead of all of it: the parked canonical, the zero-submission form, and
the Minnesota name collision.

## 2026-10-19 — North Fork production identity

The public name is **North Fork Plumbing Co.**. Customer-facing copy, metadata, manifest,
calendar confirmation, dispatch ticket, and vector marks use that identity. The live Netlify
host is temporarily canonical because no verified North Fork domain has been connected.

`north-fork-production` combines `order-flow-v2` with the deployed mascot branch. The
mascot artwork and motion assets are preserved unchanged. The booking flow now exposes every
pricebook service (including fixtures), clears a date when the job changes, and rejects
requests outside the calendar horizon. Supabase remains the required production backend for
atomic capacity holds; no credentials or database were provisioned here.

## 2026-10-21 — Scenes wired to jobs; shorter ticket

After order-flow v2, thanks.html played no scene and `app.js`'s `?scene=` preview
referenced removed `JOBS`/`showConfirm`. Scenes now resolve from service + option
index (1:1 with the 34 scene keys, `other` as fallback) and play inline on job tap
and on the thanks page. Ticket shortened by hiding the duplicate urgency radios
(the rail sets urgency; "This week" and "Planning ahead" price the same), moving
follow-up questions and email/text preferences into collapsed optional sections,
and showing 6 day chips instead of 10. No prices, pricebook/schedule shape,
book.js logic, or capacity touched.

## 2026-10-21 — Job hints and diagnostic-priced additions

Customers often don't know the trade name for what's wrong, so each option now has a
one-line hint ("Several drains slow, gurgling, or backing up" = main line). Four common
Grand Forks needs were missing; they're appended (never reordered, since scenes map by
option index) and use only the existing DIAG-01 diagnostic price, because finding the
cause comes before any repair: hidden leak in a wall/ceiling/water line -> `diagnose`,
sewer smell -> `cambranch`, leaking water-heater tank -> `nohot`, low water pressure ->
`diagnose`. Running toilet, hose bib/spigot, gas line, toilet reset, PRV, sewer
ejector, and others stay recommendations: they'd need new price lines (Competitor Watch
suggestions are not book prices) and gas work needs a licensing decision.
Battery and check-valve scenes were redrawn in v7; the other 16 v6 scenes remain.

## 2026-10-21 — Multi-page site (nf-pages)

Mobile felt like endless scrolling (homepage was 15,170px tall at 390px). Split into six
static pages generated by `tools/build_pages.py` so header, footer, tab bar and head are
identical everywhere (no framework). Home is a short landing (no app.js: 0 scene requests
by construction). Booking moved intact to `book.html` (same form name/fields, same
book/checkout/submission functions, same thanks page); `app.js` gained only a `?job=&opt=`
preselect. Mobile nav is a fixed bottom tab bar (Home/Services/Book/Plans/More); the
floating "Call Now" pill is hidden on mobile because the sticky header now carries a Call
pill on every page (never covered, never under the tab bar). Reviews page stays honest: no
reviews exist yet, no Google review link exists in the repo, so none is linked. Plans page
uses only the locked Home Team tier from PRICEBOOK.md; visit timing is shown as "typical,
scheduled with you" and cancellation terms are deferred to the owner. No license numbers
shown (none issued in repo). Shipped as a PR + deploy preview, not merged.

## 2026-10-21 — Final polish (nf-final-polish)

Audit of the live multi-page site. Added a next-steps band on every page (Book / Home Team Plan / Save our number), a downloadable contact card (`north-fork-plumbing.vcf`), a monthly Valley season tip on Home (linked to the plan schedule), plan nudges in Services panels only where published plan benefits apply, an honest review ask (email; no Google link until the owner provides one), thanks-page save-number + plan upsell (welcome note on `?plan=` returns) and page links (it was a dead end). Tap targets raised to 44px. The mobile floating chat bubble covered in-page Call buttons, so chat moved into the tab bar More sheet. No prices, book.js or capacity changes.

## 2026-10-21 — Scenes loop (nf-loop)

`scenes.js` playKF loops by default (opt.loop:false plays once): hold the end frame 1.5s, crossfade (260ms) from the end frame back to frame 1. The rAF loop pauses while the host is offscreen (IntersectionObserver) or the tab is hidden, and resumes on the same timeline. cancel()/next play() tears down rAF, observer, listener and fade layer. Reduced motion: static end frame, no loop. The play() promise still resolves after the first pass.

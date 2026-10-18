# Order Flow Audit — Ellingson Plumbing

**Date:** 2026-10-18 · **Audited:** repo HEAD + live `plumbingmidwest.netlify.app`
**Method:** full source read, live DOM/state probing in a real browser, Netlify API, Google Business Profile lookup.

---

## How the flow actually works today

```
Visitor lands (mobile: ~1,500px of chrome before the form)
  → app.js boots: pills, town <select>, and the quote are all JS-rendered
  → state = { job: JOBS[0] "burst", rail: "now" }   ← pre-selected, not chosen
  → renderQuote() → pricebook.estimate("Emergency repair", 1, "Emergency — now")
  → after-hours 1.5× applies → visitor sees "$824–$1,493" before touching anything
  → taps a pill → pill hardcodes {service, optionIndex} → price re-renders
  → fills name / phone / town / service / urgency / message  (NO ADDRESS)
  → submit → POST /.netlify/functions/book  (server re-prices, reserves calendar slots)
           → POST / urlencoded  (Netlify Forms "service-request")
           → submission-created.js → optional NOTIFY_WEBHOOK
  → redirect /thanks.html (generic, echoes nothing back)
```

**Shared-logic design is good.** `pricebook.js` and `schedule.js` are isomorphic — the browser
and `netlify/functions/book.js` import the same file, so a hand-edited request can't change the
number the shop is bound to. Keep that. Everything below is built on top of it.

---

## Verified defects (probed live, not inferred)

Executed against `https://plumbingmidwest.netlify.app`:

| Step | Result |
|---|---|
| Page load, nothing touched | `estimate = $824–$1,493`, `service = Emergency repair`, `urgency = Emergency — now` |
| Click "Planning ahead" radio | estimate **unchanged** at `$824–$1,493` |
| Change Service dropdown → "Water heater" | estimate **unchanged** |
| Tap "Pick a day" | `service` **silently reverts to "Emergency repair"** |
| Resulting form payload | `service: Emergency repair`, `urgency: Planning ahead`, `optionIndex: 1`, `day: 2026-10-19`, `estimate: $549–$995`, **no address** |

Three root causes:

1. **The urgency radios have no listener.** `app.js` derives urgency from `rail + job.emergency`
   via `urgencyValue()` (app.js:65) and `renderQuote()` overwrites whatever the customer checked
   (app.js:96–98). The radio group is decorative; worse, it submits a value the price was not
   calculated from.
2. **The Service `<select>` fights the pills.** `renderQuote()` does `serviceInput.value =
   state.job.service` (app.js:83). Any later rail tap reverts the customer's explicit choice.
3. **`optionIndex` is hardcoded per pill** (app.js:4–15). The pricebook holds ~25 priced line
   items; the UI can reach exactly 10 of them, one per pill. "CLOG" always prices as
   *Clear a sink/tub/toilet* `$179–$289` — the customer can never say "main line" (`$325–$549`)
   or "hydro jet" (`$549–$995`). "HEATER" always prices as a full tank replacement.

**Net effect:** the shop receives orders that contradict themselves, with a price derived from a
different job than the one the customer picked, and no address to drive to.

---

## The 10 improvements

Ordered by impact per hour of work.

### 1. Make the form submit what the customer actually chose
Fix the three defects above. One state object, one render, listeners on every control.

- Add `change` listeners to the urgency radios and the service `<select>` that write into `state`.
- Make `urgencyValue()` read `state.urgency` (set by the radio) and have the rail buttons *set* the
  radio rather than override it.
- Stop writing `serviceInput.value` from `renderQuote()`; let the pill set it once, on tap.
- Re-price on every state change, from one code path.

*Why first:* every other improvement is worthless if the payload lies. ~2h.

### 2. Collect the service address
There is no address field anywhere in the form. The plumber cannot dispatch from
`name / phone / town`.

- `Street address` + `ZIP` + optional `Unit/apt`.
- Replace the 14-town `<select>` with **ZIP-driven service-area matching** — a ZIP covers the
  25+ towns in the schema markup, and "Other — still call" stops being a dead end.
- One-tap **"Use my current location"** (`navigator.geolocation` → reverse geocode). Note
  `netlify.toml` currently sends `Permissions-Policy: geolocation=()`, which blocks this — that
  header needs `geolocation=(self)`.
- Validate the ZIP is in-area before submit and say so: *"Grafton is 42 min out — we'll confirm
  the window by phone."*

### 3. Two-tap job picker that reaches the real pricebook
Pill → specific line item. Today's pills already know the service; add a second row of chips for
`SERVICES[service].options` so the customer picks the actual scope.

```
DRAIN  →  [ Sink / tub / toilet ]  [ Main line ]  [ Hydro jet ]  [ Cleanout install ]
             $179–289                $325–549       $549–995        $395–745
```

This simultaneously makes the flow *more detailed*, *more optioned*, and *more accurate* — and it
costs one extra tap. Options already carry `custom: true` / `diagnostic: true`, so the "we'll quote
it on the call" path is already handled.

### 4. Let them send a photo
`<input type="file" name="photo" multiple accept="image/*" capture="environment">`. Netlify Forms
stores uploads natively — no backend work.

One photo of the leaking joint, the water-heater data plate, or the sump pit replaces an entire
diagnostic phone call and lets the plumber load the right part before leaving the shop. For a
trade business this is the single highest-value field on the form.

### 5. Job-specific follow-up questions
3–5 conditional questions per job, shown only after the job is picked. This is the thing that
makes "the plumber knows exactly what the order is" literally true.

| Job | Ask |
|---|---|
| Water heater | Gas or electric · tank size · approx. age · brand · leaking from top/bottom/none |
| Drain / sewer | Which fixture · how many fixtures affected · is sewage backing up · septic or city |
| Sump | Pump age · battery backup present · is water rising right now · last time it ran |
| Frozen pipe | Where (crawlspace/exterior wall/basement) · is any fixture still flowing · has it burst |
| Burst / leak | Is the main shut off · where is the water · how long has it been running |

Render from a small config object keyed by service so it stays one place to edit. Append the
answers into the `message` field so Netlify Forms needs no schema change.

### 6. Access and arrival details
`OPERATIONS.md` §1 already lists these as the phone script. The form should capture the same
things so the callback is a confirmation, not an interrogation:

- Property type (house / townhome / apartment / rental / commercial)
- Owner or tenant (who approves the work — this decides whether a quote can be accepted on site)
- Best contact method + **explicit consent to text** (TCPA — you are texting review links and
  on-my-way messages per OPERATIONS.md §6)
- Email (for the photo-documented invoice the Ellingson Standard promises)
- Access notes: gate code, dogs, parking, basement entry, who will be home
- "Do you know where your main shut-off is?" — doubles as safety triage and as a Home Team Plan
  conversation opener

### 7. Arrival windows, not just dates
`schedule.js` already models `DAILY_SLOTS = 4` and per-job `slots`. Surface that as a window:

- **AM (8–12) / PM (12–4) / First available** chips under the chosen day.
- For `rail: "now"`, replace the static *"Target: 60–120 minutes"* with a real commitment derived
  from current board load — or state it as a promise the shop will confirm by text.
- Today the day grid **auto-selects tomorrow** without the customer choosing (app.js:164–173), and
  the submitted `day` may be silently changed by `book.js` (`dayChanged`) with no UI telling them.
  Show the change: *"Mon 19th was full — we've held Tue 20th."*

### 8. Stop leading with $1,493
A cold visitor currently sees `BURST · $824–$1,493` before interacting. That is the worst possible
first impression for a homeowner with a slow drain.

- Boot with **no job selected** and a neutral prompt ("Tap what's going on — the number appears
  here"), or default to the seasonal most-common job (`#season` logic already computes the season).
- Reveal the price after the job is specified (improvement 3), so the first number they see is
  *their* number.
- **Itemise the multiplier.** Show `Shop book $549–$995` and `After-hours (Sat/Sun/nights) ×1.5`
  as separate lines. Burying 1.5× inside one range reads as a high price; showing it reads as an
  honest one — and it matches the "flat-rate before wrenches" promise the page makes four times.

### 9. Make it work without JS, and make it accessible
The form is currently 100% JS-dependent and has real a11y defects:

- The town `<select>` is `required` but populated by `app.js`. If the script fails, the select is
  **empty and the form cannot be submitted at all.** Server-render (or inline) the towns and pills
  as real HTML; let JS enhance.
- `<label>How urgent is it?</label>` (index.html:136) has no `for` — invalid, unannounced. Use a
  `<fieldset><legend>`.
- Validation errors are written into the quote box (app.js:321), far from the field, with no focus
  move, no `aria-invalid`, no `role="alert"`. Put the error next to the input and focus it.
- Rail buttons have no `aria-pressed`; day chips are not a labelled radiogroup.
- Add `@media (prefers-reduced-motion: reduce)` to stop the dispatch ticker.
- Mobile: topbar + season bar + ticker + masthead + sticky header push the form far below the
  fold, and the floating "Call Now" button overlaps the chat button. Collapse the chrome and put
  a "Get a price" anchor in the first viewport.

### 10. Close the loop after submit
`thanks.html` is static and echoes nothing. The customer has no proof of what they ordered.

- Give each request a **reference number** and show the full order back: job, scope, estimate,
  address, window, access notes.
- "Text a photo to (218) 779-2553" with the reference — catches anyone who skipped improvement 4.
- Add-to-calendar link for scheduled days.
- **SMS the shop, not just email.** `submission-created.js` currently only posts to an optional
  `NOTIFY_WEBHOOK`; if that env var is unset it does nothing but `console.log`. A burst pipe at
  2am needs a phone to buzz. Twilio or the Netlify→Zapier→SMS path.
- Auto-text the customer: *"Got it — Nate will call within 15 minutes."* OPERATIONS.md promises
  <15 min; the form should start that clock visibly.

---

## Three findings outside the order flow (higher business impact than any of the 10)

### A. The canonical tag points at a parked domain — the site is invisible to Google

```
$ curl https://ellingsonplumbing.com/
<!DOCTYPE html><html><head><script>window.onload=function(){
  window.location.href="/lander"}</script></head></html>     ← 114 bytes, registrar lander
```

Every copy of the site declares `<link rel="canonical" href="https://ellingsonplumbing.com/">`
(index.html:18), plus matching `og:url`, `sitemap.xml`, and the `Sitemap:` line in `robots.txt`.
All four tell Google the authoritative version of this business's only page is a parking page.

Three hosts serve the identical site today — `ellingsonplumbing.com` (parked),
`plumbingmidwest.netlify.app`, and `ellingson-plumbing.netlify.app`.

**Fix:** point the real domain at Netlify, or change the canonical/og/sitemap to the host that
actually serves the site. Then 301 the spare netlify.app to the primary. Until this is done, no
amount of conversion work matters — there is nothing to convert.

### B. The form has never received a submission

Netlify API, form `service-request` (id `6a5cd388227f640007e8b2be`), created 2026-07-19:

```
submission_count: 0        last_submission_at: null
```

Three months, zero leads. Either there is no traffic (consistent with finding A) or the submit
path is broken in production. **Test it before shipping anything else** — one real submission
proves the whole chain (JS → Netlify Forms → notification → inbox). I did not submit a test
lead because it would create a real record and email in the owner's account; say the word and
I'll run it end to end.

Also note `recaptcha: false` with only a honeypot. Fine at zero volume; revisit if spam starts.

### C. "Ellingson Plumbing" is an established 4.8★ brand in Minnesota already

Google Business Profile lookup returns, at **rank 1 absolute** for the name:

> **Ellingson Plumbing, Heating, A/C & Electrical** — 2510 S Broadway St, Alexandria, **MN**
> 4.8★ (465 reviews) · in service since 1980 · ellingsons.com · 24-hour emergency service
> · *"Get an instant online estimate for HVAC systems and water heaters"*

Same state, same trade, same 24/7 positioning, and they already ship the instant-estimate feature
this site is building. Alexandria is ~200 miles from Grand Forks so the service areas don't
overlap, but two things follow:

1. **SEO:** branded search for "Ellingson Plumbing" in Minnesota will return them, not you,
   essentially forever. 465 reviews and 46 years of domain history is not a gap you close.
2. **Trademark:** they have common-law rights in the Minnesota plumbing market going back to 1980,
   and this business is seeking **MN** licensing and a **$25,000 MN bond**. I'm not a lawyer and
   this isn't legal advice — but this is worth 30 minutes with one before the MN DLI number is
   issued and the name goes on a truck.

Note the repo itself is `e-eplumbing`, `OPERATIONS.md` says **"E&E Plumbing"**, and
`JOBBER-SETUP.md` says **"Estad & Ellingson Plumbing"** — only the website brands as bare
"Ellingson Plumbing". The distinguishing name may already exist; the site just isn't using it.

---

## Suggested build order

| Phase | Work | Why |
|---|---|---|
| **0 — today** | Fix canonical/domain (A). Submit one test lead (B). Ask a lawyer about (C). | Nothing else matters until the site is findable and the form provably works. |
| **1 — week 1** | Improvements 1, 2, 8 | Correct payload, an address to drive to, a price that doesn't scare. |
| **2 — week 2** | Improvements 3, 4, 5 | The "plumber knows exactly what the order is" block. |
| **3 — week 3** | Improvements 6, 7, 10 | Access details, real windows, closed loop. |
| **4 — ongoing** | Improvement 9 | Accessibility + no-JS resilience; do it as you touch each control. |

---

## Tooling worth adding

Connected and usable right now:

- **Netlify MCP** — already connected (team `6a278c07…`, plan `nf_team_pro`). Used here to read
  deploys and form stats. Use it to set the `NOTIFY_WEBHOOK` env var and watch submissions.
- **OpenSEO MCP** — connected, 500 credits. Project `Ellingson Plumbing` created. Once the domain
  is fixed: `run_site_audit`, `get_local_rank_grid` (Maps rank across the Valley — *the* metric
  for a plumber), `research_keywords` for "water heater replacement grand forks" etc.
- **Built-in browser** — used for the live state probing above. Re-run after each fix.

Worth connecting, in order of payback:

1. **PostHog** (plugin present) — session replay + funnel on the booking card. At zero submissions
   you cannot tell "no traffic" from "broken form". This answers it permanently. Free tier covers
   this volume.
2. **Stripe** (plugin present, `stripe:stripe-best-practices` skill) — two concrete revenue
   mechanisms already written into the business docs but not built: 30–50% deposits on water
   heater / softener installs (OPERATIONS.md §5) and the **Home Team Plan $29/mo · $279/yr**
   subscription. Stripe Checkout + Billing is a day of work and turns a promise on the page into
   recurring revenue.
3. **Google Business Profile** — not the website; the actual lead source for a plumber. `GBP-CONTENT.md`
   exists in the repo but the profile isn't claimed. This outranks every code change on this list
   for lead volume.
4. **Zapier MCP** (connected) — Netlify Forms → Jobber "Create request", the exact automation
   `JOBBER-SETUP.md` says to add "when volume justifies". It's ~$20–30/mo and removes manual
   re-typing of every lead.
5. **Supabase** (connected) — if the calendar grows past one truck. `book.js` writes slot holds to
   Netlify Blobs with a read-modify-write race and no link between a hold and a lead, so the board
   fills with phantom holds that can never be reconciled or cancelled. A real table fixes that.

Skipped deliberately: Figma/Canva/Adobe (no design bottleneck here), Semrush/Ahrefs (OpenSEO
covers it), Airtable (Jobber is the system of record per JOBBER-SETUP.md).

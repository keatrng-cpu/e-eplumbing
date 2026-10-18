# Forge Atlas / Forge Command registration — e-eplumbing

Handoff for Graph Keeper (`gk`). Paste the blocks below into `forge-command`;
nothing here writes to that repo from this one.

Observed 2026-10-18. Every number is sourced. Where there is no source the
field is `null`, not an estimate.

---

## 1. `config/sites.json` — two entries, not one

Forge Command currently tracks **one** of this project's three live hosts.
`data/sitehealth.json` (fetched 2026-10-18T12:24Z) has
`ellingson-plumbing.netlify.app`; it does not have `plumbingmidwest.netlify.app`,
which is the host that actually receives the deploys this repo pushes.

```json
[
  { "id": "ellingson-primary",
    "url": "https://plumbingmidwest.netlify.app",
    "repo": "keatrng-cpu/e-eplumbing",
    "netlify_site_id": "5b9e7eb6-95e0-4f75-925f-315090b70f9d",
    "netlify_team": "6a278c07e7f058c5a18f6361",
    "plan": "nf_team_pro",
    "forms": true,
    "note": "Live deploy target. Canonical tag points elsewhere — see flag A." },

  { "id": "ellingson-dupe",
    "url": "https://ellingson-plumbing.netlify.app",
    "repo": "keatrng-cpu/e-eplumbing",
    "netlify_site_id": "8e218d30-826e-41f2-87ce-ee0792bc5be6",
    "netlify_team": "6a278c07e7f058c5a18f6361",
    "plan": "nf_team_pro",
    "forms": true,
    "note": "Serves identical content. Should 301 to the primary — duplicate host." }
]
```

## 2. Site health — already captured, two flags

From `forge-command/data/sitehealth.json`, `ellingson-plumbing.netlify.app`:

| strategy | perf | a11y | seo | bp | LCP | CLS |
|---|---|---|---|---|---|---|
| desktop | 95 | 92 | 100 | 100 | 741 ms | **0.125** |
| mobile | 90 | 92 | 100 | 100 | **2,877 ms** | 0.012 |

- **CLS 0.125 on desktop** is over the 0.1 "good" threshold. Likely the
  JS-rendered job pills and town `<select>` reflowing the booking card on boot.
  The v2 form server-renders the town options, which should help; re-measure.
- **Mobile LCP 2.9 s** against a 2.5 s target. The hero sits behind topbar +
  season bar + ticker + masthead + sticky header and two Google Fonts families.
- `seo: 100` is a **false pass** — Lighthouse checks that a canonical exists,
  not that it resolves to anything. See flag A.

## 3. `data/ideas.json` — enhancement queue

Fields match the existing schema (`id, set, cat, title, what, impact, effort,
repo, score, status, top`). `score` is left `null`: Forge Command computes
`opp` and `rank`, and a hand-written score would pollute the calibration set.

```json
[
 {"id":"eep-canonical","set":"eep-2026-10","cat":"seo","repo":"keatrng-cpu/e-eplumbing",
  "title":"Canonical points at a parked domain",
  "what":"index.html canonical, og:url, sitemap.xml and robots.txt all name ellingsonplumbing.com, which serves a 114-byte registrar lander (JS redirect to /lander). Point DNS at Netlify or repoint the tags.",
  "impact":"high","effort":"S","score":null,"status":"open","top":true},

 {"id":"eep-form-zero","set":"eep-2026-10","cat":"ops","repo":"keatrng-cpu/e-eplumbing",
  "title":"Lead form has never received a submission",
  "what":"Netlify form service-request (6a5cd388227f640007e8b2be), created 2026-07-19: submission_count 0, last_submission_at null. Send one real test lead to prove the JS -> Forms -> notify chain.",
  "impact":"high","effort":"XS","score":null,"status":"open","top":true},

 {"id":"eep-brand-collision","set":"eep-2026-10","cat":"risk","repo":"keatrng-cpu/e-eplumbing",
  "title":"Name collides with an established MN plumbing brand",
  "what":"GBP rank 1 absolute for the name: Ellingson Plumbing, Heating, A/C & Electrical, Alexandria MN, 4.8/465 reviews, trading since 1980, 24h emergency, already ships instant online estimates. Same state this business is seeking licensing and a $25k bond in. Repo and ops docs say E&E / Estad & Ellingson; only the site brands as bare Ellingson.",
  "impact":"high","effort":"M","score":null,"status":"open","top":true},

 {"id":"eep-order-v2","set":"eep-2026-10","cat":"conversion","repo":"keatrng-cpu/e-eplumbing",
  "title":"Order flow v2 shipped",
  "what":"Single state object; urgency radios drive pricing; two-tap scope picker reaches all pricebook options; address, photo upload, job-specific questions, access details, arrival windows, reference number, SMS dispatch, no-JS fallback.",
  "impact":"high","effort":"L","score":null,"status":"done","top":false},

 {"id":"eep-cls","set":"eep-2026-10","cat":"perf","repo":"keatrng-cpu/e-eplumbing",
  "title":"Desktop CLS 0.125 over threshold",
  "what":"Booking card reflows as JS populates controls. Town options are now static; reserve height for the job pills and quote box and re-measure.",
  "impact":"med","effort":"S","score":null,"status":"open","top":false},

 {"id":"eep-analytics","set":"eep-2026-10","cat":"data","repo":"keatrng-cpu/e-eplumbing",
  "title":"No analytics on the booking funnel",
  "what":"Zero events instrumented, so 'no traffic' and 'broken form' are indistinguishable. PostHog free tier covers this volume; add funnel steps at service-pick, scope-pick, submit.",
  "impact":"high","effort":"S","score":null,"status":"open","top":true},

 {"id":"eep-blobs-race","set":"eep-2026-10","cat":"correctness","repo":"keatrng-cpu/e-eplumbing",
  "title":"Calendar holds race and cannot be reconciled",
  "what":"book.js read-modify-writes a single 'fill' blob with no lock, and a hold carries no link to the lead it belongs to, so the board accumulates phantom holds that can never be cancelled. Move to a real table when the calendar outgrows one truck.",
  "impact":"med","effort":"M","score":null,"status":"open","top":false}
]
```

## 4. `data/income.json` — stream entry

Per the schema's own rule, an unsourced amount is `null` and renders "no data".
Nothing has been collected, so nothing is claimed.

```json
{ "id": "eep-plumbing", "name": "Ellingson Plumbing (service revenue)",
  "kind": "services", "status": "building", "source": "none",
  "source_ref": null, "mrr_usd": null, "ttm_usd": null,
  "next_step": "Fix the canonical, prove the lead form, claim the GBP.",
  "link": "https://plumbingmidwest.netlify.app" }
```

Two unbuilt mechanisms are already written into this repo's own docs and would
each give this stream a real Stripe source:

- **Home Team Plan** — `$29/mo · $279/yr`, stated on the live page, no checkout behind it.
- **Install deposits** — 30–50% on water heaters and softeners (OPERATIONS.md §5), currently collected by hand or not at all.

## 5. Atlas graph notes

- `pricebook.js` and `schedule.js` are god nodes for this repo: both are loaded
  in the browser **and** `require()`d by `netlify/functions/book.js`, so a change
  to either moves the customer-facing price and the server-authoritative one
  together. Any Atlas `impact_of` on these two should flag the function dir.
- Repo name `e-eplumbing` and the docs say **E&E / Estad & Ellingson**; the site
  says **Ellingson Plumbing**. Atlas should treat these as one entity with an
  unresolved naming decision (see `eep-brand-collision`).

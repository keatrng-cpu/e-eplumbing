# HELIX desk run — Ellingson Plumbing

Run 2026-10-18 against the Helix screens (`brain`, `marketing`, `sites`, `seo`,
`operate`, `analytics`, `automations`, `roadmap`).

**House rule, applied.** Helix does not invent numbers, products or results.
Where this business has no source, the line reads **no data** — it is not
estimated, and an unsourced figure never counts toward a goal.

---

## Brain — what this business actually is

| | |
|---|---|
| Trade | Residential + light commercial plumbing |
| Market | Eastern ND + Western MN, both sides of the Red River |
| Licensing | ND on file. **MN DLI number and $25,000 bond: not yet issued** (stated in the site footer) |
| Crew | 1 truck / 1 crew — `schedule.js` `DAILY_SLOTS = 4` |
| Differentiator | Dual-state licensing; a plumber answers the phone, not a call centre |
| Revenue to date | **no data** — no connected source, no recorded job |
| Leads to date | **0** (Netlify form, 2026-07-19 → 2026-10-18) |

The positioning is genuinely good and genuinely local — freeze / melt / hard
water is a real segmentation that a national franchise template cannot copy.
It is not the constraint.

## Offers — one price list, two unbuilt products

The pricebook is the strongest asset here: 25+ flat-rate line items, calibrated
Sept 2026, shared between browser and server so the quoted number and the bound
number cannot drift. Most shops this size do not have this.

Two offers are **stated on the live page but have no way to buy them**:

| Offer | Stated price | Can a customer pay? | Gap |
|---|---|---|---|
| Home Team Plan | $29/mo · $279/yr | **No** | No checkout. The CTA is "Ask about the plan" → an anchor. |
| Install deposits | 30–50% (OPERATIONS.md §5) | **No** | Collected by hand at the door, or not at all. |

Helix will not price these differently — $29/$279 is the number you stated and
it stands. The work is a Stripe Checkout link and a Billing subscription, which
turns the membership from a promise on a page into the only recurring line this
business has. That is the single highest-leverage build on this list, because
it is the one thing here that is not sold one emergency at a time.

## Pipeline — there is no pipeline yet

```
Demand  →  Site  →  Form  →  Callback  →  Job  →  Invoice  →  Review
  ?        live     0 subs     n/a       n/a      n/a        0
```

Every downstream number is `n/a` because the first two stages are broken, in
this order:

1. **Demand has nowhere to land.** The canonical tag, `og:url`, `sitemap.xml`
   and `robots.txt` all declare `ellingsonplumbing.com` authoritative. That host
   serves 114 bytes of JavaScript redirecting to a registrar lander. Google is
   being told the real copy of your only page is a parking page.
2. **No Google Business Profile.** For a plumber this is not a marketing channel,
   it is *the* channel — map-pack placement decides who gets the 2am call.
   `GBP-CONTENT.md` is written and sitting in the repo, unclaimed.
3. Only then does conversion matter. The order flow was rebuilt today
   (see `ORDER-FLOW-AUDIT.md`); it is now worth sending traffic to.

**Helix will not run a loop on an empty book.** No campaign, no sequence, no
outreach until (1) and (2) are done — sending traffic to a site whose canonical
points at a lander spends money to produce nothing measurable.

## Money — nothing to collect yet

| Line | Source | Amount |
|---|---|---|
| Service revenue | none connected | **no data** |
| Memberships | not sold | **no data** |
| Deposits | not collected | **no data** |

Cash stays blank until a real source exists. The fastest route to a first
sourced dollar is Stripe on the Home Team Plan — it is the only offer here that
can be bought without a truck leaving the shop.

## Sites — one site, three hosts

| Host | Role | State |
|---|---|---|
| `plumbingmidwest.netlify.app` | live deploy target | 200, serving |
| `ellingson-plumbing.netlify.app` | duplicate | 200, identical content |
| `ellingsonplumbing.com` | the name you advertise | **registrar lander** |

Lighthouse (from Forge Command `sitehealth.json`, 2026-10-18): desktop
95/92/100/100, mobile 90/92/100/100. Mobile LCP **2,877 ms** over the 2.5 s
target; desktop CLS **0.125** over the 0.1 threshold. The `seo: 100` is a false
pass — Lighthouse checks a canonical exists, not that it resolves.

## Operate — the playbook is good and entirely manual

`OPERATIONS.md` is a genuinely strong SOP: intake script, emergency triage,
the E&E Standard, flat-rate rules, after-hours protocol, the Friday metrics
review. Nothing in it is automated. Specifically:

- Intake is re-typed from email into Jobber by hand (`JOBBER-SETUP.md` says so).
- Review requests are manual.
- The <15-minute callback target has no timer and no record.
- `submission-created.js` now texts the on-call phone (shipped today) — it needs
  `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM`, `DISPATCH_SMS` set in Netlify.

The ratio to watch: at one truck and 4 slots/day, capacity is the binding
constraint long before lead volume is. Automate intake before you buy traffic.

## Risk — the name

Helix flags this because it affects the offer, the domain and the licence
simultaneously, and it gets more expensive the longer it waits.

**Ellingson Plumbing, Heating, A/C & Electrical** — Alexandria MN, 4.8★ across
465 reviews, trading since 1980, `ellingsons.com`, 24-hour emergency service,
and already advertising instant online estimates for water heaters. Google
returns them at **rank 1 absolute** for the name. Alexandria is ~200 miles from
Grand Forks so the service areas do not overlap, but:

- Branded search for "Ellingson Plumbing" in Minnesota returns them, permanently.
  465 reviews and 46 years is not a gap that gets closed.
- They hold common-law rights in the Minnesota plumbing market going back to
  1980, and this business is seeking **MN** licensing and a **$25,000 MN bond**.

Not legal advice. This is worth 30 minutes with a lawyer **before** the MN DLI
number is issued and the name goes on a truck and a van wrap. Note your own repo
is `e-eplumbing`, OPERATIONS.md says **E&E Plumbing**, JOBBER-SETUP.md says
**Estad & Ellingson Plumbing** — the distinguishing name may already exist. Only
the website brands as bare "Ellingson Plumbing".

## Roadmap — the order Helix would run it

| # | Move | Owner | Cost | Unblocks |
|---|---|---|---|---|
| 1 | Point `ellingsonplumbing.com` at Netlify, 301 the spare host | you (DNS) | $0 | everything downstream |
| 2 | Send one real test lead end to end | you | $0 | proves the chain before spend |
| 3 | Lawyer call on the name | you | ~1h | stops a rebrand after the van wrap |
| 4 | Claim + fill the Google Business Profile from `GBP-CONTENT.md` | you | $0 | the actual lead channel |
| 5 | Set `TWILIO_*` + `DISPATCH_SMS` in Netlify | you | ~$1/mo | 2am dispatch actually buzzes |
| 6 | PostHog on the booking funnel | build | $0 | ends "no traffic vs broken form" |
| 7 | Stripe Checkout on the Home Team Plan | build | ~1 day | first recurring, sourced revenue |
| 8 | Zapier: Netlify Forms → Jobber request | build | ~$20–30/mo | stops re-typing every lead |

1–5 are yours and cost almost nothing. 6–8 are build work and should not start
until 1 and 2 are done — there is no point instrumenting a funnel that nothing
can reach.

**What Helix will not do yet:** no campaign, no sequence, no membership launch
email, no traffic buying, and no revenue figure of any kind. There is no book to
run a loop on and no number that came from a source.

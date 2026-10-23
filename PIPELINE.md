# Ellingson Plumbing — Job Pipeline

How a brand-new plumber with zero reviews and zero backlog finds and closes customer jobs. Ranked by **speed to first dollar**, because that's the only thing that matters in month one.

The cold-start problem is real: homeowners pick plumbers on reviews and ranking, and you start with neither. The answer isn't one channel — it's stacking a fast-but-paid channel on top of a slow-but-free flywheel, and using the season as the wedge.

**The wedge: it's October. Hard freeze is ~4–6 weeks out.** Frozen pipes, burst lines, no-heat water, and sump failures are emergency calls that don't comparison-shop — they go to whoever is visible and answers. Be positioned before the first deep freeze and the first month half-fills itself.

---

## The channels, ranked

### 1. Google Local Services Ads (LSAs) — the fastest paid tap
The "Google Guaranteed" badge that sits *above* the normal search ads. Pay-per-lead, not per-click, and the badge borrows Google's trust so a no-review shop can still get the call.

- **Setup:** needs the license, insurance, and a background check (Google runs it on the business + the master). Apply the day licensing clears — approval takes 1–2 weeks, so it's on the critical path.
- **Budget:** start $1,500–3,000/mo. Plumbing leads run ~$25–50 each; a tight shop closes 30–50%.
- **Lever:** you only pay for leads, and you can **dispute junk leads** (wrong area, spam) for credit — do it every week.
- **Decision rule:** set the weekly budget to what the *one van can physically service*. More leads than you can run on time burns money and earns bad reviews.

### 2. Google Business Profile + the review flywheel
Free, and it ranks you in the map pack — but the lever is reviews, and you have zero. See the Reviews Engine below. GBP is the long game that makes every other channel cheaper; LSAs are the bridge until it ranks.

- Publish `GBP-CONTENT.md`, category **Plumber**, phone **(218) 779-2553**, real service-area cities, real hours (24/7).
- Post weekly (freeze tips now, sump tips at melt) — GBP posts are a small ranking signal and a free touch.

### 3. Overflow & subcontract outreach — the near-zero-CAC first jobs
The fastest *real* jobs in week one. Established plumbers, HVAC companies, GCs, and property managers turn away work constantly — after-hours calls, small jobs, overflow when they're booked. Call every one in Grand Forks and offer to be their overflow and emergency relief.

- **Property managers and landlords** are the prize: recurring, predictable, and they don't need reviews — they need someone who answers. Grand Forks has a large rental/student-housing base around UND.
- **Script:** "I'm a licensed plumber just launched in Grand Forks with open capacity. When you're booked solid or get an after-hours call you don't want, send it my way — I'll make you look good and I won't poach the relationship."
- **Cross-sell your own network:** Pick It Up E already has Grand Forks customers and a local presence — the same homeowners need a plumber.

### 4. Pay-per-lead marketplaces — volume filler
Angi, Thumbtack, HomeAdvisor. Lower lead quality and you're bidding against everyone, but it's volume while the flywheel spins up. Use as fill, cap the budget, and graduate off it as LSAs + GBP carry the load. Don't build on it.

### 5. Supply-house referral
Once the Northern Plumbing Supply / Winnelson account is open and in good standing, ask the counter staff to refer the homeowners who walk in with a problem. It costs nothing and the leads are pre-qualified (they already know they have a plumbing issue).

### 6. Nextdoor + local Facebook groups
Grand Forks / EGF community groups are high-trust and free. Be the helpful local plumber: answer questions, drop seasonal tips (the ones in `MARKETING-KIT.md`), and the "who's a good plumber?" posts start tagging you. Organic, slow, and sticky.

### 7. Seasonal emergency positioning (the wedge, operationalized)
Own **"frozen pipe," "burst pipe," "no hot water," and "24/7 emergency"** in the GBP description, the LSA service selections, and the site before the freeze. These are the searches that spike in a Valley cold snap and convert on the first call. The after-hours multiplier in the pricebook is already built for this.

---

## The Reviews Engine

Reviews are a channel, not an afterthought — they're what makes channels 1, 2, and 6 work. The first 10 are the hardest; engineer them.

**The ask (already drafted in `MARKETING-KIT.md`) — what makes it actually fire:**
1. **Timing:** request the review **same day, within a couple hours of a good job**, while the relief is fresh. The on-my-way-done-photos-review sequence in `OPERATIONS.md` is the funnel.
2. **One-tap link:** generate the GBP "write a review" short link (Business Profile → Ask for reviews → copy link; shorten it). Texting a one-tap link beats "look us up on Google" by a wide margin.
3. **In-person + text, both:** the master asks at the door ("if we earned it, a Google review really helps a local crew — I'll text you the link"), then the FSM auto-sends the link. Ask-then-send converts far better than send-only.
4. **Seed the first 10 from the warmest jobs:** the overflow/property-manager jobs and anyone in the personal network who's used the work. Never fabricate a review — GBP strips them and it can suspend the profile. (`LAUNCH.md` already says this; it matters.)
5. **Respond to every review**, good or bad, within 24 hours — it's a ranking signal and it shows the next reader you're present.

**Automate it in the FSM:** Jobber/Housecall Pro → automated "review request" message triggered on **invoice paid**, carrying the GBP short link. Set this up on day one so it fires on job #1.

**Target:** 10 reviews in the first 30 days, 30 by day 90. That's the threshold where GBP starts ranking you into the map pack and LSA close rates climb.

---

## The money-flow back end (so a job becomes cash, cleanly)

```
Call / Netlify form / LSA lead
   → Job created in FSM within 15 min (on the drive for true emergencies)
   → Arrival-window text, on-my-way text
   → Flat-rate quote on-site, approved before work  (good / better / best)
   → Work done, photos to customer
   → Card charged on site  (or financing offered on tickets >$1,500)
   → Invoice synced to QuickBooks
   → Review request auto-fires on payment
   → Membership offered  ($29/mo Home Team)
```

**What's already built:** the site, the live estimator, the Netlify booking form, the pricebook, the $29/mo membership, the ops playbook, the marketing kit.

**What to turn on (the gap between "a site" and "a business"):**
- [ ] **FSM software** set up with the pricebook loaded — import `FSM-PRICEBOOK.csv` (Jobber: Products & Services → Import; Housecall Pro: Price Book → Import).
- [ ] **Payments on the job** (Jobber Payments / Square / Stripe) so the card is charged at the door.
- [ ] **QuickBooks Online** connected for the books (the account already has a QuickBooks connector available).
- [ ] **Google LSAs** application in the day licensing clears.
- [ ] **GBP** published + review short link generated + auto-review-request wired in the FSM.
- [ ] **24/7 answering** — an answering service or a forwarding/app setup so "real 24/7 answer" is true, because the whole brand rests on it.
- [ ] **Domain live** — `ellingsonplumbing.com` DNS pointed (steps in `LAUNCH.md`).
- [ ] **Financing** option (Wisetack/Sunbit) for big tickets.

---

## The weekly scoreboard (run the pipeline on numbers)

Track these every Friday — they're the leading indicators of the ~3-jobs/day break-even in `LAUNCH-ECONOMICS.md`:

| Metric | Healthy early |
|---|---|
| Leads this week (by channel) | 15–25 |
| Booked / leads (booking rate) | ≥ 40% |
| Completed jobs | 12–18 (→ 3/day) |
| Average ticket | ≥ $375, trending up |
| New reviews | 2–4/week |
| New members | 1–3/week |
| Callback rate | < 5% |
| LSA cost per booked job | < $100 |

When completed jobs hold at 4/day for 6–8 weeks and you've got a cash cushion, that's the signal to recruit a journeyman and launch van #2 — not before.

---

*Rates and lead costs here are starting assumptions from aggregator and industry sources (see `LAUNCH-ECONOMICS.md` for citations); verify against your own first month of real numbers and adjust.*

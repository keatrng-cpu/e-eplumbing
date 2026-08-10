# E&E Plumbing — Business Launch Plan

**Company:** Estad & Ellingson Plumbing LLC (E&E)  
**Market:** Greater Grand Forks, Eastern North Dakota, Western Minnesota (Red River Valley)  
**Model:** 24/7 residential + light commercial plumbing service, flat-rate pricing, dual-state licensing  
**Status:** Marketing site live in repo; business formation and licensing in progress

---

## 1. Vision & Positioning

**One-liner:** The Valley’s plumbers — on call, on time, both sides of the river.

**Differentiation:**
- Licensed, bonded, and insured in **both ND and MN** (most competitors are one-state)
- Real 24/7 answer by a licensed plumber (no answering-service runaround)
- Upfront flat-rate quotes before any wrench turns
- Owner names on the truck = personal accountability
- Regional fluency: hard water, freeze/thaw, Red River flood seasons, farmsteads

**Primary services (start focused):**
1. Emergency repairs (burst, backup, no-heat water)
2. Drain & sewer (camera, auger, hydro)
3. Water heaters (tank + tankless)
4. Sump pumps + battery backup
5. Frozen / burst pipe response
6. Softeners & filtration (Valley hard water)
7. Light remodel / rough-in
8. Small commercial / backflow

---

## 2. Legal & Licensing Foundation (Non-negotiable)

### Business entity
- Form **LLC** in North Dakota (Secretary of State) or Minnesota — pick the state of primary residence/operations.
- Obtain EIN from IRS (free, online).
- Open a dedicated business checking account + business credit card.
- Get a DBA if you want “E&E Plumbing” as a trade name.

### North Dakota
- **Master Plumber** license required to operate a plumbing business in areas with public water/sewer (NDCC 43-18).
- Requirements (typical): age 21+, 2 years / 3,400 hours as licensed Journeyman, pass Master exam, pay fees (~$200 license + exam).
- Board: [ndplumbingboard.gov](https://www.ndplumbingboard.gov)
- Firm must have a licensed Master in charge of the work.

### Minnesota
- **Plumbing Contractor** license from DLI (separate from individual Master/Journeyman).
- Requires:
  - Active **Master Plumber** as responsible licensed individual
  - **$25,000 surety bond** (DLI form)
  - Public liability insurance (minimums set by DLI; target $1M practical)
  - Workers’ compensation compliance form
- Individual Master/Journeyman path is separate (apprenticeship or experience + exam).
- Source: [dli.mn.gov plumbing contractor licensing](https://www.dli.mn.gov/business/plumbing-contractors/plumbing-contractor-licensing-basics)

### Insurance (minimum practical package)
| Coverage | Target |
|----------|--------|
| General liability | $1,000,000 per occurrence |
| Products / completed ops | Included |
| Commercial auto | $1M |
| Tools & equipment | Actual cash value of stocked truck |
| Workers’ comp | Required once you have employees |
| Bond (MN) | $25,000 |

**Action:** Call a commercial insurance broker who knows plumbing/HVAC in ND/MN (many work both states).

### Local permits & city rules
- Grand Forks, Fargo, East Grand Forks, Moorhead, and smaller towns may have additional registration or permit processes. Build a simple “permit cheat sheet” for the top 8 cities.

---

## 3. Service Order Flow (The Core Machine)

```
Lead → Qualify → Schedule → Dispatch → Quote (flat-rate) → Approve → Perform → Invoice → Collect → Review → Follow-up / Plan sale
```

### Detailed stages

| Stage | What happens | Tool / owner |
|-------|--------------|--------------|
| **Lead** | Phone, website form, Google, referral | Netlify Forms → email/SMS + CRM |
| **Qualify** | Urgency, location, service type, access | Scripted intake (see OPERATIONS.md) |
| **Schedule** | Arrival window, tech assignment | Jobber / Housecall Pro calendar |
| **Dispatch** | Tech gets job packet + parts list | Mobile app |
| **On-site quote** | Flat-rate options presented before work | Pricebook in software |
| **Approve** | Customer signs digital approval | App signature |
| **Perform** | Work + photos + notes | Mobile app |
| **Invoice** | Same-day invoice, card/ACH | In-app payments |
| **Collect** | Deposit or full payment | Stripe / Square via FSM |
| **Review** | Automated review request (Google + Facebook) | FSM automation |
| **Follow-up** | 7-day check-in + Home Team Plan offer | Email/SMS sequence |

**Emergency path:** Phone is answered by a licensed plumber → immediate triage → “I’ll be there in X minutes” → job created in system on the drive.

---

## 4. Technology Stack (Start lean)

| Need | Recommendation | Why |
|------|----------------|-----|
| Website | This repo on **Netlify** + custom domain | Already built, forms ready |
| Forms → inbox | Netlify Forms + email notifications + optional Zapier → Slack/SMS | Zero code |
| Field service / CRM | **Jobber** (or Housecall Pro) | Best price/feature for 1–5 truck shops; quoting, scheduling, payments, reviews |
| Payments | Jobber Payments or Square | Instant deposits |
| Accounting | QuickBooks Online | Syncs with Jobber |
| Phone | Google Voice → later OpenPhone / local business line | Keep (218) 779-2553 consistent |
| Docs / SOPs | Notion or Google Drive | Cheap and shareable |
| Review generation | Birdeye / Podium or native Jobber | Speed to 20+ Google reviews |

**Do not** start on ServiceTitan. It is enterprise-priced and overkill under ~8–10 techs.

---

## 5. Pricing Philosophy

- **Flat-rate pricebook** for the top 50 residential jobs (water heater swap, toilet, sump, main line clear, etc.).
- Emergency / after-hours multiplier published (e.g. 1.5× after 5 pm / weekends).
- Never start work without written/digital approval of the price.
- Membership (“Home Team Plan”) sold as annual or monthly — priority scheduling, annual inspection, member discount. Replace the current “From $12/mo” placeholder with a real number once COGS is known (typical range $15–$35/mo for small shops).

---

## 6. Marketing & Lead Engine

### Phase 1 (weeks 1–8) — Own the basics
1. **Google Business Profile** — claim, verify, complete every field, weekly posts, respond to every review.
2. **Custom domain** on Netlify (e.g. eeplumbing.com or estadellingson.com).
3. **Local SEO** — service + city pages later if needed; schema.org already in place.
4. **Nextdoor + Facebook** — neighborhood groups, helpful (not salesy) posts.
5. **Truck wrap + magnetic signs** — rolling billboard.
6. **Referral program** — $50–$100 credit for both parties.

### Phase 2 (month 2–4)
7. Google Local Services Ads (LSA) once licensed and insured (high-intent, pay-per-lead).
8. Targeted Google Ads for “emergency plumber Grand Forks”, “water heater Moorhead”, etc.
9. Partnerships: realtors, property managers, septic companies, HVAC shops (cross-referral).
10. Yard signs left after every job (with permission).

### Phase 3
11. Content: short “Valley plumbing tips” videos (freeze protection, sump season).
12. Sponsorships: local sports, chamber, farm shows.

---

## 7. 90-Day Execution Roadmap

### Days 1–14 — Foundation
- [ ] File LLC + EIN + business bank account
- [ ] Confirm/obtain ND Master (and MN Master if needed)
- [ ] Start MN Plumbing Contractor application + $25k bond + insurance quotes
- [ ] Deploy site to Netlify production + custom domain
- [ ] Wire Netlify Form notifications to phone + email
- [ ] Claim Google Business Profile
- [ ] Choose and set up Jobber (or Housecall Pro) trial
- [ ] Build first 30-item flat-rate pricebook

### Days 15–45 — Soft launch
- [ ] Soft launch to friends/family + first 10 real jobs
- [ ] Collect 5–10 real Google reviews (replace sample testimonials)
- [ ] Finalize MN license number → update footer `#PC-XXXXXX`
- [ ] Print truck magnets / temporary vehicle branding
- [ ] Create intake script and emergency triage card (phone + glovebox)
- [ ] Set up QuickBooks + payment processing

### Days 46–90 — Public launch
- [ ] Full public launch announcement
- [ ] Turn on Google LSA / limited Ads budget ($20–50/day test)
- [ ] Launch Home Team Plan with real pricing
- [ ] Hire first helper / apprentice if volume justifies
- [ ] Weekly KPI review: leads, booked jobs, close rate, average ticket, review count

---

## 8. Key Metrics (track weekly)

| Metric | Target (first 6 months) |
|--------|-------------------------|
| Qualified leads / week | 8–15 |
| Booked jobs / week | 5–10 |
| Average ticket | $350–$650 (mix of emergency + planned) |
| Close rate on quotes | >70% |
| Google reviews | 25+ in 90 days |
| Memberships sold | 15–30 |
| Net promoter / repeat rate | Track manually at first |

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Licensing delay | Start applications immediately; soft-launch only in jurisdictions already covered |
| Cash flow (parts + truck) | Require deposits on large jobs; keep 30-day operating reserve |
| Reputation damage from one bad job | Strict “E&E Standard” checklist; photo documentation; make-it-right policy |
| Seasonality (winter freezes, spring melt) | Build membership base in shoulder seasons; market sump/freeze prep aggressively |
| Competitor price pressure | Compete on speed, dual-state coverage, and trust — not race-to-bottom |

---

## 10. Immediate Next Actions (this week)

1. Confirm personal/company licensing status for ND and MN.
2. Get insurance + bond quotes.
3. Deploy this site to a live Netlify URL + connect the form to real notifications.
4. Open Jobber trial and import the service categories from the website.
5. Replace sample reviews as soon as the first real customers complete jobs.

---

*This plan is a living document. Update license numbers, pricing, and metrics as they become real.*

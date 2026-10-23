# Ellingson Plumbing — Launch Economics

How one van and two people make money. Numbers are Red River Valley, October 2026, and every rate here is a *starting assumption to verify*, not a filed figure. Confirm licensing with the [ND State Plumbing Board](https://www.ndplumbingboard.gov), wages against live postings, and tax treatment with an accountant before you bank on them.

The pricebook (`PRICEBOOK.md` / `pricebook.js`) is already calibrated to the market. This doc is the layer underneath it: what it costs to run the truck, how many jobs a day you have to do to keep the lights on, and the levers that turn a busy week into a profitable one.

---

## 1. The one number that governs everything: ~3 completed jobs a day

A flat-rate plumbing shop lives or dies on **completed jobs per day per crew**. Here is the math, built bottom-up.

### Monthly fixed overhead (one van, one apprentice, before materials and before paying the owner)

| Line | Monthly | Basis |
|---|---|---|
| Apprentice wage, loaded | $4,850 | ~$21/hr ND average × 173 hrs, +~33% for payroll tax + ND WSI (plumbing is a high comp class) |
| Van — finance + commercial insurance + fuel + maintenance | $1,900 | Used cargo van ~$30–40k financed over 5 yr (~$700–850), commercial auto (~$300), fuel (~$600), upkeep (~$150) |
| General liability insurance | $150 | |
| Field-service software (Jobber / Housecall Pro) | $250 | |
| Answering / phone / 24-7 coverage | $200 | |
| Workers comp + misc (bonds, dues, PPE) | $500 | |
| Marketing (Google LSAs + GBP tools) | $2,000 | The startup variable. See `PIPELINE.md`. |
| **Fixed overhead** | **≈ $9,850 / mo** | call it **$10k** |

Materials are *not* in that table — they are passed through inside the flat-rate price (budget ~20–25% of each ticket as cost of goods). The owner's pay is also not in it.

### Break-even

- **Blended ticket, early:** ~$375 (service calls credited into repairs, drain clears, the odd water heater). Climbs to $450+ as the job mix shifts toward installs.
- **Gross profit per job** (ticket − materials): ~$285.

| Target | Jobs / month | Jobs / day (5-day week) |
|---|---|---|
| Cover fixed overhead only | $10,000 ÷ $285 ≈ **35** | **~1.6** |
| Cover overhead **+ a $7k/mo owner draw** | $17,000 ÷ $285 ≈ **60** | **~2.7** |
| Generate real profit to fund van #2 | ~80 | **~3.6** |

**Decision rule:** below **2 completed jobs/day** you are losing money; at **~3/day** you clear overhead and pay yourself a living wage; at **4/day** you are throwing off the cash that buys the second truck. Everything in `PIPELINE.md` exists to get the one van to 3–4 jobs a day.

**Trigger threshold to hire van #2:** when the one crew is consistently turning away work at **4+ jobs/day for 6–8 weeks** *and* you have ~$40k of cash cushion. Not before.

---

## 2. The hard constraint nobody warns you about: you are a one-crew shop for ~3 years

North Dakota apprentices must be registered with the Plumbing Board within **30 days** of starting, and **first-, second-, and third-year apprentices must work under the *direct* supervision of a master or journeyman** — they cannot run a job alone until their fourth year ([ND apprenticeship rules](https://www.ndplumbingboard.gov/faq)). The term is four years / 7,600 hours.

What that means for the money:

- Your master and your apprentice **ride in the same van, to the same job.** You do not get two revenue streams out of two people. You get one crew that is faster because there are two sets of hands.
- The apprentice is a **3-year investment in a future lead tech**, not immediate leverage. Priced right, they roughly pay for themselves by making the master 30–40% more productive (the master diagnoses and sells while the apprentice hauls, preps, and cleans) — but they do not double your capacity.
- **The path to a second crew is a journeyman hire, not waiting for the apprentice to graduate.** Budget to recruit a journeyman the quarter after you hit 4 jobs/day. The apprentice becomes your journeyman in year 4 and seeds crew #3.

So the realistic ceiling of this exact configuration — one master, one apprentice, one van — is about **$20–24k/month gross** at full utilization (3–4 jobs/day × ~$400 × 22 days). Plan the business inside that box until a journeyman joins, and don't over-commit on marketing spend you can't physically service.

---

## 3. Maximize profitability — the levers, ranked by dollars-per-effort

1. **Billable efficiency is the whole game.** A new shop bills maybe 40–50% of paid hours; the rest is driving, parts runs, quoting, and callbacks. Every 10 points you recover ≈ one more job a day on the same payroll. Mechanics: keep a **tight service area** early (don't send the only van 40 minutes for one call), batch a morning parts pickup instead of mid-job runs, and have the apprentice stage the next job's materials from the van while the master closes the current one.
2. **Shift the mix toward installs.** A $179 drain clear and an $1,100-labor water-heater swap take similar calendar time; one pays 6×. Treat every drain/diagnostic call as the *front door* to a water heater, softener (Valley hard water — easy yes), sump + battery backup, or a membership — not the whole job. **Rule: every diagnostic visit leaves with either a repair approved, an install quoted, or a membership sold.**
3. **Memberships are the answer to "no backlog."** The $29/mo Home Team plan is already built and locked. 100 members = **$2,900/mo recurring** *plus* first-call rights *plus* the annual-maintenance visits that find the next water heater. This is the single best defense against a cold pipeline — build the base to 100 in year one.
4. **Price after-hours like it's scarce, because it is.** The book already does 1.5× nights/weekends and a daytime emergency add. Emergency callers do not comparison-shop — they call whoever answers. This is the highest-margin hour you sell; protect it and actually answer the phone.
5. **Never pay retail for a part.** A contractor account (see §5) is 20–40% off retail and buys you net-30 float. On a $90-materials ticket that's $20–35 straight to margin, every job.
6. **Kill callbacks.** Free re-work is the quiet margin leak — a 10% callback rate erases a tech's profit. The E&E Standard (boot covers, photos, left-clean, same-day review) in `OPERATIONS.md` is a margin tool, not just manners.
7. **Offer financing on tickets over ~$1,500.** A water heater or re-pipe closes far more often with a "$X/month" option (Wisetack, Sunbit). The 3–5% fee is cheaper than the lost job.

---

## 4. The company vehicle (your one van = your capacity)

- **Buy used, finance, preserve cash.** A clean used Transit/ProMaster (50–100k mi) at $25–40k financed beats a $55k new unit when cash is the constraint. The van is capacity, not a trophy.
- **Title it in the LLC, insure commercial, never personal-use it.** Mixed use wrecks the tax treatment and the insurance claim.
- **Section 179 / bonus depreciation** lets you deduct the van and the tools in year one when it's 100% business use — a real first-year tax lever. Confirm the current limits with your accountant.
- **The wrap is marketing, not a cost.** "Owner names on the truck" is the brand promise. A $2–3k wrap on a van that sits in 300 driveways a year is the cheapest advertising you own. Budget shelving/bins ($2–4k) + wrap ($2–3k) into the startup number.

---

## 5. The supply account (Northern Plumbing — and a backup)

"Northern Plumbing" is **Northern Plumbing Supply**, a Grand Forks wholesaler (P.O. Box 14567, Grand Forks; also trades as Waterfront Kitchen & Bath; Grand Forks + Fargo locations). Their public pages are showroom/kitchen-and-bath, so the contractor-account terms aren't published — **you have to call and ask for a trade account application.** The contractor-focused alternative in town is **Winnelson** (the WinWholesale plumbing brand, Grand Forks/Fargo). Open at least one; ideally both, so you're never stranded on a part.

Why the account is a profit lever, not just convenience:

- **Net-30 terms = free working capital.** You buy the water heater, install it, collect from the customer on the day, and don't pay the supply house for 30 days. With no cash cushion, that float is what lets you take a $1,200-materials job at all.
- **Contractor pricing** runs 20–40% under retail / big-box — straight margin on every install.
- **Will-call + delivery** saves billable time (see lever #1).
- **The counter staff are a referral source.** Homeowners walk in with a leaking tank; the counter sends them to contractors with accounts in good standing. Get on that list.

**To open:** LLC formation docs + EIN + ND sales-tax / resale certificate (plumbing parts resold to the customer have specific ND tax handling — ask the accountant), a trade reference or two, and a credit app. If they won't extend net-30 to a brand-new LLC, start on a secured/prepay account and convert after 60–90 days of clean history.

**Rule:** every part you install comes through the account at contractor price. Retail is for emergencies only.

---

## 6. Licensing reality (verify — do not launch on these numbers)

The sources conflict, so treat this as the *mechanism* and route the filed position to the Board and an attorney:

- Plumbing is licensed by the **ND State Plumbing Board**, separate from general-contractor registration. A plumbing business operating in public water/sewer areas needs a **licensed Master in charge of the work** — and **you have the master.** That is the unlock; the business is legally possible because of that person.
- Form the **LLC** at the ND Secretary of State (FirstStop portal), get the **EIN** (free, IRS), open a dedicated business bank account, and carry **general liability + workers comp** (ND WSI, required once you have the apprentice as an employee).
- **Minnesota is a separate license** (MN DLI plumbing contractor + a $25k bond, with your master as the responsible individual). Serving the EGF / Western-MN side needs it. **Don't let MN licensing delay the ND launch** — start ND-only on the Grand Forks side, add MN when cash allows. The footer in `index.html` must not show an MN `#PC-` number until DLI actually issues one.

The `form-filler` workflow can drive the ND FirstStop LLC filing and the IRS EIN application with you when you're ready.

---

## 7. First 30 days, sequenced

The clock that matters: **it's mid-October and hard freeze is ~4–6 weeks out.** Frozen/burst pipes, no-heat water, and sump failures are the Valley plumber's gold rush, and they go to whoever is already visible and answers the phone. The entire goal of month one is to **be positioned before the first deep freeze.**

| Days | Move | Why now |
|---|---|---|
| 1–3 | LLC filed, EIN, business bank account, call Northern Plumbing Supply + Winnelson for trade accounts | Nothing bills until the entity and the parts pipeline exist |
| 1–5 | GL + workers comp bound; register the apprentice with the Board (30-day clock) | Legal to run the crew |
| 3–7 | Domain live (`ellingsonplumbing.com` DNS), 24-7 answering set so every call is answered | The brand promise has to be real before you spend on ads |
| 5–10 | FSM software set up with the pricebook loaded (`FSM-PRICEBOOK.csv`), payments + QuickBooks connected | The back end that turns a job into cash and a clean book |
| 7–14 | **Google Local Services Ads live** (Google Guaranteed) + GBP published + review link ready | The fastest paid tap for home-service leads; see `PIPELINE.md` |
| 7–21 | Overflow outreach: call every GC, HVAC co., property manager, and established plumber in Grand Forks — take the work they turn down | Near-zero-CAC jobs that fill the first weeks while reviews build |
| 14–30 | First 10 reviews seeded; membership offered on every ticket; Nextdoor/FB presence | The flywheel that makes month two cheaper than month one |

Full detail on finding and closing the first jobs is in **`PIPELINE.md`**.

---

*Sources (verify before relying on any figure): [ND Plumbing Board](https://www.ndplumbingboard.gov/faq) · [ServiceTitan ND plumbing licensing](https://www.servicetitan.com/licensing/plumbing/north-dakota) · [ND plumber license requirements 2026](https://contractorlicenserequirements.com/north-dakota/plumber-license-requirements/) · [Apprentice plumber wage ND (ZipRecruiter)](https://www.ziprecruiter.com/Salaries/Apprentice-Plumber-Salary--in-North-Dakota) · [Grand Forks plumbing cost guide](https://www.homeyou.com/nd/plumbing-repair-grand-forks-costs) · [Northern Plumbing Supply profile](https://incfact.com/company/northernplumbingsupply-grandforks-nd/).*

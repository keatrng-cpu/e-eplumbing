# Ellingson Plumbing — Valley shop book

Sept 2026 calibration. Win the click under Grand Forks / Fargo / East Grand Forks shops. Keep the ceiling on cash jobs. Diagnostic floor covers the truck.

**Rules**
- Quote includes trip, labor, and standard parts for that line unless noted.
- After-hours / weekend / holiday: **1.5×** the listed range (stated on the call, still quoted before work).
- Daytime emergency dispatch: **+$119–$199** on top of the repair (not stacked with 1.5×).
- If scope changes mid-job → stop and re-quote.
- Equipment installs (water heater, softener, sump): collect **30–50% deposit** before ordering.

The live estimator (`pricebook.js`) and this file stay in lockstep.

---

## Why these numbers (Valley, Sept 2026)

| Job | Local / regional market | Old live book | This book | Cashflow move |
|-----|-------------------------|---------------|-----------|---------------|
| Service call | GF $70–$200; repair-visit midpoint ~$311 | $89–$149 | **$129–$199** | Don’t race the $70 ads. Truck + first hour. Credited. |
| Daytime emergency | GF surcharge $95–$275; national call-out $150–$400 | $0 daytime / +$75–$150 night | **+$119–$199** daytime, **1.5×** nights | Old JS never multiplied nights. That was free overtime. |
| Isolate leak | EGF $112–$335 | $125–$225 | **$199–$349** | $125 lost money on a Fargo run. |
| Burst (accessible) | EGF $800–$3,198; after-hours $450–$1,400 | $350–$750 | **$549–$995** | Start under $800 to win the click. Night 1.5× = $824–$1,493. |
| Freeze thaw | Winter cash; Twin Cities nights higher | $275–$550 | **$379–$749** | Minus-thirty is the season. |
| Fixture clog | GF typical $216–$288; Fargo avg **$344** | $175–$275 | **$179–$289** | High stays under Fargo average. |
| Main auger | $250–$500 typical | $275–$450 | **$325–$549** | Floor covers truck + cable time. |
| Hydro jet | National $400–$1,500 | $450–$850 | **$549–$995** | Beat the $1,500 high, raise the floor. |
| WH labor (tank) | Fargo installed $850–$2,200, **avg $1,701** | Labor $650–$1,100 | **Labor $895–$1,495** | Unit extra. Installed still wins vs $1,701 avg. |
| WH repair | EGF $120–$600; Fargo avg $581 | $150–$350 | **$219–$429** | Middle with a real floor. |
| Sump replace | National $500–$1,200 | $450–$850 | **$595–$1,095** | Pump + labor. Melt-week margin. |
| Camera main | $150–$375 | $225–$375 | **$219–$349** | Cover the reel, win the click. |
| Home Team | was a $12 placeholder | $12/mo | **$29/mo · $279/yr** | Locked. Flush + sump test already retail ~$278. |

Sources used for the gauge: Grand Forks plumber-cost 2026 (call $70–$200, emergency $95–$275), East Grand Forks Today’s Homeowner (burst $800–$3,198, toilet $290–$774, WH install $774–$1,934), Fargo drain avg $344 / WH avg $1,701, Twin Cities / MN 2026 (service $70–$170, drain $95–$500), national 2026 emergency 1.5× and $150–$400 call-out.

---

## Diagnostic / trip

| Code | Job | Notes | Start range |
|------|-----|-------|-------------|
| DIAG-01 | Service call / diagnosis (credited if work approved) | 1st hour diagnostic | $129–$199 |
| DIAG-02 | Camera inspection (main line) | Video + findings | $219–$349 |
| DIAG-03 | Camera inspection (branch) | | $189–$295 |

---

## Emergency / leaks

| Code | Job | Notes | Start range |
|------|-----|-------|-------------|
| EMG-01 | Daytime emergency dispatch | On top of repair; not stacked with 1.5× | $119–$199 |
| EMG-02 | Shut-off / isolate leak | Temporary stop | $199–$349 |
| EMG-03 | Burst pipe repair (accessible copper/PEX) | Per location | $549–$995 |
| EMG-04 | Burst pipe repair (difficult access / slab approach) | Quote after assess | Time and materials or custom |
| EMG-05 | Freeze thaw (safe electric) + minor repair | | $379–$749 |

---

## Drains and sewer

| Code | Job | Notes | Start range |
|------|-----|-------|-------------|
| DRN-01 | Clear sink / lav / tub (auger) | | $179–$289 |
| DRN-02 | Clear toilet (auger) | | $179–$289 |
| DRN-03 | Main line clear (auger) | | $325–$549 |
| DRN-04 | Hydro jet residential main | After camera preferred | $549–$995 |
| DRN-05 | Cleanout install | | $395–$745 |

---

## Water heaters

| Code | Job | Notes | Start range |
|------|-----|-------|-------------|
| WH-01 | Tank WH replace (like-for-like, standard) | Unit extra or package | Labor $895–$1,495 |
| WH-02 | Tank WH replace (expansion tank, pan, code upgrades) | | Labor $995–$1,695 |
| WH-03 | Tankless install (standard) | Venting varies widely | Custom quote |
| WH-04 | Water heater flush / maintenance | Member price lower | $149–$219 |
| WH-05 | T and P valve / anode / element service | | $219–$429 |

---

## Sump and flood

| Code | Job | Notes | Start range |
|------|-----|-------|-------------|
| SMP-01 | Sump pump replace (primary) | Pump + labor | $595–$1,095 |
| SMP-02 | Battery backup sump add-on | | $645–$1,095 |
| SMP-03 | Check valve / discharge repair | | $219–$395 |
| SMP-04 | Sump system test + service | Seasonal | $129–$199 |

---

## Fixtures and valves

| Code | Job | Notes | Start range |
|------|-----|-------|-------------|
| FIX-01 | Toilet replace (standard) | Customer or our fixture | $249–$449 labor |
| FIX-02 | Faucet replace (kitchen/bath) | | $199–$365 labor |
| FIX-03 | Supply stop replace | | $149–$249 |
| FIX-04 | Garbage disposal replace | | $249–$399 labor |
| FIX-05 | Shower valve cartridge | Brand-dependent | $249–$495 |

---

## Softeners and filtration

| Code | Job | Notes | Start range |
|------|-----|-------|-------------|
| SFT-01 | Softener install (standard) | Unit + labor package | Custom |
| SFT-02 | Softener service / resin check | | $169–$259 |
| SFT-03 | Iron filter / RO under-sink | | Custom |

---

## Remodel / rough-in (minimums)

Always custom after site visit. Ballpark only for phone screening.

| Code | Job | Notes |
|------|-----|-------|
| RMI-01 | Basement bath rough-in | Site visit required |
| RMI-02 | Kitchen re-pipe / relocate | Site visit required |
| RMI-03 | Fixture package install | Per print |

---

## Commercial / backflow

| Code | Job | Notes |
|------|-----|-------|
| COM-01 | Backflow test | Per device; file records |
| COM-02 | Backflow rebuild/replace | Quote after assess |
| COM-03 | Service contract | Monthly/annual custom |

---

## Home Team Plan (locked)

| Tier | Monthly | Annual | Includes |
|------|---------|--------|----------|
| Home Team | **$29/mo** | **$279/yr** (save $69) | Annual inspection, WH flush, pre-melt sump test, priority scheduling, 10% off repairs |

Flush + sump test already retail ~$278. Annual prepaid fills the slow weeks and keeps the repair call on this truck. Change `index.html` and this file together if COGS moves.

---

## Import into Jobber

1. Create product/service categories matching the codes above.
2. Add each line as a **fixed-price** item.
3. Attach after-hours as a 1.5× price list, not a surprise line.
4. Train: always present 2 options when a good/better path exists.

*Revise this file after the first 20 sold jobs with actual closed prices.*

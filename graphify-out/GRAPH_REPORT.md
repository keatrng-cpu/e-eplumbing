# Graph Report - e-eplumbing  (2026-10-21)

## Corpus Check
- 71 files · ~1,181,843 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .css 3, (none) 2, .example 1)

## Summary
- 359 nodes · 444 edges · 66 communities (25 shown, 41 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7b686b3b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- E&E Plumbing — Business Launch Plan
- mem.py
- app.js
- schedule.js
- E&E Plumbing — Operations Playbook
- Ellingson Plumbing — Valley shop book
- package.json
- E&E Message Templates
- Google Business Profile — Ellingson Plumbing
- AGENTS.md
- ee-chat.js
- North Fork Plumbing Co. — launch runbook
- E&E Marketing Kit
- North Fork Plumbing Co.
- Jobber Setup Checklist (E&E)
- NOW — e-eplumbing current truth
- The 10 improvements
- CLAUDE.md
- GROK.md
- submission-created.js
- scenes.js
- build
- book.js
- HELIX desk run — Ellingson Plumbing
- Forge Atlas / Forge Command registration — e-eplumbing
- checkout.js
- DECISIONS — e-eplumbing (append-only)

## God Nodes (most connected - your core abstractions)
1. `render()` - 13 edges
2. `Ellingson Plumbing — Valley shop book` - 13 edges
3. `play()` - 11 edges
4. `E&E Plumbing — Business Launch Plan` - 11 edges
5. `E&E Plumbing — Operations Playbook` - 11 edges
6. `The 10 improvements` - 11 edges
7. `HELIX desk run — Ellingson Plumbing` - 9 edges
8. `E&E Message Templates` - 9 edges
9. `sh()` - 8 edges
10. `post_commit()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `2026-10-18 — Order flow v2: one state object, scope picker, dispatch-grade intake` --references--> `renderQuote()`  [INFERRED]
  ai/DECISIONS.md → app.js
- `Known facts / constraints` --references--> `validate()`  [INFERRED]
  ai/NOW.md → app.js
- `2026-10-18 — Order flow v2: one state object, scope picker, dispatch-grade intake` --references--> `render()`  [INFERRED]
  ai/DECISIONS.md → app.js
- `2026-10-13 — auto-memory protocol adopted` --references--> `graph()`  [INFERRED]
  ai/DECISIONS.md → ai/memory/mem.py
- `1. Make the form submit what the customer actually chose` --references--> `renderQuote()`  [INFERRED]
  ORDER-FLOW-AUDIT.md → app.js

## Import Cycles
- None detected.

## Communities (66 total, 41 thin omitted)

### Community 0 - "E&E Plumbing — Business Launch Plan"
Cohesion: 0.08
Nodes (23): 10. Immediate Next Actions (this week), 1. Vision & Positioning, 2. Legal & Licensing Foundation (Non-negotiable), 3. Service Order Flow (The Core Machine), 4. Technology Stack (Start lean), 5. Pricing Philosophy, 6. Marketing & Lead Engine, 7. 90-Day Execution Roadmap (+15 more)

### Community 1 - "mem.py"
Cohesion: 0.23
Nodes (15): build(), changed(), context(), gbin(), graph(), install_hook(), last_decisions(), post_commit() (+7 more)

### Community 2 - "app.js"
Cohesion: 0.11
Nodes (35): baseEstimate(), chip(), clearError(), currentEstimate(), ensurePanel(), esc(), fieldError(), loadAvailability() (+27 more)

### Community 3 - "schedule.js"
Cohesion: 0.18
Nodes (18): schedule, store, hold(), readFill(), sb(), schedule, usingSupabase(), @netlify/blobs (+10 more)

### Community 4 - "E&E Plumbing — Operations Playbook"
Cohesion: 0.12
Nodes (16): 10. Weekly Operating Rhythm, 1. Phone & Form Intake Script, 2. The E&E Standard (every job), 3. Flat-Rate Quoting Rules, 4. Dispatch & Truck Standards, 5. Payment & Invoicing, 6. Review & Reputation Loop, 7. Home Team Plan (membership) (+8 more)

### Community 5 - "Ellingson Plumbing — Valley shop book"
Cohesion: 0.14
Nodes (13): Commercial / backflow, Diagnostic / trip, Drains and sewer, Ellingson Plumbing — Valley shop book, Emergency / leaks, Fixtures and valves, Home Team Plan (locked), Import into Jobber (+5 more)

### Community 6 - "package.json"
Cohesion: 0.33
Nodes (5): dependencies, @netlify/blobs, description, name, private

### Community 7 - "E&E Message Templates"
Cohesion: 0.20
Nodes (9): After-hours disclosure, Appointment confirmation (SMS), E&E Message Templates, Invoice, Lead callback (phone), Membership pitch (end of job), On-my-way, Quote follow-up (if not approved on site) (+1 more)

### Community 8 - "Google Business Profile — Ellingson Plumbing"
Cohesion: 0.22
Nodes (8): Business identity, Description (under 750 characters), First 4 posts, Google Business Profile — Ellingson Plumbing, Hours, Review replies, Service areas, Services to add

### Community 9 - "AGENTS.md"
Cohesion: 0.25
Nodes (6): Architecture, Brand, Known placeholders (intentional, pre-launch), Memory protocol (auto, every task — do not wait to be asked), Netlify, What this is

### Community 10 - "ee-chat.js"
Cohesion: 0.50
Nodes (6): addBubble(), handleUser(), match(), openChat(), reply(), setChips()

### Community 11 - "North Fork Plumbing Co. — launch runbook"
Cohesion: 0.25
Nodes (7): 1. Netlify (this repo), 2. Custom domain, 3. Form email + SMS, 4. Google Business Profile, 5. Minnesota contractor number, 6. Home Team price (locked), North Fork Plumbing Co. — launch runbook

### Community 12 - "E&E Marketing Kit"
Cohesion: 0.29
Nodes (6): E&E Marketing Kit, Partner outreach (email), Referral program, Review request (text / SMS), Social posts (Nextdoor / Facebook), Truck / yard sign lines

### Community 13 - "North Fork Plumbing Co."
Cohesion: 0.29
Nodes (6): Brand, Launch checklist (remaining), North Fork Plumbing Co., Repo map, What this is (and is not), You own

### Community 14 - "Jobber Setup Checklist (E&E)"
Cohesion: 0.33
Nodes (5): Day 1 setup, Jobber Setup Checklist (E&E), Lead flow (recommended), Netlify form → Jobber, Weekly owner review in Jobber

### Community 15 - "NOW — e-eplumbing current truth"
Cohesion: 0.40
Nodes (4): Goal, In flight, Known facts / constraints, NOW — e-eplumbing current truth

### Community 16 - "The 10 improvements"
Cohesion: 0.09
Nodes (21): 10. Close the loop after submit, 2. Collect the service address, 3. Two-tap job picker that reaches the real pricebook, 4. Let them send a photo, 5. Job-specific follow-up questions, 6. Access and arrival details, 7. Arrival windows, not just dates, 8. Stop leading with $1,493 (+13 more)

### Community 19 - "submission-created.js"
Cohesion: 0.53
Nodes (5): FIELDS, handler(), sendSms(), sms(), ticket()

### Community 20 - "scenes.js"
Cohesion: 0.21
Nodes (15): cancel(), el(), load(), overlay(), play(), boil(), sa(), show() (+7 more)

### Community 21 - "build"
Cohesion: 0.35
Nodes (10): build(), at(), enter(), intro(), play(), show(), tipAgain(), go() (+2 more)

### Community 22 - "book.js"
Cohesion: 0.25
Nodes (8): handler(), json(), makeRef(), pricebook, schedule, store, estimate(), isAfterHours()

### Community 23 - "HELIX desk run — Ellingson Plumbing"
Cohesion: 0.20
Nodes (9): Brain — what this business actually is, HELIX desk run — Ellingson Plumbing, Money — nothing to collect yet, Offers — one price list, two unbuilt products, Operate — the playbook is good and entirely manual, Pipeline — there is no pipeline yet, Risk — the name, Roadmap — the order Helix would run it (+1 more)

### Community 24 - "Forge Atlas / Forge Command registration — e-eplumbing"
Cohesion: 0.22
Nodes (8): 1. `config/sites.json` — two entries, not one, 2. Site health — already captured, two flags, 3. `data/ideas.json` — enhancement queue, 4. Income — a gap in Forge Command, not a row to paste, 4b. Two build bugs found while running Forge Command locally, 5. Atlas graph notes, 6. Status — what shipped 2026-10-18, Forge Atlas / Forge Command registration — e-eplumbing

### Community 25 - "checkout.js"
Cohesion: 0.67
Nodes (3): handler(), json(), PLANS

### Community 64 - "DECISIONS — e-eplumbing (append-only)"
Cohesion: 0.25
Nodes (7): 2026-10-13 — auto-memory protocol adopted, 2026-10-18 — Analytics, Home Team Plan checkout, Supabase calendar; run through Forge Command and HELIX, 2026-10-18 — Order flow v2: one state object, scope picker, dispatch-grade intake, 2026-10-19 — North Fork production identity, 2026-10-21 — Job hints and diagnostic-priced additions, 2026-10-21 — Scenes wired to jobs; shorter ticket, DECISIONS — e-eplumbing (append-only)

## Knowledge Gaps
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `renderQuote()` connect `app.js` to `DECISIONS — e-eplumbing (append-only)`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `play()` (e.g. with `scenes.js` and `tick()`) actually correct?**
  _`play()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `E&E Plumbing — Business Launch Plan` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Why does `2026-10-18 — Order flow v2: one state object, scope picker, dispatch-grade intake` connect `DECISIONS — e-eplumbing (append-only)` to `app.js`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10796221322537113 - nodes in this community are weakly interconnected._
- **Should `E&E Plumbing — Operations Playbook` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Ellingson Plumbing — Valley shop book` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
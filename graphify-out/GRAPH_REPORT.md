# Graph Report - e-eplumbing  (2026-10-13)

## Corpus Check
- 24 files · ~15,958 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .css 2, .toml 1)

## Summary
- 205 nodes · 260 edges · 20 communities (16 shown, 4 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `171224dd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- E&E Plumbing — Business Launch Plan
- mem.py
- app.js
- schedule.js
- E&E Plumbing — Operations Playbook
- Ellingson Plumbing — Valley shop book
- availability.js
- E&E Message Templates
- Google Business Profile — Ellingson Plumbing
- AGENTS.md
- ee-chat.js
- Ellingson Plumbing — launch runbook
- E&E Marketing Kit
- Ellingson Plumbing
- Jobber Setup Checklist (E&E)
- NOW — e-eplumbing current truth
- 2026-10-13 — auto-memory protocol adopted
- CLAUDE.md
- GROK.md

## God Nodes (most connected - your core abstractions)
1. `Ellingson Plumbing — Valley shop book` - 13 edges
2. `E&E Plumbing — Business Launch Plan` - 11 edges
3. `E&E Plumbing — Operations Playbook` - 11 edges
4. `E&E Message Templates` - 9 edges
5. `sh()` - 8 edges
6. `post_commit()` - 8 edges
7. `Google Business Profile — Ellingson Plumbing` - 8 edges
8. `dayOptions()` - 7 edges
9. `Ellingson Plumbing — launch runbook` - 7 edges
10. `slice_()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `2026-10-13 — auto-memory protocol adopted` --references--> `graph()`  [INFERRED]
  ai/DECISIONS.md → ai/memory/mem.py
- `handler()` --calls--> `estimate()`  [EXTRACTED]
  netlify/functions/book.js → pricebook.js
- `handler()` --calls--> `firstOpenDay()`  [EXTRACTED]
  netlify/functions/book.js → schedule.js
- `handler()` --calls--> `isWorkday()`  [EXTRACTED]
  netlify/functions/book.js → schedule.js

## Import Cycles
- None detected.

## Communities (20 total, 4 thin omitted)

### Community 0 - "E&E Plumbing — Business Launch Plan"
Cohesion: 0.08
Nodes (23): 10. Immediate Next Actions (this week), 1. Vision & Positioning, 2. Legal & Licensing Foundation (Non-negotiable), 3. Service Order Flow (The Core Machine), 4. Technology Stack (Start lean), 5. Pricing Philosophy, 6. Marketing & Lead Engine, 7. 90-Day Execution Roadmap (+15 more)

### Community 1 - "mem.py"
Cohesion: 0.23
Nodes (15): build(), changed(), context(), gbin(), graph(), install_hook(), last_decisions(), post_commit() (+7 more)

### Community 2 - "app.js"
Cohesion: 0.19
Nodes (14): holdSlot(), loadAvailability(), pickJob(), pill(), priced(), readTruck(), renderDays(), renderPills() (+6 more)

### Community 3 - "schedule.js"
Cohesion: 0.18
Nodes (15): { getStore }, handler(), pricebook, schedule, estimate(), isAfterHours(), dayOptions(), firstOpenDay() (+7 more)

### Community 4 - "E&E Plumbing — Operations Playbook"
Cohesion: 0.12
Nodes (16): 10. Weekly Operating Rhythm, 1. Phone & Form Intake Script, 2. The E&E Standard (every job), 3. Flat-Rate Quoting Rules, 4. Dispatch & Truck Standards, 5. Payment & Invoicing, 6. Review & Reputation Loop, 7. Home Team Plan (membership) (+8 more)

### Community 5 - "Ellingson Plumbing — Valley shop book"
Cohesion: 0.14
Nodes (13): Commercial / backflow, Diagnostic / trip, Drains and sewer, Ellingson Plumbing — Valley shop book, Emergency / leaks, Fixtures and valves, Home Team Plan (locked), Import into Jobber (+5 more)

### Community 6 - "availability.js"
Cohesion: 0.18
Nodes (8): { getStore }, schedule, dependencies, @netlify/blobs, description, name, private, @netlify/blobs

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

### Community 11 - "Ellingson Plumbing — launch runbook"
Cohesion: 0.25
Nodes (7): 1. Netlify (this repo), 2. Custom domain, 3. Form email + SMS, 4. Google Business Profile, 5. Minnesota contractor number, 6. Home Team price (locked), Ellingson Plumbing — launch runbook

### Community 12 - "E&E Marketing Kit"
Cohesion: 0.29
Nodes (6): E&E Marketing Kit, Partner outreach (email), Referral program, Review request (text / SMS), Social posts (Nextdoor / Facebook), Truck / yard sign lines

### Community 13 - "Ellingson Plumbing"
Cohesion: 0.29
Nodes (6): Brand, Ellingson Plumbing, Launch checklist (remaining), Repo map, What this is (and is not), You own

### Community 14 - "Jobber Setup Checklist (E&E)"
Cohesion: 0.33
Nodes (5): Day 1 setup, Jobber Setup Checklist (E&E), Lead flow (recommended), Netlify form → Jobber, Weekly owner review in Jobber

### Community 15 - "NOW — e-eplumbing current truth"
Cohesion: 0.40
Nodes (4): Goal, In flight, Known facts / constraints, NOW — e-eplumbing current truth

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@netlify/blobs` connect `availability.js` to `schedule.js`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Should `E&E Plumbing — Business Launch Plan` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `E&E Plumbing — Operations Playbook` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Ellingson Plumbing — Valley shop book` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
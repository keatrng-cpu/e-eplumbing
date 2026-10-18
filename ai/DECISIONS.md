# DECISIONS — e-eplumbing (append-only)

Newest last. Never edit or delete entries.

## 2026-10-13 — auto-memory protocol adopted
Agents (Claude Code via hooks, Grok/Codex via AGENTS.md / .grok/GROK.md) read `ai/NOW.md` + a graph slice at task start and update NOW/DECISIONS at task end; graph refresh by post-commit hook and the `graphify-refresh` Action (writes only to the `graph` branch). Why: shared memory without being asked, low token use (graph query, not GRAPH_REPORT).

## 2026-10-18 — mascot motion style preview (branch mascot-motion)
Hand-built centerline SVG mascot + vanilla WAAPI scene engine instead of GSAP/Lottie/Figma: zero deps, fits static site, brand-locked palette. Scenes keyed per pricebook option (fallback JOBS id) so every posted job gets a confirmation; confirmations run on thanks.html via query params because live submits redirect. New Fixture install service + DIAG-02/03 copied exactly from PRICEBOOK.md; shower/tub custom.

## 2026-10-18 — v4 ink mascot + lazy scenes
Replaced the centerline mascot and WAAPI scene engine with pre-rendered ink drawings (Python generator, limited animation at 12fps). Why: the approved ink/marker look (variable brush, hatching, spot blacks, boil) can't be done with stroked paths cheaply at runtime. Weight: scenes load only after submit (one data file per job, 100–200KB gz), hero frames load after window load. Hero strip moved into the hero's top padding so it is in the first screen at 1440x900 without moving the H1/CTAs/booking card.

- 2026-10-18 v5: scene data gains cams/c (per-frame viewBox) and ins/i (punch-in insets). Insets are explicit per scene (INS in scenes4.py); auto insets were tried and read as noise, so they're off. Sump scenes keep the pit in frame, so they read smaller.

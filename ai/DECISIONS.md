# DECISIONS — e-eplumbing (append-only)

Newest last. Never edit or delete entries.

## 2026-10-13 — auto-memory protocol adopted
Agents (Claude Code via hooks, Grok/Codex via AGENTS.md / .grok/GROK.md) read `ai/NOW.md` + a graph slice at task start and update NOW/DECISIONS at task end; graph refresh by post-commit hook and the `graphify-refresh` Action (writes only to the `graph` branch). Why: shared memory without being asked, low token use (graph query, not GRAPH_REPORT).

## 2026-10-18 — mascot motion style preview (branch mascot-motion)
Hand-built centerline SVG mascot + vanilla WAAPI scene engine instead of GSAP/Lottie/Figma: zero deps, fits static site, brand-locked palette. Scenes keyed per pricebook option (fallback JOBS id) so every posted job gets a confirmation; confirmations run on thanks.html via query params because live submits redirect. New Fixture install service + DIAG-02/03 copied exactly from PRICEBOOK.md; shower/tub custom.

## 2026-10-18 — v4 ink mascot + lazy scenes
Replaced the centerline mascot and WAAPI scene engine with pre-rendered ink drawings (Python generator, limited animation at 12fps). Why: the approved ink/marker look (variable brush, hatching, spot blacks, boil) can't be done with stroked paths cheaply at runtime. Weight: scenes load only after submit (one data file per job, 100–200KB gz), hero frames load after window load. Hero strip moved into the hero's top padding so it is in the first screen at 1440x900 without moving the H1/CTAs/booking card.

- 2026-10-18 v5: scene data gains cams/c (per-frame viewBox) and ins/i (punch-in insets). Insets are explicit per scene (INS in scenes4.py); auto insets were tried and read as noise, so they're off. Sump scenes keep the pit in frame, so they read smaller.

## 2026-10-18 — v7 mascot: plain-ink cap, locked-camera keyframes, illustrated hero
Keaton's sign mascot wears a cap, not a fedora; he wants no color on the mascot, pro tool order with handoff frames, and 6-9 frames per scene with a locked camera. Clog and shutoff are redone on v7; the remaining scenes stay v6 until regenerated in batches (generation drift needs frame-by-frame review). Hero switched to illustrated raster frames on the existing vector stage to keep the walk-in without a framework.

## 2026-10-18 — v7 batch 2 verified and pushed (burst, mainline, cambranch, sink)
Verified the four batch-2 scenes (sizes under 250KB, gallery plays with no console errors, homepage 0 scene requests, reduced motion fetches only the end frame) and pushed them as-is. Art nits are logged in NOW instead of regenerating, because this pass was integration only and each regen needs another frame-by-frame review.

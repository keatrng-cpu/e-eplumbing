# DECISIONS — e-eplumbing (append-only)

Newest last. Never edit or delete entries.

## 2026-10-13 — auto-memory protocol adopted
Agents (Claude Code via hooks, Grok/Codex via AGENTS.md / .grok/GROK.md) read `ai/NOW.md` + a graph slice at task start and update NOW/DECISIONS at task end; graph refresh by post-commit hook and the `graphify-refresh` Action (writes only to the `graph` branch). Why: shared memory without being asked, low token use (graph query, not GRAPH_REPORT).

## 2026-10-18 — mascot motion style preview (branch mascot-motion)
Hand-built centerline SVG mascot + vanilla WAAPI scene engine instead of GSAP/Lottie/Figma: zero deps, fits static site, brand-locked palette. Scenes keyed per pricebook option (fallback JOBS id) so every posted job gets a confirmation; confirmations run on thanks.html via query params because live submits redirect. New Fixture install service + DIAG-02/03 copied exactly from PRICEBOOK.md; shower/tub custom.

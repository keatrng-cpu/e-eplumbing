# DECISIONS — e-eplumbing (append-only)

Newest last. Never edit or delete entries.

## 2026-10-13 — auto-memory protocol adopted
Agents (Claude Code via hooks, Grok/Codex via AGENTS.md / .grok/GROK.md) read `ai/NOW.md` + a graph slice at task start and update NOW/DECISIONS at task end; graph refresh by post-commit hook and the `graphify-refresh` Action (writes only to the `graph` branch). Why: shared memory without being asked, low token use (graph query, not GRAPH_REPORT).

## 2026-10-18 — Order flow v2: one state object, scope picker, dispatch-grade intake

Rebuilt the booking card after probing the live site and finding the submitted payload
contradicted itself. Three root causes: the urgency radios had no listener and were
overwritten by `renderQuote()`; the service `<select>` was reset from `state.job.service`
on every render, silently discarding the customer's choice; and `optionIndex` was
hardcoded one-per-pill, so the UI could reach 10 of ~25 pricebook line items and priced
every drain call as a sink auger.

Why this shape:
- **One `state`, one `render()`, listeners on every control.** The old code derived
  urgency from the rail and wrote back into controls the customer had touched. The form
  elements are now canonical (the `<select>` and the radios), chips are enhancement, so
  the form still submits something coherent with JS off.
- **Two-tap scope picker** over a longer pill list — reaches every pricebook option and
  keeps the first tap as fast as it was.
- **No job selected at boot.** Previously a cold visitor saw `$824–$1,493` for a burst
  pipe they never picked. The 1.5× after-hours line is now itemised rather than buried
  inside one range.
- **Address, photo, job-specific questions, access details** — the form now asks what
  OPERATIONS.md §1 already scripts for the phone, so the callback confirms instead of
  interrogating. Answers serialize into a hidden `details` field, so Netlify Forms needs
  no schema change.
- **Never auto-select a day.** The old grid picked tomorrow on the customer's behalf and
  `book.js` could silently move it; the move is now surfaced in the UI.
- ZIP is prefill-only and never rejects anyone — a wrong ZIP in a hand-written map would
  turn away a real customer, so an unmatched ZIP is accepted silently.
- Geolocation attaches a Google Maps pin rather than reverse-geocoding; no API key, and
  a tappable pin is more use to a driver than a guessed street. Needed
  `Permissions-Policy: geolocation=(self)` in `netlify.toml`.
- `submission-created.js` sends the full dispatch ticket plus a one-SMS summary; it
  previously only `console.log`ed when `NOTIFY_WEBHOOK` was unset.

Also written: `ORDER-FLOW-AUDIT.md` (findings + build order), `FORGE-ATLAS.md`
(registration payload for Forge Command), `HELIX-ASSESSMENT.md` (Helix desk run).

Not done, and owner-side: the parked `ellingsonplumbing.com` canonical, the zero-submission
form test, and the MN name collision. Those three outrank every code change here.

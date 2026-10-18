// POST /.netlify/functions/book
// Body: { service, optionIndex, urgency, day, window, asap }
//
// This does NOT record the lead — the visible <form> still submits to Netlify
// Forms for that (name="service-request"), which is what puts it in front of
// the office exactly the way OPERATIONS.md describes. This function does the
// two things a static form cannot:
//
//   1. Re-price server-side, so a hand-edited request cannot change the number
//      the shop is bound to.
//   2. Claim the calendar slot atomically, so two visitors cannot both land a
//      day's last opening — the loser is moved to the next open day and the UI
//      is told, rather than the date changing silently.
//
// Emergencies never touch the calendar: a burst pipe is dispatched the same
// day regardless of how full the scheduled board is.
const pricebook = require("../../pricebook.js");
const store = require("./_schedule-store.js");

function json(statusCode, body) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}

/** Short, human-quotable reference. Not a secret and not a primary key. */
function makeRef() {
  return (
    "EP-" +
    Date.now().toString(36).toUpperCase().slice(-5) +
    Math.floor(Math.random() * 36).toString(36).toUpperCase()
  );
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, error: "Bad request" });
  }

  const service = typeof data.service === "string" ? data.service : "";
  const optionIndex = Number.isInteger(data.optionIndex) ? data.optionIndex : 0;
  const urgency = typeof data.urgency === "string" ? data.urgency : "";
  const arrivalWindow = typeof data.window === "string" ? data.window : "First available";
  const priced = pricebook.estimate(service, optionIndex, urgency);
  const ref = makeRef();

  if (urgency === "Emergency — now") {
    return json(200, {
      ok: true,
      ref,
      emergency: true,
      confirmedDay: null,
      window: "60–120 min target",
      range: priced.range,
      notes: priced.notes,
    });
  }

  const need = priced.slots || 2;
  const requested = typeof data.day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.day) ? data.day : null;
  const wantsAsap = Boolean(data.asap) || !requested;

  try {
    const held = await store.hold({
      ref,
      need,
      day: wantsAsap ? null : requested,
      service,
      scope: (pricebook.SERVICES[service]?.options?.[optionIndex] || {}).label || "",
      arrival: arrivalWindow,
    });

    return json(200, {
      ok: true,
      ref,
      emergency: false,
      confirmedDay: held.day,
      dayChanged: held.dayChanged,
      window: arrivalWindow,
      range: priced.range,
      notes: held.day
        ? priced.notes
        : priced.notes.concat(["We're booked out on the calendar — we'll call to work something out."]),
    });
  } catch (err) {
    console.error("[book] hold failed:", err);
    // The slot hold is a nice-to-have; the lead itself is not. The Netlify
    // Forms submission still goes through with whatever date the visitor
    // picked. Fail open, not closed.
    return json(200, {
      ok: true,
      ref,
      emergency: false,
      confirmedDay: requested,
      dayChanged: false,
      window: arrivalWindow,
      range: priced.range,
      notes: priced.notes.concat(["We'll confirm the exact date by phone or text."]),
    });
  }
};

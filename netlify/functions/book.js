// POST /.netlify/functions/book
// Body: { service, optionIndex, urgency, day, asap }
//
// This does NOT record the lead — the visible <form> still submits to
// Netlify Forms for that (name="service-request"), which is what puts it in
// front of the office exactly the way OPERATIONS.md already describes. This
// function's only job is the part a static form can't do on its own:
// (1) recompute the price server-side so a hand-edited request can't change
//     the number the office is bound to, and
// (2) hold the calendar slot atomically-ish so two visitors can't both land
//     the same day's last opening, bumping the loser to the next open day
//     the same way pickitupe's booking flow does.
//
// Emergencies never touch the calendar: a burst pipe gets dispatched the
// same day regardless of how full the scheduled board is, so `urgency ===
// "Emergency — now"` returns immediately with no slot consumed.
const { getStore } = require("@netlify/blobs");
const pricebook = require("../../pricebook.js");
const schedule = require("../../schedule.js");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Bad request" }) };
  }

  const service = typeof data.service === "string" ? data.service : "";
  const optionIndex = Number.isInteger(data.optionIndex) ? data.optionIndex : 0;
  const urgency = typeof data.urgency === "string" ? data.urgency : "";
  const priced = pricebook.estimate(service, optionIndex, urgency);

  // Emergency: no calendar slot to reserve — the on-call plumber is
  // dispatched today regardless of the scheduled board.
  if (urgency === "Emergency — now") {
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ok: true,
        emergency: true,
        confirmedDay: null,
        range: priced.range,
        notes: priced.notes,
      }),
    };
  }

  const need = priced.slots || 2;
  const store = getStore("ee-schedule");

  try {
    const fill = (await store.get("fill", { type: "json" })) || [];
    const requested = typeof data.day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.day) ? data.day : null;
    const wantsAsap = Boolean(data.asap) || !requested;

    let confirmedDay = null;
    if (!wantsAsap && requested && schedule.isWorkday(requested)) {
      const entry = fill.find((f) => f.day === requested);
      const used = entry ? entry.used : 0;
      if (schedule.DAILY_SLOTS - used >= need) confirmedDay = requested;
    }
    const dayChanged = Boolean(requested) && confirmedDay !== requested;
    if (!confirmedDay) {
      confirmedDay = schedule.firstOpenDay(fill, need);
    }

    if (confirmedDay) {
      const idx = fill.findIndex((f) => f.day === confirmedDay);
      if (idx >= 0) fill[idx] = { day: confirmedDay, used: fill[idx].used + need };
      else fill.push({ day: confirmedDay, used: need });
      await store.setJSON("fill", fill);
    }

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ok: true,
        emergency: false,
        confirmedDay,
        dayChanged,
        range: priced.range,
        notes: priced.notes,
      }),
    };
  } catch (err) {
    console.error("[book] failed:", err);
    // Booking the calendar slot is a nice-to-have, not the lead itself — the
    // Netlify Forms submission still goes through with whatever date the
    // visitor picked. Fail open, not closed.
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ok: true,
        emergency: false,
        confirmedDay: data.day || null,
        dayChanged: false,
        range: priced.range,
        notes: priced.notes.concat(["We'll confirm the exact date by phone or text."]),
      }),
    };
  }
};

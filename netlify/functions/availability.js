// GET /.netlify/functions/availability
// How full the next few weeks already are, so the browser can gray out full
// days before the visitor has even picked a service.
//
// Backend is Supabase when it is configured, Netlify Blobs otherwise — see
// _schedule-store.js.
const schedule = require("../../schedule.js");
const store = require("./_schedule-store.js");

exports.handler = async () => {
  const headers = { "content-type": "application/json", "cache-control": "no-store" };
  try {
    const fill = await store.readFill();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ fill, dailySlots: schedule.DAILY_SLOTS, backend: store.usingSupabase() ? "supabase" : "blobs" }),
    };
  } catch (err) {
    // Never break the booking form over a storage hiccup. An empty fill shows
    // every day as open, which is the same as "we don't know yet" — the office
    // confirms the date by phone regardless.
    console.error("[availability] failed:", err);
    return { statusCode: 200, headers, body: JSON.stringify({ fill: [], dailySlots: schedule.DAILY_SLOTS }) };
  }
};

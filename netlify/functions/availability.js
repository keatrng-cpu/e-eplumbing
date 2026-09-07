// GET /.netlify/functions/availability
// Returns how full the next few weeks already are so the browser can gray
// out full days before the visitor even picks a service. netlify/functions
// gets its own dependency resolution from the nearest package.json (repo
// root here), independent of the static-site publish step in netlify.toml.
const { getStore } = require("@netlify/blobs");
const schedule = require("../../schedule.js");

exports.handler = async () => {
  try {
    const store = getStore("ee-schedule");
    const fill = (await store.get("fill", { type: "json" })) || [];
    return {
      statusCode: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
      body: JSON.stringify({ fill, dailySlots: schedule.DAILY_SLOTS }),
    };
  } catch (err) {
    // Never break the booking form over a Blobs hiccup — an empty fill just
    // means every day shows open, which is the same as "we don't know yet."
    console.error("[availability] failed:", err);
    return {
      statusCode: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
      body: JSON.stringify({ fill: [], dailySlots: schedule.DAILY_SLOTS }),
    };
  }
};

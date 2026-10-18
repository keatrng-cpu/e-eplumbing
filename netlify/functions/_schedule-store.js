/**
 * Calendar backend, with two implementations behind one interface.
 *
 * Supabase (preferred) — used when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * are both set. Holds are rows keyed by the customer's reference number and
 * claimed through ee_hold_slot(), which takes an advisory lock, so two
 * visitors cannot both take a day's last opening and a cancelled job gives its
 * slot back. Schema: supabase/001_schedule.sql.
 *
 * Netlify Blobs (fallback) — the original single-blob counter. It read,
 * modified and wrote the whole fill list, so concurrent submits can oversell a
 * day, and a hold has no identity so it can never be released. Kept so the
 * site keeps working before the database is provisioned; it is not the target
 * state.
 *
 * The service-role key bypasses RLS. It is read from the environment inside a
 * Netlify function and must never reach the browser.
 */
const schedule = require("../../schedule.js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function usingSupabase() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

async function sb(path, init) {
  const res = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...(init && init.headers),
    },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`supabase ${res.status}: ${detail.slice(0, 200)}`);
  }
  return res.json();
}

/** [{ day: "YYYY-MM-DD", used: n }] — the shape schedule.js already expects. */
async function readFill() {
  if (usingSupabase()) {
    const rows = await sb("ee_fill?select=day,used", { method: "GET" });
    return rows.map((r) => ({ day: r.day, used: Number(r.used) || 0 }));
  }
  const { getStore } = require("@netlify/blobs");
  const store = getStore("ee-schedule");
  return (await store.get("fill", { type: "json" })) || [];
}

/**
 * Claim `need` slots. Returns { day, dayChanged } — `day` is null when the
 * calendar is full to the horizon, which is not an error: the lead still
 * reaches the office either way.
 */
async function hold({ ref, need, day, service, scope, arrival }) {
  if (usingSupabase()) {
    const rows = await sb("rpc/ee_hold_slot", {
      method: "POST",
      body: JSON.stringify({
        p_ref: ref,
        p_need: need,
        p_day: day || null,
        p_service: service || "",
        p_scope: scope || "",
        p_arrival: arrival || "",
      }),
    });
    const r = Array.isArray(rows) ? rows[0] : rows;
    return { day: r?.day || null, dayChanged: Boolean(r?.day_changed) };
  }

  // Blobs fallback: read-modify-write, racy by construction. See the header.
  const { getStore } = require("@netlify/blobs");
  const store = getStore("ee-schedule");
  const fill = (await store.get("fill", { type: "json" })) || [];

  let confirmed = null;
  if (day && schedule.isWorkday(day)) {
    const entry = fill.find((f) => f.day === day);
    if (schedule.DAILY_SLOTS - (entry ? entry.used : 0) >= need) confirmed = day;
  }
  if (!confirmed) confirmed = schedule.firstOpenDay(fill, need);

  if (confirmed) {
    const i = fill.findIndex((f) => f.day === confirmed);
    if (i >= 0) fill[i] = { day: confirmed, used: fill[i].used + need };
    else fill.push({ day: confirmed, used: need });
    await store.setJSON("fill", fill);
  }
  return { day: confirmed, dayChanged: Boolean(day) && confirmed !== day };
}

module.exports = { readFill, hold, usingSupabase };

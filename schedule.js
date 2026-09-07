/**
 * Calendar / capacity logic for the "Pick a day" scheduler.
 *
 * Isomorphic (see pricebook.js for why): the browser uses this to gray out
 * full days as soon as the page loads; netlify/functions/book.js requires()
 * the same file to make the authoritative call server-side. A hand-edited
 * request from the browser can only ever ask — this file, run on the server,
 * decides.
 *
 * Scheduled (non-emergency) work only. "Emergency — now" bypasses this
 * entirely — a burst pipe does not wait for a free calendar slot; the
 * on-call plumber is dispatched same day regardless of how full the board is.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.EESchedule = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Tune these as the crew grows. One truck/crew running a normal day of
  // scheduled work (on top of whatever emergencies come in) is ~4 job-slots;
  // a water heater or remodel eats more of the day than a drain clear.
  var DAILY_SLOTS = 4;
  var HORIZON_DAYS = 21;
  var TZ = "America/Chicago";

  function todayISO(now) {
    now = now || new Date();
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  }

  function shiftISO(iso, days) {
    var parts = iso.split("-").map(Number);
    var dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + days));
    return dt.toISOString().slice(0, 10);
  }

  function weekday(iso) {
    var parts = iso.split("-").map(Number);
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])).getUTCDay();
  }

  // Office days are Mon–Fri (see OPERATIONS.md). Emergencies run every day
  // but do not consume a calendar slot, so the scheduled-work calendar only
  // needs to offer the days the office actually staffs.
  function isWorkday(iso) {
    var wd = weekday(iso);
    return wd >= 1 && wd <= 5;
  }

  function workdaysFrom(startISO, count) {
    var out = [];
    var iso = startISO;
    for (var i = 0; i < 60 && out.length < count; i += 1) {
      if (isWorkday(iso)) out.push(iso);
      iso = shiftISO(iso, 1);
    }
    return out;
  }

  function formatDay(iso) {
    var parts = iso.split("-").map(Number);
    var dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(dt);
  }

  function remaining(used, need) {
    return DAILY_SLOTS - used >= need;
  }

  /** fill: [{day: "YYYY-MM-DD", used: number}, ...] */
  function dayOptions(fill, need, from) {
    from = from || todayISO();
    var used = {};
    (fill || []).forEach(function (f) { used[f.day] = f.used; });
    // Tomorrow onward — today's slate is assumed locked by the time anyone
    // is looking at a booking calendar.
    return workdaysFrom(shiftISO(from, 1), HORIZON_DAYS).map(function (day) {
      var taken = used[day] || 0;
      return { day: day, used: taken, open: remaining(taken, need), label: formatDay(day) };
    });
  }

  function firstOpenDay(fill, need, from) {
    var opts = dayOptions(fill, need, from);
    var hit = opts.filter(function (o) { return o.open; })[0];
    return hit ? hit.day : null;
  }

  return {
    DAILY_SLOTS: DAILY_SLOTS,
    HORIZON_DAYS: HORIZON_DAYS,
    todayISO: todayISO,
    isWorkday: isWorkday,
    workdaysFrom: workdaysFrom,
    formatDay: formatDay,
    dayOptions: dayOptions,
    firstOpenDay: firstOpenDay,
  };
});

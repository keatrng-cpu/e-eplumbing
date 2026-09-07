/**
 * E&E flat-rate pricebook — starting-estimate ranges only.
 *
 * Source of truth: PRICEBOOK.md. Keep the two in sync — when you revise a
 * number in PRICEBOOK.md after real jobs come in, update it here too.
 *
 * This intentionally NEVER produces a single guaranteed price. Plumbing
 * repairs turn on things a web form cannot see (access, pipe material, code
 * upgrades needed) — a hard number here would contradict "flat-rate quote
 * before we start any work" and create a promise the tech on-site can't keep.
 * What it gives a visitor instead: a real starting range, computed the same
 * way every time, so "call for pricing" stops being the whole answer.
 *
 * Isomorphic on purpose: loaded with <script src="pricebook.js"> in the
 * browser (attaches `window.EEPricebook`) and with require() from the
 * Netlify function that re-validates price + scheduling weight server-side
 * (netlify/functions/book.js), so both sides read the exact same numbers.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.EEPricebook = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Diagnostic / service call — quoted when nothing below fits, or the
  // customer just wants a plumber to look. Credited toward the repair.
  var DIAGNOSTIC_FEE = {
    low: 89,
    high: 149,
    note: "1st-hour diagnostic — credited toward the repair if you approve the work.",
  };

  // Applies on top of the range below when urgency is "Emergency — now" and
  // the request lands outside office hours (Mon–Fri 7am–5pm America/Chicago).
  var EMERGENCY_SURCHARGE = { low: 75, high: 150 };
  var AFTER_HOURS_MULTIPLIER = 1.5;

  // One entry per <select id="fservice"> option, in the same order, so the
  // form's existing option text is the lookup key — nothing to keep in sync
  // by hand beyond this file.
  var SERVICES = {
    "Emergency repair": {
      slots: 2,
      options: [
        { label: "Shut off / isolate a leak", low: 125, high: 225 },
        { label: "Burst pipe repair (accessible copper/PEX)", low: 350, high: 750 },
        { label: "Freeze-thaw + minor repair", low: 275, high: 550 },
        { label: "Not sure — just need a plumber", diagnostic: true },
      ],
    },
    "Drain / sewer": {
      slots: 2,
      options: [
        { label: "Clear a sink, tub, or toilet (auger)", low: 175, high: 275 },
        { label: "Main line clear (auger)", low: 275, high: 450 },
        { label: "Hydro jet the main line", low: 450, high: 850 },
        { label: "Cleanout install", low: 350, high: 650 },
      ],
    },
    "Water heater": {
      slots: 3,
      options: [
        { label: "Tank replace — standard (like-for-like)", low: 650, high: 1100, note: "Labor only — unit priced separately" },
        { label: "Tank replace — w/ code upgrades", low: 850, high: 1400, note: "Labor only — unit priced separately" },
        { label: "Flush / maintenance", low: 125, high: 195 },
        { label: "T&P valve, anode, or element service", low: 150, high: 350 },
        { label: "Tankless install", custom: true },
      ],
    },
    "Sump pump / flooding": {
      slots: 2,
      options: [
        { label: "Primary pump replace", low: 450, high: 850 },
        { label: "Battery backup add-on", low: 550, high: 950 },
        { label: "Check valve / discharge repair", low: 175, high: 350 },
        { label: "Seasonal test + service", low: 99, high: 165 },
      ],
    },
    "Frozen or burst pipe": {
      slots: 2,
      options: [
        { label: "Safe electric thaw + minor repair", low: 275, high: 550 },
        { label: "Burst pipe repair (accessible)", low: 350, high: 750 },
        { label: "Difficult access / slab approach", custom: true },
      ],
    },
    "Softener / filtration": {
      slots: 2,
      options: [
        { label: "Softener service / resin check", low: 125, high: 225 },
        { label: "Softener install", custom: true },
        { label: "Iron filter / RO under-sink", custom: true },
      ],
    },
    "Remodel / rough-in": {
      slots: 4,
      options: [{ label: "Basement bath, re-pipe, or fixture package", custom: true }],
    },
    Commercial: {
      slots: 3,
      options: [{ label: "Backflow test, service contract, or build-out", custom: true }],
    },
    "Something else": {
      slots: 2,
      options: [{ label: "Tell us what's going on below", custom: true }],
    },
  };

  function isAfterHours(date) {
    date = date || new Date();
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      hour12: false,
      weekday: "short",
    }).formatToParts(date);
    var hour = Number(parts.find(function (p) { return p.type === "hour"; }).value);
    var weekday = parts.find(function (p) { return p.type === "weekday"; }).value;
    var isWeekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(weekday) !== -1;
    return !(isWeekday && hour >= 7 && hour < 17);
  }

  /**
   * @param {string} serviceLabel - key into SERVICES (matches the <select> text)
   * @param {number} optionIndex - index into that service's options[]
   * @param {string} urgency - "Emergency — now" | "This week" | "Planning ahead"
   */
  function estimate(serviceLabel, optionIndex, urgency) {
    var svc = SERVICES[serviceLabel];
    if (!svc) {
      return { range: null, notes: ["Tell us what's going on and we'll price it on the call."], slots: 2 };
    }
    var opt = svc.options[optionIndex] || svc.options[0];
    var notes = [];
    var range = null;

    if (opt.diagnostic || (!opt.low && !opt.custom)) {
      range = { low: DIAGNOSTIC_FEE.low, high: DIAGNOSTIC_FEE.high };
      notes.push(DIAGNOSTIC_FEE.note);
    } else if (opt.custom) {
      notes.push("This one needs a look before we can put a number on it — we'll quote it on the call or at the door, free of charge.");
    } else {
      range = { low: opt.low, high: opt.high };
      if (opt.note) notes.push(opt.note);
    }

    var afterHours = isAfterHours();
    if (urgency === "Emergency — now" && afterHours) {
      notes.push(
        "Emergency dispatch outside business hours: +$" + EMERGENCY_SURCHARGE.low + "–$" + EMERGENCY_SURCHARGE.high + " on top of the repair."
      );
      if (range) {
        range = {
          low: Math.round(range.low + EMERGENCY_SURCHARGE.low),
          high: Math.round(range.high + EMERGENCY_SURCHARGE.high),
        };
      }
    } else if (urgency === "Emergency — now") {
      notes.push("Same-day emergency dispatch — no after-hours surcharge during office hours.");
    }

    notes.push("Starting estimate — confirmed flat-rate quote given on-site before any work begins.");

    return { range: range, notes: notes, slots: svc.slots || 2 };
  }

  function formatRange(range) {
    if (!range) return "We'll quote it on the call";
    return "$" + range.low.toLocaleString() + "–$" + range.high.toLocaleString();
  }

  return {
    SERVICES: SERVICES,
    DIAGNOSTIC_FEE: DIAGNOSTIC_FEE,
    EMERGENCY_SURCHARGE: EMERGENCY_SURCHARGE,
    AFTER_HOURS_MULTIPLIER: AFTER_HOURS_MULTIPLIER,
    isAfterHours: isAfterHours,
    estimate: estimate,
    formatRange: formatRange,
  };
});

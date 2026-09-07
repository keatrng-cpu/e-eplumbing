/**
 * Ellingson flat-rate pricebook — starting-estimate ranges only.
 * Source of truth: PRICEBOOK.md. Keep the two in sync.
 *
 * Sept 2026 Valley calibration: win the click under GF/Fargo/EGF shops,
 * keep the ceiling on cash jobs. Diagnostic floor covers the truck.
 *
 * After-hours / weekend = 1.5× shop book.
 * Daytime emergency dispatch = +$119–$199 (not stacked with 1.5×).
 *
 * Loaded as pricebook.js in the browser (window.EEPricebook) and
 * required from netlify/functions/book.js so both sides share numbers.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module !== null) {
    try { module.exports = api; } catch (e) { /* ESM interop */ }
  }
  if (root && typeof root === "object") {
    root.EEPricebook = api;
  }
  return api;
})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this), function () {
  "use strict";

  var DIAGNOSTIC_FEE = {
    low: 129,
    high: 199,
    note: "1st-hour diagnostic — credited toward the repair if you approve the work.",
  };

  var EMERGENCY_SURCHARGE = { low: 119, high: 199 };
  var AFTER_HOURS_MULTIPLIER = 1.5;

  var SERVICES = {
    "Emergency repair": {
      slots: 2,
      options: [
        { label: "Shut off / isolate a leak", low: 199, high: 349 },
        { label: "Burst pipe repair (accessible copper/PEX)", low: 549, high: 995 },
        { label: "Freeze-thaw + minor repair", low: 379, high: 749 },
        { label: "Not sure — just need a plumber", diagnostic: true },
      ],
    },
    "Drain / sewer": {
      slots: 2,
      options: [
        { label: "Clear a sink, tub, or toilet (auger)", low: 179, high: 289 },
        { label: "Main line clear (auger)", low: 325, high: 549 },
        { label: "Hydro jet the main line", low: 549, high: 995 },
        { label: "Cleanout install", low: 395, high: 745 },
      ],
    },
    "Water heater": {
      slots: 3,
      options: [
        { label: "Tank replace — standard (like-for-like)", low: 895, high: 1495, note: "Labor only — unit priced separately" },
        { label: "Tank replace — w/ code upgrades", low: 995, high: 1695, note: "Labor only — unit priced separately" },
        { label: "Flush / maintenance", low: 149, high: 219 },
        { label: "T and P valve, anode, or element service", low: 219, high: 429 },
        { label: "Tankless install", custom: true },
      ],
    },
    "Sump pump / flooding": {
      slots: 2,
      options: [
        { label: "Primary pump replace", low: 595, high: 1095 },
        { label: "Battery backup add-on", low: 645, high: 1095 },
        { label: "Check valve / discharge repair", low: 219, high: 395 },
        { label: "Seasonal test + service", low: 129, high: 199 },
      ],
    },
    "Frozen or burst pipe": {
      slots: 2,
      options: [
        { label: "Safe electric thaw + minor repair", low: 379, high: 749 },
        { label: "Burst pipe repair (accessible)", low: 549, high: 995 },
        { label: "Difficult access / slab approach", custom: true },
      ],
    },
    "Softener / filtration": {
      slots: 2,
      options: [
        { label: "Softener service / resin check", low: 169, high: 259 },
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
    return !(isWeekday && hour >= 7 && hour <= 16);
  }

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
      notes.push("After-hours / weekend: 1.5× the shop-book range. Still quoted before work starts.");
      if (range) {
        range = {
          low: Math.round(range.low * AFTER_HOURS_MULTIPLIER),
          high: Math.round(range.high * AFTER_HOURS_MULTIPLIER),
        };
      }
    } else if (urgency === "Emergency — now") {
      notes.push("Daytime emergency dispatch +$" + EMERGENCY_SURCHARGE.low + "–$" + EMERGENCY_SURCHARGE.high + ".");
      if (range) {
        range = {
          low: range.low + EMERGENCY_SURCHARGE.low,
          high: range.high + EMERGENCY_SURCHARGE.high,
        };
      }
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

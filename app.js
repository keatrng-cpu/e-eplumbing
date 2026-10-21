/**
 * Booking card controller.
 *
 * One `state` object, one `render()`. Every control writes into state and
 * nothing writes back into a control the customer touched — the previous
 * version derived urgency from the rail and overwrote both the urgency radio
 * and the service <select> on every render, so the form submitted a job the
 * customer had not picked at a price computed from a different urgency.
 *
 * The canonical controls are the real form elements (<select name="service">,
 * the urgency radios). Chips are a progressive enhancement that set them, so
 * the form still submits something coherent with JavaScript disabled.
 */
(function () {
  "use strict";

  var pb = window.EEPricebook;
  var sked = window.EESchedule;

  // Order the service chips by how often the phone rings for them.
  var SERVICE_ORDER = [
    "Emergency repair",
    "Drain / sewer",
    "Water heater",
    "Sump pump / flooding",
    "Frozen or burst pipe",
    "Softener / filtration",
    "Fixture install",
    "Remodel / rough-in",
    "Commercial",
    "Something else",
  ];

  // Customer-facing language stays symptom-first. The canonical service names
  // remain unchanged underneath so pricing, dispatch, and reporting keep the
  // same schema.
  var SERVICE_GUIDE = {
    "Emergency repair": { label: "Leak or water emergency", hint: "Water is moving, overflowing, or won't shut off" },
    "Drain / sewer": { label: "Clogged drain or toilet", hint: "A sink, tub, toilet, floor drain, or several drains" },
    "Water heater": { label: "No hot water or heater problem", hint: "No hot water, a leaking tank, or a heater that needs service" },
    "Sump pump / flooding": { label: "Wet basement or sump pump", hint: "Water in the basement, a failed pump, or backup protection" },
    "Frozen or burst pipe": { label: "Frozen or burst pipe", hint: "No water, a frozen line, or a pipe that is leaking" },
    "Softener / filtration": { label: "Water quality problem", hint: "Hard water, iron, odor, taste, or a softener/filter" },
    "Fixture install": { label: "Toilet, faucet, shower, or disposal", hint: "Repair or install a kitchen or bathroom fixture" },
    "Remodel / rough-in": { label: "New bathroom, kitchen, or remodel", hint: "Planning, opening walls, or adding new plumbing" },
    Commercial: { label: "Business or commercial plumbing", hint: "A restaurant, shop, office, rental, or multi-unit building" },
    "Something else": { label: "I'm not sure", hint: "Low pressure, a smell, a noise — describe it and we'll sort it" },
  };

  // The pricebook keeps the precise scope names for the plumber; customers see
  // a plain-language version of each choice.
  var SCOPE_GUIDE = {
    "Shut off / isolate a leak": "Leak is active but contained",
    "Burst pipe repair (accessible copper/PEX)": "Pipe burst and water is escaping",
    "Freeze-thaw + minor repair": "Frozen pipe thaw and small repair",
    "Not sure — just need a plumber": "Not sure — send a plumber",
    "Clear a sink, tub, or toilet (auger)": "Clear one sink, tub, or toilet",
    "Main line clear (auger)": "Several drains or main line clogged",
    "Hydro jet the main line": "Deep-clean the main drain line",
    "Cleanout install": "Add an outside drain cleanout",
    "Camera inspection (main line)": "Camera inspection of main drain",
    "Camera inspection (branch)": "Camera inspection of one branch line",
    "Tank replace — standard (like-for-like)": "Replace a standard water heater",
    "Tank replace — w/ code upgrades": "Replace heater and update connections",
    "Flush / maintenance": "Flush or service the water heater",
    "T and P valve, anode, or element service": "Repair a valve, element, or other part",
    "Tankless install": "Install a tankless water heater",
    "Primary pump replace": "Replace the main sump pump",
    "Battery backup add-on": "Add battery backup to the sump",
    "Check valve / discharge repair": "Repair the sump discharge pipe",
    "Seasonal test + service": "Test or service the sump pump",
    "Safe electric thaw + minor repair": "Thaw a frozen pipe and make a small repair",
    "Burst pipe repair (accessible)": "Repair an accessible burst pipe",
    "Difficult access / slab approach": "Frozen pipe with difficult access",
    "Softener service / resin check": "Service or check the water softener",
    "Softener install": "Install a water softener",
    "Iron filter / RO under-sink": "Install an iron filter or under-sink filter",
    "Toilet replace (standard)": "Replace a standard toilet",
    "Faucet replace (kitchen/bath)": "Replace a kitchen or bathroom faucet",
    "Shower install": "Install a shower",
    "Bath / tub install": "Install a bathtub",
    "Garbage disposal replace": "Replace a garbage disposal",
    "Shower valve cartridge": "Repair a shower valve",
    "Basement bath, re-pipe, or fixture package": "Bathroom, kitchen, addition, or re-pipe",
    "Backflow test, service contract, or build-out": "Repair, backflow, or ongoing service",
    "Tell us what's going on below": "Tell us what you're seeing",
    "Hidden leak — wall, ceiling, or water line (find it)": "Leak I can't see (wall, ceiling, line)",
    "Sewer smell — find the source": "Sewer smell in the house",
    "Tank is leaking — check it first": "Water heater is leaking",
    "Low water pressure — find the cause": "Low water pressure",
  };

  // One-line "pick this if..." hint under each choice, for customers who
  // don't know the trade name for what's wrong. Keyed by pricebook label.
  var SCOPE_HINT = {
    "Shut off / isolate a leak": "Dripping or spraying and you can't stop it",
    "Burst pipe repair (accessible copper/PEX)": "A pipe split or popped and water is out",
    "Freeze-thaw + minor repair": "No water after a cold snap, small leak",
    "Not sure — just need a plumber": "We look, find it, then quote the fix",
    "Hidden leak — wall, ceiling, or water line (find it)": "Stain, drip from above, or the meter spins with taps off",
    "Clear a sink, tub, or toilet (auger)": "One drain slow or stopped",
    "Main line clear (auger)": "Several drains slow, gurgling, or backing up",
    "Hydro jet the main line": "Main keeps clogging (roots, grease)",
    "Cleanout install": "No easy access point to clear the main",
    "Camera inspection (main line)": "See why the main keeps backing up",
    "Camera inspection (branch)": "See inside one problem drain",
    "Sewer smell — find the source": "Rotten-egg or sewer odor indoors",
    "Tank replace — standard (like-for-like)": "Old tank, no hot water, same spot",
    "Tank replace — w/ code upgrades": "Needs expansion tank, pan, or venting",
    "Flush / maintenance": "Popping or rumbling, yearly upkeep",
    "T and P valve, anode, or element service": "Lukewarm, smelly, or a valve dripping",
    "Tankless install": "Switch to on-demand hot water",
    "Tank is leaking — check it first": "Water under or around the heater",
    "Primary pump replace": "Pump hums, won't run, or runs nonstop",
    "Battery backup add-on": "Keep pumping when the power's out",
    "Check valve / discharge repair": "Water falls back into the pit, or a pipe leaks",
    "Seasonal test + service": "Spring check before the thaw",
    "Safe electric thaw + minor repair": "A line froze, little or no water",
    "Burst pipe repair (accessible)": "Frozen pipe split, water escaping",
    "Difficult access / slab approach": "Under the floor or behind finished walls",
    "Softener service / resin check": "Hard water is back, salt not dropping",
    "Softener install": "Spots, scale, or no softener yet",
    "Iron filter / RO under-sink": "Orange stains, odor, or drinking water",
    "Toilet replace (standard)": "Cracked, rocking, or old toilet",
    "Faucet replace (kitchen/bath)": "Drips or leaks at the base",
    "Shower install": "New or rebuilt shower",
    "Bath / tub install": "New or replacement tub",
    "Garbage disposal replace": "Hums, leaks, or won't spin",
    "Shower valve cartridge": "Shower drips or won't get hot/cold",
    "Basement bath, re-pipe, or fixture package": "Planning a project",
    "Backflow test, service contract, or build-out": "Business, rental, or yearly test",
    "Tell us what's going on below": "Not listed? Describe it, we'll call",
    "Low water pressure — find the cause": "Weak flow at one tap or the whole house",
  };

  // Services that should default to "now" dispatch rather than the calendar.
  var EMERGENCY_SERVICES = {
    "Emergency repair": true,
    "Frozen or burst pipe": true,
    "Sump pump / flooding": true,
  };

  /**
   * Job-specific questions. 3–5 per service, rendered only after the service
   * is picked, serialized into the hidden `details` field so Netlify Forms
   * needs no schema change. This is the block that lets the plumber load the
   * right parts before leaving the shop.
   */
  var FOLLOWUP = {
    "Emergency repair": [
      { id: "shutoff", label: "Is the main water shut off?", type: "choice", options: ["Yes", "No", "Can't find it"] },
      { id: "where", label: "Where is the water?", type: "choice", options: ["Basement", "Kitchen", "Bathroom", "Outside / yard", "Multiple rooms"] },
      { id: "howlong", label: "How long has it been going?", type: "choice", options: ["Minutes", "Hours", "Since yesterday", "Longer"] },
    ],
    "Drain / sewer": [
      { id: "fixture", label: "Which fixture?", type: "choice", options: ["Kitchen sink", "Bath sink", "Tub / shower", "Toilet", "Floor drain", "Whole house"] },
      { id: "count", label: "How many fixtures are affected?", type: "choice", options: ["Just one", "Two or three", "Everything"] },
      { id: "sewage", label: "Is sewage backing up into the house?", type: "choice", options: ["No", "Yes"] },
      { id: "sewer", label: "Septic or city sewer?", type: "choice", options: ["City", "Septic", "Not sure"] },
    ],
    "Water heater": [
      { id: "fuel", label: "Gas or electric?", type: "choice", options: ["Gas", "Electric", "Propane", "Not sure"] },
      { id: "size", label: "Tank size", type: "choice", options: ["30 gal", "40 gal", "50 gal", "75 gal+", "Tankless", "Not sure"] },
      { id: "age", label: "Roughly how old?", type: "choice", options: ["Under 5 yrs", "5–10 yrs", "10–15 yrs", "15+ yrs", "No idea"] },
      { id: "leak", label: "Leaking?", type: "choice", options: ["Not leaking", "From the top", "From the bottom", "Pooling underneath"] },
      { id: "brand", label: "Brand (on the data plate)", type: "text", placeholder: "Rheem, AO Smith, Bradford White…" },
    ],
    "Sump pump / flooding": [
      { id: "rising", label: "Is water rising right now?", type: "choice", options: ["No", "Yes — slowly", "Yes — fast"] },
      { id: "pumpage", label: "How old is the pump?", type: "choice", options: ["Under 3 yrs", "3–7 yrs", "7+ yrs", "Not sure"] },
      { id: "backup", label: "Battery backup installed?", type: "choice", options: ["No", "Yes", "Not sure"] },
    ],
    "Frozen or burst pipe": [
      { id: "burst", label: "Has it burst, or just stopped flowing?", type: "choice", options: ["Stopped flowing", "Burst — water escaping", "Not sure"] },
      { id: "spot", label: "Where is the frozen run?", type: "choice", options: ["Crawlspace", "Exterior wall", "Basement", "Garage", "Under the slab", "Not sure"] },
      { id: "flowing", label: "Is any fixture still getting water?", type: "choice", options: ["Yes", "No water anywhere"] },
    ],
    "Softener / filtration": [
      { id: "symptom", label: "What are you seeing?", type: "choice", options: ["Hard water / scale", "Iron staining", "Taste or smell", "Unit not regenerating", "Want a new system"] },
      { id: "water", label: "Well or city water?", type: "choice", options: ["City", "Well", "Not sure"] },
      { id: "existing", label: "Is there a system now?", type: "choice", options: ["No system", "Softener", "Softener + filter", "Not sure"] },
    ],
    "Fixture install": [
      { id: "fixture", label: "What are we working on?", type: "choice", options: ["Toilet", "Faucet", "Shower / tub", "Garbage disposal", "Shutoff / supply line", "Other fixture"] },
      { id: "supplied", label: "Who is supplying the fixture?", type: "choice", options: ["I have it", "Please supply it", "Not sure yet"] },
      { id: "location", label: "Where is it?", type: "choice", options: ["Kitchen", "Main bath", "Second bath", "Basement", "Other"] },
    ],
    "Remodel / rough-in": [
      { id: "scope", label: "What's the project?", type: "choice", options: ["Basement bath", "Kitchen", "Bath remodel", "Addition", "Whole-house re-pipe"] },
      { id: "stage", label: "Where are you in it?", type: "choice", options: ["Just planning", "Have drawings", "Walls are open", "Need it inspected"] },
    ],
    Commercial: [
      { id: "ctype", label: "What kind of building?", type: "choice", options: ["Restaurant", "Retail", "Office", "Shop / warehouse", "Multi-unit"] },
      { id: "cneed", label: "What do you need?", type: "choice", options: ["Repair", "Backflow test", "Service contract", "Build-out"] },
    ],
    "Something else": [
      { id: "describe", label: "Tell us what's going on", type: "text", placeholder: "Fixture, location, how long…" },
    ],
  };

  /**
   * ZIP prefill convenience only — never used to reject anyone. An unknown ZIP
   * is accepted silently, because a wrong entry here would turn away a real
   * customer. Extend from the service-area list as ZIPs are confirmed.
   */
  var ZIP_TOWN = {
    58201: "Grand Forks, ND", 58202: "Grand Forks, ND", 58203: "Grand Forks, ND",
    56721: "East Grand Forks, MN",
    58102: "Fargo, ND", 58103: "Fargo, ND", 58104: "Fargo, ND",
    58078: "West Fargo, ND",
    56560: "Moorhead, MN",
    56716: "Crookston, MN",
    58237: "Grafton, ND",
    58257: "Mayville, ND",
    58045: "Hillsboro, ND",
    58251: "Larimore, ND",
    58012: "Casselton, ND",
    56701: "Thief River Falls, MN",
    56510: "Ada, MN",
    56762: "Warren, MN",
  };

  var state = {
    service: null,
    optionIndex: null,
    urgency: "This week",
    rail: "day",
    day: null,
    window: "First available",
    fill: [],
    followup: {},
    coords: null,
  };

  // No-op until analytics.js loads; never a hard dependency.
  var track = function (e, p) { (window.EETrack || function () {})(e, p); };

  var $ = function (id) { return document.getElementById(id); };
  var form = $("book");
  if (!form) return;
  // validate() below gives inline, labelled errors. Without this, the browser's
  // native check fires first on the visually hidden <select name="service">
  // and blocks submit with a bubble the customer cannot see.
  form.noValidate = true;
  // The Now / Pick-a-day rail sets urgency (and "This week" and "Planning
  // ahead" price the same), so the duplicate radio question is hidden when JS
  // runs. The radios still submit; without JS the fieldset stays visible.
  if ($("urgencyFs")) $("urgencyFs").hidden = true;

  var els = {
    servicePills: $("jobPills"),
    scopeRow: $("scopeRow"),
    scopePills: $("scopePills"),
    quoteBox: $("quoteBox"),
    dayGrid: $("dayGrid"),
    windowRow: $("windowRow"),
    nowNote: $("nowNote"),
    dayNote: $("dayNote"),
    followup: $("followupBox"),
    submit: $("bookSubmit"),
    service: $("fservice"),
    town: $("ftown"),
    zip: $("fzip"),
    street: $("fstreet"),
    name: $("fname"),
    phone: $("fphone"),
    details: $("fdetails"),
    estimate: $("fEstimate"),
    fDay: $("fDay"),
    fWindow: $("fWindow"),
    fOption: $("fOption"),
    fScope: $("fScope"),
    fCoords: $("fCoords"),
    fRef: $("fRef"),
    photo: $("fphoto"),
    geo: $("geoBtn"),
    geoNote: $("geoNote"),
    truckList: $("truckList"),
    ticker: $("tickerTrack"),
  };

  // ---------------------------------------------------------------- pricing

  function options() {
    if (!pb || !state.service) return [];
    var svc = pb.SERVICES[state.service];
    return svc ? svc.options : [];
  }

  function currentEstimate() {
    if (!pb || !state.service) return null;
    var idx = state.optionIndex == null ? 0 : state.optionIndex;
    return pb.estimate(state.service, idx, state.urgency);
  }

  /** Shop-book price with no urgency adjustment, so the 1.5× can be itemised. */
  function baseEstimate() {
    if (!pb || !state.service) return null;
    var idx = state.optionIndex == null ? 0 : state.optionIndex;
    return pb.estimate(state.service, idx, "Planning ahead");
  }

  function renderQuote() {
    var box = els.quoteBox;
    if (!state.service) {
      box.innerHTML =
        '<p class="quote-prompt">Tap what\'s going on above — your number appears here. ' +
        "No dash. No guessing.</p>";
      els.estimate.value = "";
      return;
    }
    if (state.optionIndex == null) {
      box.innerHTML =
        '<p class="quote-kicker">' + esc(state.service) + "</p>" +
        '<p class="quote-prompt">Pick the one that sounds closest. Not sure? The plumber confirms before any work.</p>';
      els.estimate.value = "";
      return;
    }

    var final = currentEstimate();
    var base = baseEstimate();
    var html = '<p class="quote-kicker">Starting estimate</p>';

    if (!final.range) {
      html +=
        '<p class="quote-amt quote-amt-sm">We\'ll quote it on the call</p>' +
        '<p class="quote-note">' + esc((final.notes || []).join(" ")) + "</p>";
      els.estimate.value = "We'll quote it on the call";
      box.innerHTML = html;
      return;
    }

    html += '<p class="quote-amt">' + pb.formatRange(final.range) + "</p>";

    // Itemise the adjustment instead of burying it inside one range.
    if (base.range && (base.range.low !== final.range.low || base.range.high !== final.range.high)) {
      var adjLabel = pb.isAfterHours()
        ? "After-hours / weekend ×" + pb.AFTER_HOURS_MULTIPLIER
        : "Daytime emergency dispatch";
      html +=
        '<ul class="quote-lines">' +
        "<li><span>Shop book</span><b>" + pb.formatRange(base.range) + "</b></li>" +
        "<li><span>" + esc(adjLabel) + "</span><b>included above</b></li>" +
        "</ul>";
    }

    var notes = (final.notes || []).filter(function (n) {
      // The multiplier is now its own line; don't repeat it in prose.
      return n.indexOf("After-hours / weekend: 1.5") !== 0 && n.indexOf("Daytime emergency dispatch +") !== 0;
    });
    html += '<p class="quote-note">' + esc(notes.join(" ")) + "</p>";
    box.innerHTML = html;
    els.estimate.value = pb.formatRange(final.range);
  }

  // ------------------------------------------------------------------- chips

  function chip(label, on, onClick, cls) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = (cls || "pill") + (on ? " on" : "");
    b.textContent = label;
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.addEventListener("click", onClick);
    return b;
  }

  // Accordion: the open category's sub-options (and its inline scene) sit in
  // one full-width panel inside the card grid, right after the tapped card's
  // row. Only one category is open at a time.
  var jobPanel = null;
  function ensurePanel() {
    if (jobPanel || !els.scopeRow) return jobPanel;
    jobPanel = document.createElement("div");
    jobPanel.className = "job-panel";
    jobPanel.id = "jobPanel";
    jobPanel.setAttribute("role", "region");
    els.scopeRow.parentNode.insertBefore(jobPanel, els.scopeRow);
    jobPanel.appendChild(els.scopeRow);
    return jobPanel;
  }
  function placePanel() {
    var panel = ensurePanel();
    if (!panel || !els.servicePills) return;
    var pills = Array.prototype.slice.call(els.servicePills.querySelectorAll(".service-pill"));
    var openPill = null;
    pills.forEach(function (b) { if (b.getAttribute("data-svc") === state.service) openPill = b; });
    if (!openPill) { panel.hidden = true; if (panel.parentNode === els.servicePills) els.servicePills.appendChild(panel); return; }
    if (panel.parentNode === els.servicePills) els.servicePills.removeChild(panel);
    var top = openPill.offsetTop, last = openPill;
    pills.forEach(function (b) { if (Math.abs(b.offsetTop - top) < 4) last = b; });
    els.servicePills.insertBefore(panel, last.nextSibling);
    panel.hidden = false;
    panel.setAttribute("aria-label", (openPill.getAttribute("data-label") || "Job") + " options");
  }

  function renderServicePills() {
    if (!els.servicePills) return;
    var ae = document.activeElement;
    var focusSvc = ae && ae.classList && ae.classList.contains("service-pill") ? ae.getAttribute("data-svc") : null;
    ensurePanel();
    if (jobPanel && jobPanel.parentNode === els.servicePills) els.servicePills.removeChild(jobPanel);
    els.servicePills.innerHTML = "";
    SERVICE_ORDER.forEach(function (svc) {
      var guide = SERVICE_GUIDE[svc] || { label: svc, hint: "Tell us what you need" };
      var b = chip(guide.label, state.service === svc, function () { pickService(svc); }, "service-pill");
      b.setAttribute("aria-label", guide.label + ". " + guide.hint);
      b.setAttribute("aria-expanded", state.service === svc ? "true" : "false");
      b.setAttribute("aria-controls", "jobPanel");
      b.setAttribute("data-svc", svc);
      b.setAttribute("data-label", guide.label);
      b.title = guide.hint;
      var small = document.createElement("small");
      small.textContent = guide.hint;
      b.appendChild(small);
      els.servicePills.appendChild(b);
      if (focusSvc === svc) b.focus({ preventScroll: true });
    });
    if (jobPanel) els.servicePills.appendChild(jobPanel);
  }

  function renderScopePills() {
    if (!els.scopeRow) return;
    var opts = options();
    els.scopeRow.hidden = !state.service || opts.length < 1;
    if (els.scopeRow.hidden) return;
    els.scopePills.innerHTML = "";
    opts.forEach(function (o, i) {
      var price = "";
      if (o.low) price = "$" + o.low.toLocaleString() + "–$" + o.high.toLocaleString();
      else if (o.diagnostic) price = "diagnostic";
      else if (o.custom) price = "quoted on site";
      var b = chip(SCOPE_GUIDE[o.label] || o.label, state.optionIndex === i, function () {
        state.optionIndex = i;
        els.fOption.value = String(i);
        els.fScope.value = o.label;
        render();
        track("scope_selected", {
          service: state.service,
          scope: o.label,
          priced: !o.custom,
          band: o.low ? o.low + "-" + o.high : (o.diagnostic ? "diagnostic" : "quoted-on-site"),
        });
      }, "scope-pill");
      b.setAttribute("data-idx", String(i));
      b.setAttribute("aria-label", (SCOPE_GUIDE[o.label] || o.label) + ". Starting estimate details below.");
      if (SCOPE_HINT[o.label]) {
        var hint = document.createElement("span");
        hint.className = "scope-hint";
        hint.textContent = SCOPE_HINT[o.label];
        b.appendChild(hint);
      }
      var small = document.createElement("small");
      small.textContent = price;
      b.appendChild(small);
      els.scopePills.appendChild(b);
    });
  }

  function pickService(svc) {
    state.service = svc;
    state.optionIndex = null;
    state.day = null;
    els.service.value = svc;
    els.fScope.value = "";
    els.fOption.value = "";
    els.fDay.value = "";
    // Suggest a lane, but the urgency radios remain the customer's to change.
    setRail(EMERGENCY_SERVICES[svc] ? "now" : "day", true);
    state.followup = {};
    render();
    track("service_selected", { service: svc, emergency: !!EMERGENCY_SERVICES[svc] });
  }

  // ------------------------------------------------------------ rail / urgency

  function setRail(rail, suggestUrgency) {
    state.rail = rail;
    if (suggestUrgency) {
      state.urgency = rail === "now" ? "Emergency — now" : "This week";
      var radio = form.querySelector('input[name="urgency"][value="' + state.urgency + '"]');
      if (radio) radio.checked = true;
    }
  }

  function renderRail() {
    var now = $("railNow"), day = $("railDay");
    [[now, "now"], [day, "day"]].forEach(function (pair) {
      if (!pair[0]) return;
      var on = state.rail === pair[1];
      pair[0].classList.toggle("on", on);
      pair[0].setAttribute("aria-pressed", on ? "true" : "false");
    });
    var dayMode = state.rail === "day";
    els.dayGrid.hidden = !dayMode;
    els.windowRow.hidden = !dayMode;
    els.nowNote.hidden = dayMode;
    if (!dayMode) {
      els.fDay.value = "";
      els.fWindow.value = "ASAP — dispatch now";
    }
  }

  // ------------------------------------------------------------- day + window

  function renderDays() {
    if (state.rail !== "day" || !sked) return;
    var need = (currentEstimate() && currentEstimate().slots) || 2;
    // Capacity is enforced by the server, not displayed to customers. Show
    // only dates that can currently take this job; no "spots left", "open",
    // or "full" language gives away the truck board.
    var days = sked.dayOptions(state.fill, need).filter(function (d) { return d.open; });
    els.dayGrid.innerHTML = "";
    days.slice(0, 6).forEach(function (d) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "day-chip" + (state.day === d.day ? " on" : "");
      b.setAttribute("aria-pressed", state.day === d.day ? "true" : "false");
      b.innerHTML = "<span>" + d.label + "</span>";
      b.addEventListener("click", function () {
        // Explicit choice only — never auto-select a day on the customer's behalf.
        state.day = state.day === d.day ? null : d.day;
        els.fDay.value = state.day || "";
        render();
        track("day_selected", { picked: !!state.day, window: state.window });
      });
      els.dayGrid.appendChild(b);
    });
    els.dayNote.textContent = state.day
      ? "Holding " + sked.formatDay(state.day) + ", " + state.window + ". We confirm by text."
      : "Pick a day and preferred window, or we’ll confirm the first opening by text.";
  }

  function renderWindows() {
    if (state.rail !== "day") return;
    var wrap = $("windowPills");
    wrap.innerHTML = "";
    ["Morning (8–12)", "Afternoon (12–4)", "First available"].forEach(function (w) {
      wrap.appendChild(chip(w, state.window === w, function () {
        state.window = w;
        els.fWindow.value = w;
        render();
      }, "win-pill"));
    });
    els.fWindow.value = state.window;
  }

  // --------------------------------------------------------- follow-up fields

  function renderFollowup() {
    var qs = (state.service && FOLLOWUP[state.service]) || [];
    els.followup.hidden = qs.length === 0;
    if ($("fuDetails")) $("fuDetails").hidden = qs.length === 0;
    if (!qs.length) { els.details.value = ""; return; }

    // Only rebuild when the service changed, so typing isn't interrupted.
    if (els.followup.getAttribute("data-for") !== state.service) {
      els.followup.setAttribute("data-for", state.service);
      els.followup.innerHTML =
        '<p class="fu-head">A few details so we bring the right parts</p>';
      qs.forEach(function (q) {
        var wrap = document.createElement("div");
        wrap.className = "fu-q";
        if (q.type === "text") {
          var id = "fu_" + q.id;
          wrap.innerHTML = '<label for="' + id + '">' + esc(q.label) + "</label>";
          var inp = document.createElement("input");
          inp.type = "text";
          inp.id = id;
          inp.placeholder = q.placeholder || "";
          inp.addEventListener("input", function () {
            state.followup[q.label] = inp.value.trim();
            serializeDetails();
          });
          wrap.appendChild(inp);
        } else {
          wrap.innerHTML = '<span class="fu-label">' + esc(q.label) + "</span>";
          var row = document.createElement("div");
          row.className = "fu-opts";
          q.options.forEach(function (opt) {
            var b = chip(opt, false, function () {
              state.followup[q.label] = state.followup[q.label] === opt ? "" : opt;
              row.querySelectorAll("button").forEach(function (x) {
                var on = x.textContent === state.followup[q.label];
                x.classList.toggle("on", on);
                x.setAttribute("aria-pressed", on ? "true" : "false");
              });
              serializeDetails();
            }, "fu-pill");
            row.appendChild(b);
          });
          wrap.appendChild(row);
        }
        els.followup.appendChild(wrap);
      });
    }
    serializeDetails();
  }

  function serializeDetails() {
    var lines = [];
    Object.keys(state.followup).forEach(function (k) {
      if (state.followup[k]) lines.push(k + " " + state.followup[k]);
    });
    els.details.value = lines.join("\n");
  }

  // --------------------------------------------------------------- geolocation

  function initGeo() {
    if (!els.geo) return;
    if (!navigator.geolocation) { els.geo.hidden = true; return; }
    els.geo.addEventListener("click", function () {
      els.geo.disabled = true;
      els.geoNote.textContent = "Getting your location…";
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          var lat = pos.coords.latitude.toFixed(6);
          var lon = pos.coords.longitude.toFixed(6);
          state.coords = lat + "," + lon;
          // A map link beats a reverse-geocoded guess: the plumber taps it and drives.
          els.fCoords.value = "https://maps.google.com/?q=" + lat + "," + lon;
          els.geoNote.textContent = "Location pin attached — still fill in the street address.";
          els.geo.disabled = false;
        },
        function () {
          els.geoNote.textContent = "Couldn't get a location. Type the address instead.";
          els.geo.disabled = false;
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  function initZip() {
    if (!els.zip) return;
    els.zip.addEventListener("input", function () {
      var z = els.zip.value.replace(/\D/g, "").slice(0, 5);
      els.zip.value = z;
      var match = ZIP_TOWN[z];
      // Prefill only. An unmatched ZIP is accepted without comment.
      if (match) {
        for (var i = 0; i < els.town.options.length; i += 1) {
          if (els.town.options[i].value === match) { els.town.selectedIndex = i; break; }
        }
      }
    });
  }

  // -------------------------------------------------------------- validation

  function fieldError(el, msg) {
    var holder = el.closest(".field") || el.parentNode;
    var err = holder.querySelector(".field-err");
    if (!err) {
      err = document.createElement("p");
      err.className = "field-err";
      err.setAttribute("role", "alert");
      holder.appendChild(err);
    }
    err.textContent = msg;
    el.setAttribute("aria-invalid", "true");
    el.setAttribute("aria-describedby", err.id || (err.id = el.id + "-err"));
  }

  function clearError(el) {
    var holder = el.closest(".field") || el.parentNode;
    var err = holder.querySelector(".field-err");
    if (err) err.remove();
    el.removeAttribute("aria-invalid");
  }

  function validate() {
    var bad = null;
    [els.name, els.phone, els.street, els.zip].forEach(clearError);

    // Checked in document order so focus lands on the first field the
    // customer would actually reach.
    if (!els.street.value.trim()) { fieldError(els.street, "Street address — the truck has to get there."); bad = bad || els.street; }
    if (els.zip.value.replace(/\D/g, "").length !== 5) { fieldError(els.zip, "5-digit ZIP."); bad = bad || els.zip; }
    if (!els.name.value.trim()) { fieldError(els.name, "We need a name for the job ticket."); bad = bad || els.name; }
    if (els.phone.value.replace(/\D/g, "").length < 10) {
      fieldError(els.phone, "A 10-digit number we can call back on.");
      bad = bad || els.phone;
    }
    if (!state.service) {
      els.quoteBox.innerHTML = '<p class="quote-prompt quote-err" role="alert">Tap what\'s going on first.</p>';
      bad = bad || els.servicePills.querySelector("button");
    }
    if (bad) { bad.focus(); bad.scrollIntoView({ behavior: "smooth", block: "center" }); }
    return !bad;
  }

  // ------------------------------------------------------------------ submit

  async function holdSlot() {
    try {
      var res = await fetch("/.netlify/functions/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: state.service,
          optionIndex: state.optionIndex == null ? 0 : state.optionIndex,
          urgency: state.urgency,
          day: state.rail === "day" ? state.day : null,
          window: state.window,
          asap: state.rail === "now" || !state.day,
        }),
      });
      return res.ok ? await res.json() : null;
    } catch (e) { return null; }
  }

  async function loadAvailability() {
    try {
      var res = await fetch("/.netlify/functions/availability", { cache: "no-store" });
      if (!res.ok) return;
      state.fill = (await res.json()).fill || [];
      render();
    } catch (e) { /* empty fill = every day open */ }
  }

  form.addEventListener("submit", async function (ev) {
    ev.preventDefault();
    if (!validate()) {
      track("booking_blocked", { service: state.service, hasScope: state.optionIndex != null });
      return;
    }

    els.submit.disabled = true;
    els.submit.textContent = "Holding the window…";

    var held = await holdSlot();
    if (held) {
      if (held.ref) els.fRef.value = held.ref;
      if (held.confirmedDay) { state.day = held.confirmedDay; els.fDay.value = held.confirmedDay; }
      if (held.range && pb) els.estimate.value = pb.formatRange(held.range);
      if (held.dayChanged && sked) {
        els.dayNote.textContent =
          "That day filled up — we've held " + sked.formatDay(held.confirmedDay) + " instead.";
        els.dayNote.classList.add("day-moved");
      }
    }
    if (!els.fRef.value) els.fRef.value = "NF-" + Date.now().toString(36).toUpperCase().slice(-6);

    var summary = {
      ref: els.fRef.value,
      service: state.service,
      optionIndex: state.optionIndex == null ? 0 : state.optionIndex,
      scope: els.fScope.value,
      job: SCOPE_GUIDE[els.fScope.value] || (SERVICE_GUIDE[state.service] || {}).label || state.service,
      note: (function () { var o = options()[state.optionIndex == null ? 0 : state.optionIndex]; return (o && o.note) || ""; })(),
      estimate: els.estimate.value,
      rawDay: state.rail === "day" ? state.day : null,
      when: state.rail === "now" ? "Dispatch now" : (state.day ? sked.formatDay(state.day) : "First opening"),
      window: state.rail === "now" ? "60–120 min target" : state.window,
      address: els.street.value.trim() + ", " + els.town.value + " " + els.zip.value,
      phone: els.phone.value,
    };
    try { sessionStorage.setItem("ee-last-order", JSON.stringify(summary)); } catch (e) {}
    // Shape only — never the name, phone, address or map pin.
    track("booking_submitted", {
      service: state.service,
      scope: els.fScope.value,
      urgency: state.urgency,
      rail: state.rail,
      window: summary.window,
      estimate: els.estimate.value,
      hasPhoto: !!(els.photo && els.photo.files && els.photo.files.length),
      photoCount: (els.photo && els.photo.files && els.photo.files.length) || 0,
      answeredDetails: Object.keys(state.followup).filter(function (k) { return state.followup[k]; }).length,
      usedGeo: !!state.coords,
      town: els.town.value,
    });
    writeTruck(summary);

    // multipart, not urlencoded — the photo input needs it and Netlify Forms
    // accepts a FormData POST to any path on the site.
    try {
      await fetch("/", { method: "POST", body: new FormData(form) });
      location.href = "/thanks.html";
    } catch (e) {
      form.submit();
    }
  });

  // -------------------------------------------------------------- truck board

  function readTruck() {
    try { return JSON.parse(localStorage.getItem("north-fork-bookings-v1") || "[]"); }
    catch (e) { return []; }
  }

  function writeTruck(row) {
    try {
      localStorage.setItem("north-fork-bookings-v1", JSON.stringify([row].concat(readTruck()).slice(0, 24)));
    } catch (e) {}
    renderTruck();
  }

  function renderTruck() {
    if (!els.truckList) return;
    var rows = readTruck();
    if (!rows.length) {
      els.truckList.innerHTML = '<p class="empty-board">Empty board. Hold a day or dispatch now and this fills in.</p>';
      return;
    }
    els.truckList.innerHTML =
      "<ul>" + rows.map(function (b) {
        return "<li><b>" + esc(b.scope || b.service || "Job") + "</b><span>" +
          esc(b.ref || "") + " · " + esc(b.when || "") + " · " + esc(b.window || "") +
          "</span><em>" + esc(b.estimate || "") + "</em></li>";
      }).join("") + "</ul>";
  }

  // ------------------------------------------------------------------- misc

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function renderTicker() {
    if (!els.ticker) return;
    els.ticker.innerHTML = "";
    SERVICE_ORDER.concat(SERVICE_ORDER).forEach(function (svc) {
      els.ticker.appendChild(chip(svc, state.service === svc, function () {
        pickService(svc);
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      }));
    });
  }

  // ------------------------------------------------- job scene (left column)
  // The chosen job's scene replaces the hero mascot in the left column (desktop,
  // sticky) or sits in a sticky slot above the picker (mobile). scenes.js and
  // scene files load only on the first interaction with the picker (the homepage
  // makes no scene requests before it). Two stacked layers crossfade: the old
  // scene stays up until the new one's first frame is decoded, then swaps.
  // Every swap cancels the previous scene's timers and loads; a sequence number
  // makes sure rapid taps can only ever show the latest pick. Reduced motion:
  // end frames only (scenes.js) and no fade.
  var scenesLoading = null, sceneWant = null, sceneShown = null, sceneSeq = 0;
  var RM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var MOBILE = window.matchMedia ? matchMedia("(max-width: 920px)") : { matches: false };
  var sl = $("sceneLeft"), slSlot = $("sceneSlot"), slHome = sl ? sl.parentNode : null, slAnchor = sl ? sl.nextSibling : null;
  var layers = sl ? Array.prototype.slice.call(sl.querySelectorAll(".sl-layer")) : [], front = -1;
  function loadScenes() {
    if (window.EEScenes) return Promise.resolve(window.EEScenes);
    if (!scenesLoading) scenesLoading = new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = "scenes.js"; s.async = true;
      s.onload = function () { window.EEScenes ? res(window.EEScenes) : rej(); };
      s.onerror = function () { scenesLoading = null; rej(); };
      document.head.appendChild(s);
    });
    return scenesLoading;
  }
  function placeSceneBox() {
    if (!sl) return;
    if (MOBILE.matches) { if (sl.parentNode !== slSlot) slSlot.appendChild(sl); }
    else if (sl.parentNode !== slHome) slHome.insertBefore(sl, slAnchor);
  }
  if (MOBILE.addEventListener) MOBILE.addEventListener("change", placeSceneBox);
  function sceneCtx(svc, idx) { return { service: svc, optionIndex: idx == null ? 0 : idx }; }
  function preloadScene(svc, idx) {
    loadScenes().then(function (S) { S.preload(S.resolve(sceneCtx(svc, idx))); }).catch(function () {});
  }
  function renderTips() {
    var box = $("sceneTips"), T = window.EETips;
    if (!box || !T || !state.service || !T[state.service]) { if (box) box.innerHTML = ""; return; }
    var e = T[state.service], list = (state.optionIndex != null && e.o[state.optionIndex]) || e.all;
    var key = state.service + "|" + state.optionIndex;
    if (box.getAttribute("data-k") === key) return;
    box.setAttribute("data-k", key);
    box.innerHTML = '<p class="sl-tips-h">In the meantime</p><ul>' + list.slice(0, 3).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>";
  }
  function renderScene() {
    if (!sl || !state.service) return;
    placeSceneBox();
    renderTips();
    loadScenes().then(function (S) {
      var key = S.resolve(sceneCtx(state.service, state.optionIndex));
      if (key === sceneWant) return;
      sceneWant = key;
      var seq = ++sceneSeq;
      var back = front === 0 ? 1 : 0, host = layers[back];
      S.cancel(host);                        /* drop whatever the back layer was doing */
      host.classList.remove("on");
      S.play(host, key, { onStart: function () {
        if (seq !== sceneSeq) { S.cancel(host); return; }   /* a newer pick won */
        var old = front >= 0 ? layers[front] : null;
        front = back; sceneShown = key;
        host.setAttribute("data-scene", key);
        if (sl.hidden) { sl.hidden = false; document.body.classList.add("scene-chosen"); }
        host.classList.add("on");
        if (old) {
          old.classList.remove("on");
          var done = function () { if (front !== back || seq !== sceneSeq) return; S.cancel(old); Array.prototype.slice.call(old.children).forEach(function (n) { n.remove(); }); old.removeAttribute("data-scene"); };
          if (RM) done(); else setTimeout(done, 200);
        }
      } });
    }).catch(function () {});
  }
  // warm the first frame on hover / touch / focus of a card or option
  function warmFrom(ev) {
    var b = ev.target && ev.target.closest && ev.target.closest(".service-pill,.scope-pill");
    if (!b) return;
    if (b.classList.contains("service-pill")) preloadScene(b.getAttribute("data-svc"), null);
    else if (b.hasAttribute("data-idx")) preloadScene(state.service, +b.getAttribute("data-idx"));
  }
  if (els.servicePills) ["pointerover", "touchstart", "focusin"].forEach(function (t) {
    els.servicePills.addEventListener(t, warmFrom, { passive: true });
  });

  var placeTimer = null;
  window.addEventListener("resize", function () { clearTimeout(placeTimer); placeTimer = setTimeout(placePanel, 120); });

  function render() {
    renderScene();
    renderServicePills();
    renderScopePills();
    placePanel();
    renderRail();
    renderDays();
    renderWindows();
    renderFollowup();
    renderQuote();
    els.submit.textContent = state.rail === "now" ? "Dispatch a plumber" : "Hold this slot";
  }

  // ------------------------------------------------------------------- wire up

  $("railNow").addEventListener("click", function () { setRail("now", true); render(); });
  $("railDay").addEventListener("click", function () { setRail("day", true); render(); });

  // The urgency radios are the source of truth for pricing. They are no longer
  // overwritten by render().
  form.querySelectorAll('input[name="urgency"]').forEach(function (r) {
    r.addEventListener("change", function () {
      state.urgency = r.value;
      if (r.value === "Emergency — now") setRail("now", false);
      else if (state.rail === "now") setRail("day", false);
      render();
      track("urgency_changed", { urgency: r.value, service: state.service });
    });
  });

  // The <select> is canonical and works without JS; keep state in step with it.
  // With JS on it is visually hidden (the pills replace it), so keep it out of
  // the tab order and the accessibility tree to avoid a duplicate question.
  els.service.tabIndex = -1;
  if (els.service.closest(".canonical-service-fallback")) {
    els.service.closest(".canonical-service-fallback").setAttribute("aria-hidden", "true");
  }
  els.service.addEventListener("change", function () {
    if (els.service.value !== state.service) pickService(els.service.value);
  });

  [els.name, els.phone, els.street, els.zip].forEach(function (el) {
    el.addEventListener("input", function () { clearError(el); });
  });

  var tickerPause = $("tickerPause"), tickerWrap = $("tickerWrap");
  if (tickerPause) {
    tickerPause.addEventListener("click", function () {
      var paused = tickerWrap.getAttribute("data-paused") === "true";
      tickerWrap.setAttribute("data-paused", paused ? "false" : "true");
      this.textContent = paused ? "Pause" : "Play";
      this.setAttribute("aria-pressed", paused ? "false" : "true");
    });
  }

  track("booking_viewed", { afterHours: pb ? pb.isAfterHours() : null });

  initGeo();
  initZip();
  renderTicker();
  render();
  renderTruck();
  loadAvailability();

  /* Dev-only preview: /?scene=<key> forwards to the thanks page, which plays
     scenes. Nothing is booked or written to the truck board. */
  var devScene = new URLSearchParams(location.search).get("scene");
  if (devScene) location.replace("/thanks.html?scene=" + encodeURIComponent(devScene));
})();

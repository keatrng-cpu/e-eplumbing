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
    "Remodel / rough-in",
    "Commercial",
    "Something else",
  ];

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
        '<p class="quote-prompt">Pick the closest match above for an exact number.</p>';
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

  function renderServicePills() {
    if (!els.servicePills) return;
    els.servicePills.innerHTML = "";
    SERVICE_ORDER.forEach(function (svc) {
      els.servicePills.appendChild(
        chip(svc, state.service === svc, function () { pickService(svc); })
      );
    });
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
      var b = chip(o.label, state.optionIndex === i, function () {
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
      var small = document.createElement("small");
      small.textContent = price;
      b.appendChild(small);
      els.scopePills.appendChild(b);
    });
  }

  function pickService(svc) {
    state.service = svc;
    state.optionIndex = null;
    els.service.value = svc;
    els.fScope.value = "";
    els.fOption.value = "";
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
    var days = sked.dayOptions(state.fill, need);
    els.dayGrid.innerHTML = "";
    days.slice(0, 10).forEach(function (d) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "day-chip" + (state.day === d.day ? " on" : "");
      b.disabled = !d.open;
      b.setAttribute("aria-pressed", state.day === d.day ? "true" : "false");
      b.innerHTML = "<span>" + d.label + "</span><small>" + (d.open ? "Open" : "Full") + "</small>";
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
      : "Pick a day, or leave it blank and we'll offer you the first opening.";
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
    if (!els.fRef.value) els.fRef.value = "EP-" + Date.now().toString(36).toUpperCase().slice(-6);

    var summary = {
      ref: els.fRef.value,
      service: state.service,
      scope: els.fScope.value,
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
    try { return JSON.parse(localStorage.getItem("ellingson-bookings-v1") || "[]"); }
    catch (e) { return []; }
  }

  function writeTruck(row) {
    try {
      localStorage.setItem("ellingson-bookings-v1", JSON.stringify([row].concat(readTruck()).slice(0, 24)));
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

  function render() {
    renderServicePills();
    renderScopePills();
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
})();

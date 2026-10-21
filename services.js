/* Services page = booking page.
   Tapping a job row opens ONE detail panel under it (accordion): scene, plain-language
   description, tips, price, then "Book this job" expands an inline form in the panel.
   The form posts through the existing pipeline: book.js (server re-price + calendar hold,
   returns the booking code) then the Netlify form "service-request", then thanks.html.
   Urgent jobs lead with Call + shutoff tips and offer "ASAP / today", which sets urgency
   to "Emergency — now" (existing pricebook rules: daytime surcharge or after-hours 1.5x).
   scenes.js loads on the first tap only. Reduced motion: end frame only (scenes.js). */
(function () {
  "use strict";
  var pb = window.EEPricebook, sk = window.EESchedule, T = window.EETips || {}, J = window.EEJobInfo || {};
  var panel = document.getElementById("optDetail"), form = document.getElementById("bookForm");
  if (!pb || !panel || !form) return;
  var host = panel.querySelector(".od-scene"), body = panel.querySelector(".od-body"), open = null, scenesP = null, seq = 0;
  var cur = null, fill = null, fillP = null;
  var EMERGENCY = "Emergency — now", PLANNED = "This week";
  /* Jobs that need fixing NOW: active leak, burst, freeze/no water, sewage backup. */
  var URGENT = { "Emergency repair": [0, 1, 2], "Frozen or burst pipe": [0, 1, 2], "Drain / sewer": [1] };
  function isUrgent(svc, i) { return (URGENT[svc] || []).indexOf(i) !== -1; }
  var TOWNS = ["Grand Forks", "East Grand Forks", "Fargo", "West Fargo", "Grafton", "Devils Lake", "Wahpeton", "Hillsboro", "Mayville", "Larimore", "Casselton", "Moorhead", "Crookston", "Thief River Falls", "Detroit Lakes", "Ada", "Warren", "Fertile", "Breckenridge", "Dilworth"];
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function track(n, p) { (window.EETrack || function () {})(n, p); }
  function loadScenes() {
    if (window.EEScenes) return Promise.resolve(window.EEScenes);
    if (!scenesP) scenesP = new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = "scenes.js"; s.async = true;
      s.onload = function () { window.EEScenes ? res(window.EEScenes) : rej(); };
      s.onerror = function () { scenesP = null; rej(); };
      document.head.appendChild(s);
    });
    return scenesP;
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function money(o) {
    if (o.low) return "$" + o.low.toLocaleString() + "–$" + o.high.toLocaleString();
    if (o.diagnostic) return "$" + pb.DIAGNOSTIC_FEE.low + "–$" + pb.DIAGNOSTIC_FEE.high + " diagnostic";
    return "Quoted on site";
  }
  var INCL = { "Water heater|2": "A water-heater flush is included in the Home Team Plan.", "Sump pump / flooding|3": "The pre-melt sump test is included in the Home Team Plan." };
  var REPAIR = { "Emergency repair": 1, "Drain / sewer": 1, "Frozen or burst pipe": 1, "Sump pump / flooding": 1, "Water heater": 1, "Fixture install": 1, "Something else": 1 };
  function nudge(svc, i) {
    var t = INCL[svc + "|" + i] || (REPAIR[svc] ? "We don’t just fix it — we prevent it. Members get priority and save 10% on repairs (up to $120)." : "");
    return t ? '<p class="od-plan">' + esc(t) + ' <a href="/plans.html">Home Team Plan →</a></p>' : "";
  }
  function getFill() {
    if (!fillP) fillP = fetch("/.netlify/functions/availability", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : {}; }).then(function (d) { fill = d.fill || []; }).catch(function () { fill = []; });
    return fillP;
  }

  // ------------------------------------------------------------- panel
  function close(focus) {
    if (!open) return;
    open.setAttribute("aria-expanded", "false");
    if (focus) open.focus();
    open = null; cur = null; panel.hidden = true; seq++;
    hideForm();
    if (window.EEScenes) window.EEScenes.cancel(host);
  }
  function show(btn, opts) {
    var svc = btn.getAttribute("data-svc"), i = +btn.getAttribute("data-idx");
    var o = pb.SERVICES[svc].options[i], info = (J[svc] || [])[i] || ["", ""];
    var tips = (T[svc] && (T[svc].o[i] || T[svc].all)) || [];
    var urgent = isUrgent(svc, i);
    if (open) open.setAttribute("aria-expanded", "false");
    open = btn; btn.setAttribute("aria-expanded", "true");
    cur = { svc: svc, i: i, o: o, urgent: urgent, name: btn.querySelector(".o-name").textContent };
    btn.parentNode.appendChild(panel);
    panel.classList.toggle("is-urgent", urgent);
    panel.setAttribute("aria-label", cur.name + " details");
    var tipsHtml = tips.length ? '<div class="od-tips"><p class="sl-tips-h">' + (urgent ? "Do this first" : "In the meantime") + "</p><ul>" +
      tips.slice(0, 3).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>" : "";
    var callBig = '<a class="btn btn-green btn-call-now" href="tel:+12187792553">Call now — (218) 779-2553</a>';
    body.innerHTML =
      (urgent ? '<p class="od-urgent" role="note"><b>Water moving or no water?</b> Call — it’s faster than any form.</p>' + callBig + tipsHtml : "") +
      '<p class="od-price"><b>' + money(o) + "</b>" + (o.note ? " <span>" + esc(o.note) + "</span>" : "") +
      (o.diagnostic ? " <span>" + esc(pb.DIAGNOSTIC_FEE.note) + "</span>" : "") +
      (urgent ? " <span>Right-now dispatch adds the published emergency rate; you see the number before you book.</span>" : "") + "</p>" +
      (info[0] ? "<p><b>What it usually means:</b> " + esc(info[0]) + "</p>" : "") +
      (info[1] ? "<p><b>What the plumber does:</b> " + esc(info[1]) + "</p>" : "") +
      (urgent ? "" : tipsHtml) + nudge(svc, i) +
      '<div class="od-btns">' +
      '<button type="button" class="btn ' + (urgent ? "btn-line" : "btn-green") + ' od-book" aria-expanded="false" aria-controls="bookForm">' + (urgent ? "Book online instead" : "Book this job") + "</button>" +
      (urgent ? "" : '<a class="btn btn-line" href="tel:+12187792553">Call (218) 779-2553</a>') + "</div>";
    hideForm();
    panel.hidden = false;
    var my = ++seq;
    loadScenes().then(function (S) {
      if (my !== seq) return;
      S.cancel(host);
      S.play(host, S.resolve({ service: svc, optionIndex: i }), {}).catch(function () {});
    }).catch(function () {});
    if (!(opts && opts.noScroll)) {
      var r = panel.getBoundingClientRect();
      if (r.top < 70 || r.top > innerHeight - 120) btn.scrollIntoView({ block: "start", behavior: RM ? "auto" : "smooth" });
    }
    track("service_detail_opened", { service: svc, option: i, urgent: urgent });
  }

  // ------------------------------------------------------------- inline booking form
  var F = function (n) { return form.elements[n]; };
  var dayRow = form.querySelector(".bf-days"), priceEl = form.querySelector(".bf-price"), jobEl = form.querySelector(".bf-job"), msg = form.querySelector(".bf-msg");
  var pick = null;   /* {kind:"asap"|"first"|"day", day} */
  function hideForm() { form.hidden = true; var b = body.querySelector(".od-book"); if (b) b.setAttribute("aria-expanded", "false"); panel.classList.remove("form-open"); }
  function urgency() { return pick && pick.kind === "asap" ? EMERGENCY : PLANNED; }
  function renderPrice() {
    var est = pb.estimate(cur.svc, cur.i, urgency());
    var range = pb.formatRange(est.range);
    priceEl.innerHTML = "<b>" + esc(range) + "</b><span>" + esc(est.notes.filter(function (n) { return !/^Starting estimate/.test(n); }).join(" ")) + "</span>";
    F("estimate").value = range;
  }
  function renderDays() {
    var need = (pb.SERVICES[cur.svc] || {}).slots || 2;
    var opts = sk ? sk.dayOptions(fill || [], need).filter(function (d) { return d.open; }).slice(0, 6) : [];
    var chips = [];
    if (cur.urgent) chips.push({ kind: "asap", label: "ASAP / today", sub: "Dispatch now" });
    chips.push({ kind: "first", label: "First available", sub: opts[0] ? opts[0].label : "We call to set it" });
    opts.forEach(function (d) { chips.push({ kind: "day", day: d.day, label: d.label.replace(/,.*/, ""), sub: d.label.replace(/^\w+,\s*/, "") }); });
    if (!pick || (pick.kind === "asap" && !cur.urgent)) pick = { kind: chips[0].kind, day: chips[0].day };
    dayRow.innerHTML = "";
    chips.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "bf-day"; b.setAttribute("role", "radio");
      var on = pick.kind === c.kind && (c.kind !== "day" || pick.day === c.day);
      b.setAttribute("aria-checked", on ? "true" : "false"); b.tabIndex = on ? 0 : -1;
      if (c.kind === "asap") b.classList.add("bf-asap");
      b.innerHTML = "<b>" + esc(c.label) + "</b><small>" + esc(c.sub) + "</small>";
      b.addEventListener("click", function () { pick = { kind: c.kind, day: c.day }; renderDays(); renderPrice(); dayRow.querySelector('[aria-checked="true"]').focus(); });
      dayRow.appendChild(b);
    });
  }
  dayRow.addEventListener("keydown", function (e) {
    var bs = Array.prototype.slice.call(dayRow.querySelectorAll(".bf-day")), k = bs.indexOf(document.activeElement);
    if (k < 0) return;
    var n = e.key === "ArrowRight" || e.key === "ArrowDown" ? k + 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? k - 1 : null;
    if (n == null) return; e.preventDefault(); bs[(n + bs.length) % bs.length].click();
  });
  function openForm(btn) {
    pick = null;
    btn.setAttribute("aria-expanded", "true");
    btn.parentNode.insertAdjacentElement("afterend", form);
    jobEl.textContent = cur.name;
    F("service").value = cur.svc; F("optionIndex").value = String(cur.i); F("scope").value = cur.o.label;
    form.hidden = false; panel.classList.add("form-open"); msg.textContent = "";
    clearErrs(); renderDays(); renderPrice();
    getFill().then(function () { if (!form.hidden) { renderDays(); } });
    F("name").focus({ preventScroll: true });
    form.scrollIntoView({ block: "nearest", behavior: RM ? "auto" : "smooth" });
    track("booking_form_opened", { service: cur.svc, option: cur.i, urgent: cur.urgent });
  }
  function err(name, text) {
    var el = F(name), m = form.querySelector('[data-err="' + name + '"]');
    el.setAttribute("aria-invalid", "true"); if (m) m.textContent = text;
  }
  function clearErrs() {
    ["name", "street", "phone", "email"].forEach(function (n) { F(n).removeAttribute("aria-invalid"); var m = form.querySelector('[data-err="' + n + '"]'); if (m) m.textContent = ""; });
  }
  function validate() {
    clearErrs(); var bad = null;
    if (!F("name").value.trim()) { err("name", "Your name, for the job ticket."); bad = bad || F("name"); }
    if (F("street").value.trim().length < 5) { err("street", "Street address and town, so the truck can find you."); bad = bad || F("street"); }
    if (F("phone").value.replace(/\D/g, "").length < 10) { err("phone", "A 10-digit number we can call back."); bad = bad || F("phone"); }
    var em = F("email").value.trim();
    if (em && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { err("email", "That email looks off — or leave it blank."); bad = bad || F("email"); }
    if (bad) bad.focus();
    return !bad;
  }
  function code() {
    var a = "ABCDEFGHJKMNPQRSTUVWXYZ23456789", s = "";
    for (var k = 0; k < 5; k++) s += a[Math.floor(Math.random() * a.length)];
    return "NF-" + s;
  }
  form.addEventListener("submit", async function (ev) {
    ev.preventDefault();
    if (!validate()) { track("booking_blocked", { service: cur.svc }); return; }
    var sub = form.querySelector(".bf-submit"); sub.disabled = true; sub.textContent = "Booking…";
    var urg = urgency(), asap = pick.kind !== "day";
    F("urgency").value = urg;
    F("day").value = pick.kind === "day" ? pick.day : "";
    F("window").value = urg === EMERGENCY ? "60–120 min target" : "First available";
    var addr = F("street").value.trim(), z = addr.match(/\b(\d{5})\b(?!.*\d{5})/);
    F("zip").value = z ? z[1] : "";
    F("town").value = TOWNS.filter(function (t) { return new RegExp("\\b" + t + "\\b", "i").test(addr); }).sort(function (a, b) { return b.length - a.length; })[0] || "";
    var held = null;
    try {
      var r = await fetch("/.netlify/functions/book", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: cur.svc, optionIndex: cur.i, urgency: urg, day: F("day").value || null, window: F("window").value, asap: asap }) });
      held = r.ok ? await r.json() : null;
    } catch (e) { held = null; }
    var moved = false;
    if (held && held.ok) {
      if (held.ref) F("ref").value = held.ref;
      if (held.confirmedDay) { moved = !!held.dayChanged; F("day").value = held.confirmedDay; }
      if (held.range) F("estimate").value = pb.formatRange(held.range);
    }
    if (!F("ref").value) F("ref").value = code();   /* book.js unreachable: readable client code, sent with the form */
    var day = F("day").value;
    var summary = {
      ref: F("ref").value, service: cur.svc, optionIndex: cur.i, scope: cur.o.label, job: cur.name,
      note: cur.o.note || "", estimate: F("estimate").value, emergency: urg === EMERGENCY,
      rawDay: day || null, moved: moved,
      when: urg === EMERGENCY ? "ASAP — dispatch today" : day && sk ? sk.formatDay(day) : "First available",
      window: F("window").value, address: addr, phone: F("phone").value,
    };
    try { sessionStorage.setItem("ee-last-order", JSON.stringify(summary)); } catch (e) {}
    track("booking_submitted", { service: cur.svc, scope: cur.o.label, urgency: urg, estimate: F("estimate").value, source: "services" });
    try {
      var r2 = await fetch("/", { method: "POST", body: new FormData(form) });
      if (!r2.ok) throw new Error("form " + r2.status);
      location.href = "/thanks.html";
    } catch (e) {
      sub.disabled = false; sub.textContent = "Book this job";
      msg.innerHTML = 'That didn’t go through. Please call <a href="tel:+12187792553">(218) 779-2553</a> — we’ll book it on the phone.';
    }
  });

  // ------------------------------------------------------------- events
  document.addEventListener("click", function (ev) {
    var t = ev.target;
    var b = t.closest && t.closest(".opt-btn");
    if (b) { if (b === open) close(false); else show(b); return; }
    var bk = t.closest && t.closest(".od-book");
    if (bk) { if (form.hidden) openForm(bk); else { hideForm(); bk.focus(); } }
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape" || !open) return;
    if (!form.hidden && form.contains(document.activeElement)) { var bk = body.querySelector(".od-book"); hideForm(); if (bk) bk.focus(); return; }
    close(true);
  });
  document.querySelectorAll(".svc-cat").forEach(function (d) {
    d.addEventListener("toggle", function () { if (!d.open && open && d.contains(open)) close(false); });
  });

  /* Deep links: /services.html?job=<service>[&opt=<index>][&book=1]; old /book.html?job= links forward here. */
  (function () {
    var q = new URLSearchParams(location.search), job = q.get("job");
    if (!job || !pb.SERVICES[job]) return;
    var oi = parseInt(q.get("opt"), 10);
    var btn = document.querySelector('.opt-btn[data-svc="' + job.replace(/"/g, '\\"') + '"][data-idx="' + (oi >= 0 ? oi : 0) + '"]');
    if (!btn) return;
    var cat = btn.closest("details"); if (cat) cat.open = true;
    if (oi >= 0) { show(btn, { noScroll: true }); if (q.get("book")) { var bk = body.querySelector(".od-book"); if (bk) openForm(bk); } }
    setTimeout(function () { (oi >= 0 ? btn : cat).scrollIntoView({ block: "start" }); }, 30);
  })();
})();

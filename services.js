/* Services page: tapping a job row opens one detail panel under it (accordion,
   one open at a time) with the job's scene, a plain-language description, the
   "In the meantime" tips, the price, and Book / Call. scenes.js and the scene
   files load only on the first tap (0 scene requests before). Reduced motion:
   scenes.js plays the end frame only. */
(function () {
  "use strict";
  var pb = window.EEPricebook, T = window.EETips || {}, J = window.EEJobInfo || {};
  var panel = document.getElementById("optDetail");
  if (!pb || !panel) return;
  var host = panel.querySelector(".od-scene"), open = null, scenesP = null, seq = 0;
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
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function money(o) {
    if (o.low) return "$" + o.low.toLocaleString() + "–$" + o.high.toLocaleString();
    if (o.diagnostic) return "$" + pb.DIAGNOSTIC_FEE.low + "–$" + pb.DIAGNOSTIC_FEE.high + " diagnostic";
    return "Quoted on site";
  }
  /* Home Team Plan nudge, only where the plan's published benefits apply. */
  var INCL = { "Water heater|2": "A water-heater flush is included in the Home Team Plan.", "Sump pump / flooding|3": "The pre-melt sump test is included in the Home Team Plan." };
  var REPAIR = { "Emergency repair": 1, "Drain / sewer": 1, "Frozen or burst pipe": 1, "Sump pump / flooding": 1, "Water heater": 1, "Fixture install": 1, "Something else": 1 };
  function nudge(svc, i) {
    var t = INCL[svc + "|" + i] || (REPAIR[svc] ? "Home Team members get priority scheduling and 10% off repairs." : "");
    return t ? '<p class="od-plan">' + esc(t) + ' <a href="/plans.html">See the plan ($29/mo) →</a></p>' : "";
  }
  function close(focus) {
    if (!open) return;
    open.setAttribute("aria-expanded", "false");
    if (focus) open.focus();
    open = null; panel.hidden = true; seq++;
    if (window.EEScenes) window.EEScenes.cancel(host);
  }
  function show(btn) {
    var svc = btn.getAttribute("data-svc"), i = +btn.getAttribute("data-idx");
    var o = pb.SERVICES[svc].options[i], info = (J[svc] || [])[i] || ["", ""];
    var tips = (T[svc] && (T[svc].o[i] || T[svc].all)) || [];
    if (open) open.setAttribute("aria-expanded", "false");
    open = btn; btn.setAttribute("aria-expanded", "true");
    btn.parentNode.appendChild(panel);           /* directly under the row */
    panel.setAttribute("aria-label", btn.querySelector(".o-name").textContent + " details");
    var q = "job=" + encodeURIComponent(svc) + "&opt=" + i;
    panel.querySelector(".od-body").innerHTML =
      '<p class="od-price"><b>' + money(o) + "</b>" + (o.note ? " <span>" + esc(o.note) + "</span>" : "") +
      (o.diagnostic ? " <span>" + esc(pb.DIAGNOSTIC_FEE.note) + "</span>" : "") + "</p>" +
      (info[0] ? "<p><b>What it usually means:</b> " + esc(info[0]) + "</p>" : "") +
      (info[1] ? "<p><b>What the plumber does:</b> " + esc(info[1]) + "</p>" : "") +
      (tips.length ? '<div class="od-tips" aria-live="polite"><p class="sl-tips-h">In the meantime</p><ul>' +
        tips.slice(0, 3).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>" : "") +
      nudge(svc, i) +
      '<div class="od-btns"><a class="btn btn-line" href="/book.html?' + q + '">Book this job</a>' +
      '<a class="btn btn-green" href="tel:+12187792553">Call (218) 779-2553</a></div>';
    panel.hidden = false;
    var my = ++seq;
    loadScenes().then(function (S) {
      if (my !== seq) return;
      S.cancel(host);
      S.play(host, S.resolve({ service: svc, optionIndex: i }), {}).catch(function () {});
    }).catch(function () {});
    var r = panel.getBoundingClientRect();
    if (r.top < 70 || r.top > innerHeight - 120) btn.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest(".opt-btn");
    if (!b) return;
    if (b === open) close(false); else show(b);
  });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && open) close(true); });
  document.querySelectorAll(".svc-cat").forEach(function (d) {
    d.addEventListener("toggle", function () { if (!d.open && open && d.contains(open)) close(false); });
  });
})();

/* Shared page chrome: sticky-header shadow, reveal-on-scroll, footer year,
   active season card, and the mobile tab bar's "More" sheet. */
(function () {
  "use strict";
  var hdr = document.getElementById("siteHeader");
  if (hdr) addEventListener("scroll", function () { hdr.classList.toggle("scrolled", scrollY > 8); }, { passive: true });
  var rv = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { threshold: 0.12 });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add("in"); });
  var yr = document.getElementById("yr"); if (yr) yr.textContent = new Date().getFullYear();
  var m = String(new Date().getMonth() + 1);
  var lab = document.getElementById("seasonLabel"), cp = document.getElementById("seasonCopy"), ico = document.querySelector(".st-ico");
  if (lab && cp) {
    var n = +m, S = n >= 11 || n <= 2 ? ["Freeze watch:", "Leave a drip on exposed lines on below-zero nights, and know where your main shutoff is.", "\u2744"]
      : n <= 6 ? ["Melt & sump season:", "Pour a bucket in the sump pit — the pump should kick on. If it doesn’t, call before the river rises.", "\u2248"]
      : n <= 9 ? ["Hard-water season:", "Scale is quiet until the heater fails. A flush now beats a cold shower in January.", "\u25C9"]
      : ["Freeze-up is coming:", "Disconnect garden hoses and shut the inside valve to outdoor faucets before the first hard frost.", "\u2744"];
    lab.textContent = S[0]; cp.textContent = S[1]; if (ico) ico.textContent = S[2];
  }
  document.querySelectorAll(".szn").forEach(function (el) {
    if ((el.getAttribute("data-months") || "").split(",").indexOf(m) !== -1) el.classList.add("active");
  });
  var more = document.querySelector(".tab-more");
  if (more) {
    document.addEventListener("click", function (ev) { if (more.open && !more.contains(ev.target)) more.open = false; });
    var sc = more.querySelector(".sheet-chat"), cb = document.getElementById("eeChatBtn");
    if (sc && cb) sc.addEventListener("click", function () { more.open = false; cb.click(); });
    else if (sc) sc.hidden = true;
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && more.open) { more.open = false; more.querySelector("summary").focus(); } });
  }
})();

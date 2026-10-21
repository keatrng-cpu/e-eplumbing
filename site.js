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
  document.querySelectorAll(".szn").forEach(function (el) {
    if ((el.getAttribute("data-months") || "").split(",").indexOf(m) !== -1) el.classList.add("active");
  });
  var more = document.querySelector(".tab-more");
  if (more) {
    document.addEventListener("click", function (ev) { if (more.open && !more.contains(ev.target)) more.open = false; });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && more.open) { more.open = false; more.querySelector("summary").focus(); } });
  }
})();

/* Hero: draw-on when the walk lane is first seen, then scroll-linked walk (--p 0→1).
   CSS scroll-driven animation when supported; rAF fallback otherwise. Never touches the CTAs' layout. */
(function () {
  "use strict";
  var lane = document.getElementById("heroLane");
  if (!lane) return;
  var hero = lane.closest(".hero");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { lane.classList.add("static"); return; }
  var sda = window.CSS && CSS.supports("animation-timeline: view()") && CSS.supports("timeline-scope: --a");
  if (sda) hero.classList.add("sda");
  else {
    var ticking = false;
    var update = function () {
      ticking = false;
      var r = lane.getBoundingClientRect(), vh = innerHeight;
      var p = (vh - r.top) / (0.62 * (vh + r.height));
      hero.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(4));
    };
    addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("resize", update);
    update();
  }
  var draw = function () { lane.classList.add("draw"); };
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); draw(); } }, { threshold: 0.2 });
    io.observe(lane);
  } else draw();
})();

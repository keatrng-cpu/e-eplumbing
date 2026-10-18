/* Hero mascot (v4 ink): after the page has loaded, fetch the frame drawings (assets/hero-mascot.js),
   then, once the lane is on screen: draw-on, weighted walk with the board and hammer, set the board down, hat tip.
   Reduced motion: the settled end frame, no animation. Never touches the CTAs' layout (the lane is decorative, aria-hidden). */
(function () {
  "use strict";
  var lane = document.getElementById("heroLane");
  if (!lane) return;
  var walker = lane.querySelector(".hero-walker");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function idle(fn) { (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(fn, { timeout: 1500 }); }
  function load(cb) {
    if (window.EEHeroData) return cb();
    var s = document.createElement("script");
    s.src = "assets/hero-mascot.js?v=4"; s.async = true; s.onload = cb;
    document.head.appendChild(s);
  }
  function build() {
    var D = window.EEHeroData; if (!D) return;
    var defs = "", k;
    for (k in D.f) defs += '<g id="hm-' + k + '">' + D.f[k] + "</g>";
    walker.innerHTML = '<svg viewBox="' + D.vb + '" aria-hidden="true" focusable="false"><defs>' + defs +
      '<mask id="hmMask" maskUnits="userSpaceOnUse" x="-80" y="-40" width="860" height="680"><path class="hm-scrib" d="' + D.scrib +
      '" fill="none" stroke="#fff" stroke-width="84" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></mask></defs>' +
      '<g class="hm-board" style="display:none">' + D.board + '</g><g class="hm-fig"><use href="#hm-wA"/></g></svg>';
    var fig = walker.querySelector(".hm-fig"), use = fig.firstChild, brd = walker.querySelector(".hm-board"), cur = "wA";
    function show(f) { if (f !== cur) { use.setAttribute("href", "#hm-" + f); cur = f; } }
    function geom() {
      var W = lane.clientWidth, w = walker.offsetWidth;
      return { x0: 0, x1: Math.max(Math.min(W - w, W * 0.56), w * 0.64) };
    }
    if (reduce) { var g0 = geom(); walker.style.transform = "translateX(" + g0.x1 + "px)"; brd.style.display = ""; show("r"); return; }
    fig.setAttribute("mask", "url(#hmMask)");
    var started = false;
    function run() {
      if (started) return; started = true;
      lane.classList.add("draw");
      var g = geom(), t0 = performance.now(), WALK = [1000, 3400], STEP = 150, CYC = ["wA", "wB", "wC", "wD"];
      function tick(now) {
        var t = now - t0, x;
        if (t > 1000 && fig.hasAttribute("mask")) fig.removeAttribute("mask");
        if (t < WALK[0]) { x = g.x0; show("wA"); }
        else if (t < WALK[1]) {
          var u = (t - WALK[0]) / (WALK[1] - WALK[0]);
          x = g.x0 + (g.x1 - g.x0) * (0.7 * u + 0.3 * (0.5 - 0.5 * Math.cos(Math.PI * u)));
          show(CYC[Math.floor((t - WALK[0]) / STEP) % 4]);
        } else {
          x = g.x1;
          var f = t < 3700 ? "s1" : t < 4100 ? "s2" : t < 4500 ? "r" : t < 4700 ? "t1" : t < 5300 ? "t2" : t < 5500 ? "t1" : "r";
          if (f !== "s1") brd.style.display = "";
          show(f);
        }
        walker.style.transform = "translateX(" + x.toFixed(1) + "px)";
        if (t < 5600) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.3 });
      io.observe(lane);
    } else run();
    window.EEHero = { seek: function (f) { started = true; fig.removeAttribute("mask"); brd.style.display = /^(s2|r|t)/.test(f) ? "" : "none"; show(f); var gg = geom(); walker.style.transform = "translateX(" + (/^w/.test(f) ? gg.x1 * 0.5 : gg.x1) + "px)"; } };
  }
  function go() { idle(function () { load(build); }); }
  if (document.readyState === "complete") go(); else addEventListener("load", go);
})();

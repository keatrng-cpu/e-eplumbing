/* Hero mascot stage (v7: illustrated plain-cap mascot frames, assets/hero7/*.webp, cream ink on transparent; stage lines still vector). The stage box has a fixed height in CSS, so nothing shifts when the drawings arrive.
   After window load the frames (assets/hero-mascot.js) are fetched; when the stage is on screen he draws himself on,
   walks in with the board and hammer, sets the board down and tips his hat. Scrolling the stage back into view replays the tip.
   Reduced motion: the settled still. The stage is decorative (aria-hidden) and never overlaps the H1, CTAs or booking card. */
(function () {
  "use strict";
  var stage = document.getElementById("heroLane");
  if (!stage) return;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var narrow = window.matchMedia && matchMedia("(max-width: 920px)");
  function idle(fn) { (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(fn, { timeout: 1500 }); }
  function load(cb) {
    if (window.EEHeroData) return cb();
    var s = document.createElement("script");
    s.src = "assets/hero-mascot.js?v=7"; s.async = true; s.onload = cb;
    document.head.appendChild(s);
  }
  function build() {
    var D = window.EEHeroData; if (!D) return;
    var defs = "", k;
    for (k in D.f) if (!reduce || k === "r") defs += '<g id="hm-' + k + '">' + D.f[k] + "</g>";   /* reduced motion: only the settled frame is fetched */
    var vb = narrow && narrow.matches ? "250 16 750 552" : D.vb;
    stage.insertAdjacentHTML("beforeend", '<svg viewBox="' + vb + '" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false"><defs>' + defs +
      '<mask id="hmMask" maskUnits="userSpaceOnUse" x="-80" y="-40" width="860" height="680"><path class="hm-scrib" d="' + D.scrib +
      '" fill="none" stroke="#fff" stroke-width="84" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></mask></defs>' +
      D.stage + '<g class="hm-walker"><g class="hm-board" style="display:none">' + D.board + '</g><g class="hm-fig"><use href="#hm-wA"/></g></g></svg>');
    var svg = stage.querySelector("svg"), wk = svg.querySelector(".hm-walker"), fig = svg.querySelector(".hm-fig"), use = fig.firstChild,
        brd = svg.querySelector(".hm-board"), cur = "wA";
    if (narrow) narrow.addEventListener && narrow.addEventListener("change", function (e) { svg.setAttribute("viewBox", e.matches ? "250 16 750 552" : D.vb); });
    function show(f) { if (f !== cur) { use.setAttribute("href", "#hm-" + f); cur = f; } }
    function at(x) { wk.setAttribute("transform", "translate(" + x.toFixed(1) + " 0)"); }
    if (reduce) { at(D.xf); brd.style.display = ""; show("r"); return; }
    at(D.x0); fig.setAttribute("mask", "url(#hmMask)");
    var state = 0, raf = 0;   /* 0 idle, 1 running, 2 settled */
    function play(seq, done) {
      cancelAnimationFrame(raf);
      var t0 = performance.now();
      (function tick(now) { var r = seq(now - t0); if (r !== false) raf = requestAnimationFrame(tick); else if (done) done(); })(t0);
    }
    var CYC = ["wA", "wB", "wC", "wD"], STEP = 150;
    function intro(t) {
      if (t > 1000 && fig.hasAttribute("mask")) fig.removeAttribute("mask");
      if (t < 1000) { at(D.x0); show("wA"); return; }
      if (t < 3400) {
        var u = (t - 1000) / 2400;
        at(D.x0 + (D.xf - D.x0) * (0.7 * u + 0.3 * (0.5 - 0.5 * Math.cos(Math.PI * u))));
        show(CYC[Math.floor((t - 1000) / STEP) % 4]); return;
      }
      at(D.xf);
      if (t >= 3700) brd.style.display = "";
      show(t < 3700 ? "s1" : t < 4100 ? "s2" : t < 4500 ? "r" : t < 4700 ? "t1" : t < 5300 ? "t2" : t < 5500 ? "t1" : "r");
      return t < 5600;
    }
    function tipAgain(t) { show(t < 200 ? "t1" : t < 800 ? "t2" : t < 1000 ? "t1" : "r"); return t < 1100; }
    function enter() {
      if (state === 0) { state = 1; stage.classList.add("draw"); play(intro, function () { state = 2; }); }
      else if (state === 2) { state = 1; play(tipAgain, function () { state = 2; }); }
    }
    if ("IntersectionObserver" in window) {
      var seen = false;
      new IntersectionObserver(function (es) {
        var e = es[0];
        if (e.isIntersecting && (!seen || e.intersectionRatio >= 0.5)) { seen = true; enter(); }
      }, { threshold: [0.3, 0.5] }).observe(stage);
    } else enter();
    window.EEHero = { seek: function (f) {
      cancelAnimationFrame(raf); state = 2; fig.removeAttribute("mask"); stage.classList.add("draw");
      brd.style.display = /^(s2|r|t)/.test(f) ? "" : "none"; show(f);
      at(/^w/.test(f) ? (D.x0 + D.xf) / 2 : D.xf);
    } };
  }
  function go() { idle(function () { load(build); }); }
  if (document.readyState === "complete") go(); else addEventListener("load", go);
})();

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
    /* v7.3 flash fix: every frame is a live layer in the figure (not <defs>+<use>, which WebKit leaves unfetched/undecoded
       until first shown, so the figure painted empty at the walk->set-down swap). All frame files are decoded before the
       intro starts; a swap shows the new layer first and hides the old one a frame later, so the stage is never empty. */
    var keys = reduce ? ["r"] : Object.keys(D.f), layers = "", k;
    keys.forEach(function (k) { layers += '<g class="hm-f" data-k="' + k + '" style="opacity:0">' + D.f[k] + "</g>"; });
    var vb = narrow && narrow.matches ? "250 16 750 552" : D.vb;
    stage.insertAdjacentHTML("beforeend", '<svg viewBox="' + vb + '" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false"><defs>' +
      '<mask id="hmMask" maskUnits="userSpaceOnUse" x="-80" y="-40" width="860" height="680"><path class="hm-scrib" d="' + D.scrib +
      '" fill="none" stroke="#fff" stroke-width="84" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></mask></defs>' +
      D.stage + '<g class="hm-walker"><g class="hm-board" style="display:none">' + D.board + '</g><g class="hm-fig">' + layers + '</g></g></svg>');
    var svg = stage.querySelector("svg"), wk = svg.querySelector(".hm-walker"), fig = svg.querySelector(".hm-fig"),
        brd = svg.querySelector(".hm-board"), cur = null, L = {}, hideT = 0;
    Array.prototype.forEach.call(fig.children, function (g) { L[g.getAttribute("data-k")] = g; });
    if (narrow) narrow.addEventListener && narrow.addEventListener("change", function (e) { svg.setAttribute("viewBox", e.matches ? "250 16 750 552" : D.vb); });
    /* decode every distinct frame file up front (HTMLImageElement.decode fills the same cache the SVG images read) */
    var urls = {}; keys.forEach(function (k) { var m = /href="([^"]+)"/.exec(D.f[k]); if (m) urls[m[1]] = 1; });
    var ready = Promise.all(Object.keys(urls).map(function (u) {
      var im = new Image(); im.src = u;
      return (im.decode ? im.decode() : new Promise(function (r) { im.onload = im.onerror = r; })).catch(function () {});
    }));
    function show(f, fade) {
      if (f === cur || !L[f]) return;
      var old = cur ? L[cur] : null, nu = L[f]; cur = f;
      if (old && old !== nu) fig.appendChild(nu);               /* new layer on top */
      nu.style.transition = fade ? "opacity " + fade + "ms ease" : "";
      nu.style.opacity = "1";
      if (old) {
        clearTimeout(hideT);
        var drop = function () { Array.prototype.forEach.call(fig.children, function (g) { if (g !== L[cur]) { g.style.transition = ""; g.style.opacity = "0"; } }); };
        if (fade) hideT = setTimeout(drop, fade + 30);           /* old stays under the fade, removed after */
        else requestAnimationFrame(function () { requestAnimationFrame(drop); });   /* hide the old one only after the new one has painted */
      }
    }
    function at(x) { wk.setAttribute("transform", "translate(" + x.toFixed(1) + " 0)"); }
    if (reduce) { at(D.xf); brd.style.display = ""; show("r"); return; }
    at(D.x0); show("wA"); fig.setAttribute("mask", "url(#hmMask)");
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
      if (t >= 3700 && t < 4100) { show("s2", 220); return true; }   /* plank set-down: short crossfade s1 -> plank on floor */
      show(t < 3700 ? "s1" : t < 4100 ? "s2" : t < 4500 ? "r" : t < 4700 ? "t1" : t < 5300 ? "t2" : t < 5500 ? "t1" : "r");
      return t < 5600;
    }
    function tipAgain(t) { show(t < 200 ? "t1" : t < 800 ? "t2" : t < 1000 ? "t1" : "r"); return t < 1100; }
    function enter() {
      if (state === 0) { state = 1; ready.then(function () { stage.classList.add("draw"); play(intro, function () { state = 2; }); }); }
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

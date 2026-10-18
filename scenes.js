/* Ellingson job-confirmation scenes.
 * Engine + shared prop/effect library + per-job scene registry.
 * Palette is locked to the site variables: ink #0B0F0D, kelly #009A44 (+ its tints), cream/mist #F1F6F2.
 * Every scene is built from short beats (300–600 ms), lasts ~2.6 s, and has a static end frame
 * under prefers-reduced-motion (all finite animations are finished immediately).
 *
 * Registry: scene keys are resolved per pricebook option first ("Service|optionIndex"),
 * then per JOBS id, then "other". Add a scene with EEScenes.define(key, label, fn) and map it in OPTION_SCENES.
 */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var C = { ink: "#0B0F0D", cream: "#F1F6F2", kelly: "#009A44", dark: "#007433", deep: "#003C1B", line: "#DDE7DF",
    wt: "rgba(0,154,68,.14)", wm: "rgba(0,154,68,.32)", ws: "rgba(0,154,68,.62)", inkT: "rgba(11,15,13,.35)" };
  var SETTLE = "cubic-bezier(.3,.7,.2,1)", IN = "cubic-bezier(.55,0,.8,.2)", OUT = "cubic-bezier(.2,.8,.3,1)", LIN = "linear";
  var FLOOR = 332;

  function h(parent, markup) { var g = document.createElementNS(NS, "g"); g.innerHTML = markup || ""; parent.appendChild(g); return g; }
  function q(root, sel) { return root.querySelector(sel); }
  function rm() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }

  /* ---------- scene context ---------- */
  function Ctx(host) {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 800 360");
    s.setAttribute("aria-hidden", "true");
    host.appendChild(s);
    this.svg = s; this.anims = []; this.end = 0;
    h(s, '<line x1="0" y1="' + (FLOOR + 2) + '" x2="800" y2="' + (FLOOR + 2) + '" stroke="' + C.line + '" stroke-width="4"/>');
    this.root = h(s, "");
    var r = this.root;
    r.setAttribute("fill", "none"); r.setAttribute("stroke", C.ink); r.setAttribute("stroke-width", "5");
    r.setAttribute("stroke-linecap", "round"); r.setAttribute("stroke-linejoin", "round");
    this.back = h(r, ""); this.mid = h(r, ""); this.front = h(r, "");
  }
  Ctx.prototype.add = function (m, layer) {
    var g = h(layer || this.front, m);
    /* single-element markup with opacity="0": hoist it to the wrapper so animating the wrapper reveals it */
    if (g.children.length === 1 && g.firstElementChild.getAttribute("opacity") === "0") { g.firstElementChild.removeAttribute("opacity"); g.setAttribute("opacity", "0"); }
    return g;
  };
  /* animate: o = {t:start, d:duration, e:easing, i:iterations, o:transform-origin, dir} */
  Ctx.prototype.a = function (el, kf, o) {
    if (!el) return null;
    o = o || {};
    if (!el.hasAttribute("data-part")) { el.style.transformBox = "fill-box"; el.style.transformOrigin = o.o || "50% 50%"; }
    var an = el.animate(kf, { duration: o.d || 400, delay: o.t || 0, easing: o.e || SETTLE, iterations: o.i || 1, fill: "forwards", direction: o.dir || "normal" });
    this.anims.push(an);
    this.end = Math.max(this.end, (o.t || 0) + (o.d || 400) * (o.i || 1));
    return an;
  };
  Ctx.prototype.show = function (el, t, d) { el.setAttribute("opacity", "0"); return this.a(el, [{ opacity: 0 }, { opacity: 1 }], { t: t, d: d || 250 }); };
  Ctx.prototype.hide = function (el, t, d) { return this.a(el, [{ opacity: 1 }, { opacity: 0 }], { t: t, d: d || 250 }); };
  Ctx.prototype.draw = function (el, t, d, e) { /* stroke draw-on for every path inside el */
    var self = this;
    [].forEach.call(el.tagName === "path" ? [el] : el.querySelectorAll("path,line,polyline,circle,ellipse,rect"), function (p, i) {
      p.setAttribute("pathLength", "1"); p.style.strokeDasharray = "1 1"; p.style.strokeDashoffset = "1";
      self.a(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { t: t + i * 60, d: d || 420, e: e || "cubic-bezier(.55,.1,.3,1)" });
    });
  };
  Ctx.prototype.move = function (el, from, to, o) { return this.a(el, [{ transform: from }, { transform: to }], o); };

  /* ---------- mascot ---------- */
  Ctx.prototype.mascot = function (o) {
    o = o || {};
    var w = o.w || 290, k = w / 700, x = o.x == null ? 90 : o.x, y = FLOOR - 562 * k;
    var wrap = h(o.layer || this.mid, window.EEMascotSVG || "");
    var svg = wrap.querySelector("svg");
    svg.setAttribute("x", x); svg.setAttribute("y", y); svg.setAttribute("width", w); svg.setAttribute("height", 580 * k);
    svg.removeAttribute("role"); svg.setAttribute("aria-hidden", "true");
    svg.style.color = C.ink; svg.style.overflow = "visible";
    [].forEach.call(svg.querySelectorAll("[data-part]"), function (p) { p.style.transformBox = "view-box"; });
    var m = {
      wrap: wrap, svg: svg, k: k, x: x, y: y,
      p: function (n) { return svg.querySelector(".mp-" + n); },
      at: function (mx, my) { return [x + mx * k, y + my * k]; },
    };
    if (!o.board) { m.p("board").style.display = "none"; m.p("belly").style.display = ""; }
    if (o.tool !== true) [].forEach.call(m.p("tool").querySelectorAll(":scope>path"), function (p) { p.style.display = "none"; });
    /* hold(): prop in the tool hand (mascot coords, fist at 322,358). carry(): prop in the arm hand (~505,272). */
    m.hold = function (markup) { var g = document.createElementNS(NS, "g"); g.innerHTML = markup; m.p("tool").insertBefore(g, m.p("hand")); return g; };
    m.carried = [];
    m.carry = function (markup) { var g = h(m.p("arm"), markup); m.carried.push(g); return g; };
    return m;
  };
  /* mascot beats (each 300–600 ms, no overshoot) */
  function walkIn(c, m, t, dist, d) {
    d = d || 600;
    c.a(m.wrap, [{ transform: "translateX(" + -dist + "px)" }, { transform: "none" }], { t: t, d: d, e: OUT });
    c.a(m.p("leg-front"), [{ transform: "rotate(14deg)" }, { transform: "rotate(-10deg)" }, { transform: "rotate(8deg)" }, { transform: "none" }], { t: t, d: d, e: LIN });
    c.a(m.p("leg-back"), [{ transform: "rotate(-12deg)" }, { transform: "rotate(9deg)" }, { transform: "rotate(-6deg)" }, { transform: "none" }], { t: t, d: d, e: LIN });
    c.a(m.p("body"), [{ transform: "none" }, { transform: "translateY(-6px)" }, { transform: "none" }, { transform: "translateY(-5px)" }, { transform: "none" }], { t: t, d: d, e: LIN });
  }
  function tipHat(c, m, t) {
    c.a(m.p("arm"), [{ transform: "none" }, { transform: "rotate(-72deg)" }, { transform: "rotate(-72deg)" }, { transform: "rotate(-60deg)" }], { t: t, d: 700 });
    c.a(m.p("hat"), [{ transform: "none" }, { transform: "none" }, { transform: "translate(10px,-30px) rotate(-14deg)" }], { t: t, d: 700 });
  }
  function dip(c, m, t, d, depth) { c.a(m.p("body"), [{ transform: "none" }, { transform: "translateY(" + (depth || 10) + "px)" }, { transform: "none" }], { t: t, d: d || 360 }); }
  function swing(c, part, t, from, to, d, n) { /* tool/arm strike: n short purposeful strokes */
    c.a(part, [{ transform: "rotate(" + from + "deg)" }, { transform: "rotate(" + to + "deg)" }, { transform: "rotate(" + from + "deg)" }], { t: t, d: d || 360, i: n || 1, e: "cubic-bezier(.6,0,.4,1)" });
  }

  /* ---------- shared props & effects ---------- */
  var P = {
    drop: function (x, y, s) { s = s || 1; return '<path d="M' + x + "," + (y - 9 * s) + " C" + (x + 6 * s) + "," + (y - 2 * s) + " " + (x + 6 * s) + "," + (y + 5 * s) + " " + x + "," + (y + 5 * s) + " C" + (x - 6 * s) + "," + (y + 5 * s) + " " + (x - 6 * s) + "," + (y - 2 * s) + " " + x + "," + (y - 9 * s) + 'Z" fill="' + C.wm + '" stroke-width="2.5"/>'; },
    pipeH: function (x1, x2, y, r) { r = r || 13; return '<path d="M' + x1 + "," + (y - r) + " H" + x2 + " M" + x1 + "," + (y + r) + " H" + x2 + '"/><rect x="' + x1 + '" y="' + (y - r) + '" width="' + (x2 - x1) + '" height="' + 2 * r + '" fill="' + C.cream + '" stroke="none"/><path d="M' + x1 + "," + (y - r) + " H" + x2 + " M" + x1 + "," + (y + r) + " H" + x2 + '"/>'; },
    pipeV: function (x, y1, y2, r) { r = r || 13; return '<rect x="' + (x - r) + '" y="' + y1 + '" width="' + 2 * r + '" height="' + (y2 - y1) + '" fill="' + C.cream + '" stroke="none"/><path d="M' + (x - r) + "," + y1 + " V" + y2 + " M" + (x + r) + "," + y1 + " V" + y2 + '"/>'; },
    coupling: function (x, y, r) { r = r || 13; return '<rect x="' + (x - 9) + '" y="' + (y - r - 5) + '" width="18" height="' + (2 * r + 10) + '" rx="3" fill="' + C.cream + '"/>'; },
    wall: function (x) { return '<path d="M' + x + ',40 V' + FLOOR + '" stroke="' + C.line + '" stroke-width="6"/>'; },
    frost: function (x, y, s) { s = s || 1; return '<g stroke-width="2.2" transform="translate(' + x + "," + y + ") scale(" + s + ')"><path d="M0,-7 V7 M-6,-3.5 L6,3.5 M-6,3.5 L6,-3.5"/></g>'; },
    check: function (x, y, r) { r = r || 22; return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" stroke="' + C.kelly + '" stroke-width="5" fill="#fff"/><path d="M' + (x - r * 0.45) + "," + y + " L" + (x - r * 0.1) + "," + (y + r * 0.35) + " L" + (x + r * 0.5) + "," + (y - r * 0.38) + '" stroke="' + C.kelly + '" stroke-width="6"/>'; },
    tank: function (x, y, w, hgt) { /* water-heater style tank, returns markup with .fill slot */
      return '<rect class="tank-fill" x="' + (x + 4) + '" y="' + (y + 18) + '" width="' + (w - 8) + '" height="' + (hgt - 22) + '" fill="' + C.cream + '" stroke="none"/>' +
        '<path d="M' + x + "," + (y + 20) + " C" + x + "," + (y + 4) + " " + (x + w * 0.2) + "," + y + " " + (x + w / 2) + "," + y + " C" + (x + w * 0.8) + "," + y + " " + (x + w) + "," + (y + 4) + " " + (x + w) + "," + (y + 20) + " V" + (y + hgt) + " H" + x + 'Z"/>' +
        '<path d="M' + (x + w * 0.3) + "," + (y + 2) + " V" + (y - 28) + " M" + (x + w * 0.7) + "," + (y + 2) + " V" + (y - 28) + '"/>' +
        '<rect x="' + (x + w / 2 - 14) + '" y="' + (y + hgt - 36) + '" width="28" height="20" rx="3"/>';
    },
    wrench: function () { return '<g transform="translate(322,358)"><path d="M0,0 L0,-150" stroke-width="22"/><path d="M-26,-150 C-34,-190 -8,-210 0,-196 C8,-210 34,-190 26,-150 Z" stroke-width="16" fill="currentColor"/></g>'; },
    /* front-hand tools, mascot coords, start at the arm hand (505,272) and point at the work */
    wrenchH: function () { return '<path d="M505,272 L770,282" stroke-width="18"/><path d="M766,250 C806,240 820,270 796,282 C820,294 806,324 766,314 Z" fill="' + C.ink + '" stroke-width="12"/>'; },
    plungerArt: function () { return '<path d="M0,-150 V0" stroke-width="7"/><path d="M-28,0 C-28,-22 28,-22 28,0 Z" fill="' + C.ink + '"/>'; },
  };
  var FX = {
    spray: function (c, x, y, dir, t, d, n) {
      var g = c.add('<g transform="translate(' + x + "," + y + ") rotate(" + dir + ')"></g>');
      var gg = g.firstChild, reps = Math.max(1, Math.round(d / 420));
      for (var i = 0; i < (n || 7); i++) {
        var ang = -40 + (80 / ((n || 7) - 1)) * i, len = 70 + (i % 3) * 18;
        var dg = h(gg, '<g transform="rotate(' + ang + ')">' + P.drop(0, 0, 0.9 + (i % 2) * 0.25) + "</g>");
        var dd = dg.firstChild.firstChild;
        dd.setAttribute("opacity", "0");
        c.a(dd, [{ transform: "translate(0,0) rotate(90deg)", opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: "translate(" + len + "px,0) rotate(90deg)", opacity: 0 }], { t: t + i * 55, d: 420, i: reps, e: "cubic-bezier(.2,.6,.4,1)" });
      }
      return g;
    },
    drips: function (c, x, y, fall, t, n, gap) {
      for (var i = 0; i < n; i++) {
        var g = c.add(P.drop(x, y, 0.9)); g.setAttribute("opacity", "0");
        c.a(g, [{ transform: "translateY(0)", opacity: 0 }, { opacity: 1, offset: 0.15 }, { transform: "translateY(" + fall + "px)", opacity: 0.0 }], { t: t + i * (gap || 420), d: 420, e: IN });
      }
    },
    steam: function (c, x, y, t, n) {
      for (var i = 0; i < (n || 3); i++) {
        var dx = (i - 1) * 16;
        var s = c.add('<path d="M' + (x + dx) + "," + y + " c-10,-14 10,-22 0,-36 c-10,-14 10,-22 0,-36" + '" stroke="' + C.ws + '" stroke-width="4"/>');
        c.draw(s, t + i * 160, 520);
        c.a(s, [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-22px)", opacity: 0 }], { t: t + i * 160 + 520, d: 600, e: LIN });
      }
    },
    word: function (c, txt, x, y, t, size) {
      var g = c.add('<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="' + (size || 30) + '" letter-spacing="1.5" fill="' + C.ink + '" stroke="none">' + txt + "</text>");
      g.setAttribute("opacity", "0");
      c.a(g, [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { t: t, d: 300 });
      return g;
    },
    check: function (c, x, y, t) { var g = c.add(P.check(x, y)); c.show(g, t, 120); c.draw(g, t, 380); return g; },
    puddle: function (c, x, y, w, t) { var g = c.add('<ellipse cx="' + x + '" cy="' + y + '" rx="' + w + '" ry="6" fill="' + C.wt + '" stroke="none"/>', c.back); c.a(g, [{ transform: "scaleX(.1)", opacity: 0 }, { transform: "none", opacity: 1 }], { t: t, d: 600 }); return g; },
  };
  /* shared finale: green check + hat tip, ~700 ms */
  function finale(c, m, t, x, y) {
    m.carried.forEach(function (g) { c.a(g, [{ opacity: 1 }, { opacity: 0 }], { t: t, d: 160 }); }); /* free hand for the tip */
    FX.check(c, x || 742, y || 62, t); tipHat(c, m, t + 120);
  }

  /* ---------- registry ---------- */
  var SCENES = {};
  function define(key, label, fn) { SCENES[key] = { key: key, label: label, fn: fn }; }
  var OPTION_SCENES = {
    "Emergency repair": ["shutoff", "burst", "freezethaw", "diagnose"],
    "Drain / sewer": ["clog", "mainline", "hydrojet", "cleanout", "cammain", "cambranch"],
    "Water heater": ["tankswap", "tankcode", "flush", "nohot", "tankless"],
    "Sump pump / flooding": ["sumpswap", "battery", "checkvalve", "sumptest"],
    "Frozen or burst pipe": ["thaw", "frozenburst", "slab"],
    "Softener / filtration": ["softservice", "softinstall", "ironro"],
    "Remodel / rough-in": ["remodel"],
    Commercial: ["commercial"],
    "Something else": ["other"],
    "Fixture install": ["toilet", "sink", "shower", "tub", "disposal", "cartridge"],
  };
  var JOB_SCENES = { burst: "burst", leak: "shutoff", clog: "clog", backup: "mainline", frozen: "thaw", nohot: "nohot", heater: "tankswap", sump: "sumpswap", softener: "softservice", other: "other", toilet: "toilet", sink: "sink", shower: "shower", tub: "tub" };
  function resolve(ctx) {
    ctx = ctx || {};
    if (ctx.scene && SCENES[ctx.scene]) return ctx.scene;
    var byOpt = OPTION_SCENES[ctx.service] && OPTION_SCENES[ctx.service][Number(ctx.optionIndex) || 0];
    if (byOpt && SCENES[byOpt]) return byOpt;
    var byJob = JOB_SCENES[ctx.job];
    if (byJob && SCENES[byJob]) return byJob;
    return "other";
  }
  function play(host, key) {
    host.innerHTML = "";
    var sc = SCENES[key] || SCENES.other;
    var c = new Ctx(host);
    sc.fn(c);
    var still = rm();
    if (still) c.anims.forEach(function (a) { a.finish(); });
    return new Promise(function (res) { setTimeout(res, still ? 0 : c.end + 150); });
  }

  /* ================= SCENES ================= */

  /* burst: pipe split sprays, he slaps a repair clamp on, spray stops */
  define("burst", "Burst pipe repair", function (c) {
    c.add(P.wall(780), c.back);
    c.add(P.pipeH(430, 800, 128) + P.coupling(470, 128) + P.pipeV(780, 40, 128), c.back);
    c.add('<path d="M592,116 l6,9 -5,6 6,9" stroke-width="3"/>', c.back);
    var spray = FX.spray(c, 596, 140, 90, 0, 1200, 7);
    var pud = FX.puddle(c, 600, FLOOR - 2, 70, 300);
    var m = c.mascot({ x: 250, tool: false });
    var clamp = m.carry('<g><rect x="470" y="236" width="70" height="44" rx="8" fill="' + C.cream + '" stroke-width="16"/><path d="M482,236 v-18 M528,236 v-18" stroke-width="14"/></g>');
    walkIn(c, m, 0, 120, 600);
    /* reach up toward the split: arm lifts in one beat, body leans in */
    c.a(m.p("arm"), [{ transform: "none" }, { transform: "rotate(-34deg)" }], { t: 650, d: 380 });
    c.a(m.p("body"), [{ transform: "none" }, { transform: "rotate(4deg)" }], { t: 650, d: 380, o: "50% 100%" });
    /* clamp leaves the hand and seats on the pipe */
    var seat = c.add('<g opacity="0"><rect x="566" y="108" width="62" height="40" rx="6" fill="' + C.cream + '" stroke-width="6"/><path d="M576,108 v-10 M618,108 v-10 M576,148 v10 M618,148 v10" stroke-width="5"/><circle cx="576" cy="96" r="5" fill="' + C.ink + '"/><circle cx="618" cy="96" r="5" fill="' + C.ink + '"/></g>');
    c.a(clamp, [{ opacity: 1 }, { opacity: 0 }], { t: 1030, d: 120 });
    c.a(seat, [{ opacity: 0, transform: "translate(-40px,30px) rotate(-8deg)" }, { opacity: 1, transform: "none" }], { t: 1030, d: 300, e: OUT });
    /* impact: two short strike lines, spray cut */
    var hit = c.add('<path d="M556,90 l-14,-12 M640,90 l14,-12 M597,82 v-16" stroke-width="4" opacity="0"/>');
    c.a(hit, [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { t: 1330, d: 360 });
    c.a(spray, [{ opacity: 1 }, { opacity: 0 }], { t: 1330, d: 160 });
    /* bolts snug: two quarter turns on the arm */
    swing(c, m.p("arm"), 1450, -34, -28, 300, 2);
    FX.drips(c, 597, 152, 160, 1500, 1);
    c.a(m.p("arm"), [{ transform: "rotate(-34deg)" }, { transform: "none" }], { t: 2050, d: 300 });
    c.a(m.p("body"), [{ transform: "rotate(4deg)" }, { transform: "none" }], { t: 2050, d: 300, o: "50% 100%" });
    c.a(pud, [{ opacity: 1 }, { opacity: 0.45 }], { t: 2050, d: 400 });
    finale(c, m, 2300);
  });

  /* clog: water standing in the bowl, three plunges, a big glug, water swirls away */
  define("clog", "Clear a sink, tub, or toilet", function (c) {
    /* side-view toilet: bowl faces the plumber, tank at the back */
    c.add('<rect x="560" y="150" width="70" height="104" rx="8" fill="#fff"/><path d="M560,170 H630"/>' +
      '<path d="M432,254 H600 C600,292 572,306 548,308 L556,' + FLOOR + ' H486 L494,308 C462,304 434,288 432,254 Z" fill="#fff"/>' +
      '<path d="M428,248 H604" stroke-width="7"/>', c.back);
    var water = c.add('<path d="M444,262 H590 C586,284 560,296 520,296 C480,296 450,284 444,262 Z" fill="' + C.wm + '" stroke="none"/>', c.back);
    var lip = c.add('<path d="M446,262 C480,258 500,266 520,262 C540,258 570,266 590,262" stroke="' + C.ws + '" stroke-width="3"/>', c.back);
    var m = c.mascot({ x: 150, tool: false });
    /* plunger in the front hand, angled into the bowl (mascot coords) */
    var pl = m.carry('<g><path d="M505,272 L786,470" stroke-width="16"/><path d="M738,470 C744,430 820,438 828,476 Z" fill="' + C.ink + '" stroke-width="12"/></g>');
    walkIn(c, m, 0, 110, 560);
    for (var i = 0; i < 3; i++) {
      var t = 700 + i * 360;
      c.a(m.p("body"), [{ transform: "none" }, { transform: "translate(6px,12px)" }, { transform: "none" }], { t: t, d: 350, e: "cubic-bezier(.6,0,.4,1)" });
      c.a(lip, [{ transform: "none" }, { transform: "translateY(-5px)" }, { transform: "none" }], { t: t + 60, d: 300 });
    }
    /* glug: plunger comes out, level drops through a swirl */
    c.a(m.p("arm"), [{ transform: "none" }, { transform: "rotate(-16deg)" }], { t: 1800, d: 320 });
    FX.word(c, "GLUG", 690, 120, 1820, 36);
    var sw = c.add('<path d="M520,276 m-40,0 a40,10 0 1,1 80,0 a30,8 0 1,1 -60,0 a20,6 0 1,1 40,0 a9,3 0 1,1 -18,0" stroke="' + C.ws + '" stroke-width="4" opacity="0"/>');
    c.a(sw, [{ opacity: 0, transform: "none" }, { opacity: 1, offset: 0.2 }, { opacity: 0, transform: "rotate(-540deg) scale(.3)" }], { t: 1860, d: 600, e: IN });
    c.a(water, [{ transform: "none" }, { transform: "scaleY(.15)" }], { t: 1880, d: 560, o: "50% 0%", e: IN });
    c.a(water, [{ opacity: 1 }, { opacity: 0.35 }], { t: 1880, d: 560 });
    c.a(lip, [{ opacity: 1 }, { opacity: 0 }], { t: 1880, d: 300 });
    c.a(pl, [{ opacity: 1 }, { opacity: 0 }], { t: 2150, d: 250 });
    c.a(m.p("arm"), [{ transform: "rotate(-16deg)" }, { transform: "none" }], { t: 2150, d: 250 });
    finale(c, m, 2400);
  });

  /* nohot: cold tank (cream + frost ticks) warms to a kelly tint, steam curls from the hot line */
  define("nohot", "T&P valve, anode, or element service", function (c) {
    c.add(P.tank(540, 110, 130, 222), c.back);
    var fill = c.svg.querySelector(".tank-fill");
    var warm = c.add('<rect x="544" y="128" width="122" height="200" fill="' + C.wm + '" stroke="none" opacity="0"/>', c.back);
    var frost = c.add([P.frost(570, 160), P.frost(640, 190, 1.2), P.frost(585, 240, 0.9), P.frost(645, 270), P.frost(600, 300, 0.8)].join(""));
    var shiver = c.add('<path d="M526,150 v40 M518,160 v20 M684,150 v40 M692,160 v20" stroke-width="3"/>');
    c.a(shiver, [{ transform: "translateX(0)" }, { transform: "translateX(-2px)" }, { transform: "translateX(2px)" }, { transform: "none" }], { t: 0, d: 240, i: 3, e: LIN });
    var dial = c.add('<g><circle cx="605" cy="200" r="20" fill="#fff" stroke-width="4"/><path class="needle" d="M605,200 L593,190" stroke-width="4"/></g>');
    var needle = dial.querySelector(".needle");
    needle.style.transformBox = "view-box"; needle.style.transformOrigin = "605px 200px"; needle.setAttribute("d", "M605,200 L591,193");
    var m = c.mascot({ x: 200 });
    m.carry(P.wrenchH());
    walkIn(c, m, 0, 100, 560);
    /* two firm wrench turns on the element */
    swing(c, m.p("arm"), 640, 0, -9, 380, 2);
    dip(c, m, 640, 380, 5); dip(c, m, 1020, 380, 5);
    /* warm-up: frost recedes, tank fills with kelly tint, needle climbs */
    c.a(shiver, [{ opacity: 1 }, { opacity: 0 }], { t: 900, d: 200 });
    [].forEach.call(frost.querySelectorAll("g"), function (f, i) { c.a(f, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.4)" }], { t: 1150 + i * 70, d: 300 }); });
    c.a(warm, [{ opacity: 0, transform: "scaleY(0)" }, { opacity: 1, transform: "none" }], { t: 1200, d: 700, o: "50% 100%", e: LIN });
    c.a(needle, [{ transform: "none" }, { transform: "rotate(130deg)" }], { t: 1200, d: 700, e: SETTLE });
    FX.steam(c, 631, 80, 1650, 3);
    finale(c, m, 2250, 470, 70);
  });

  /* ---------- remaining scenes (shared library) ---------- */
  var INKFILL = 'fill="' + C.ink + '"';
  function arm(c, m, t, deg, d) { return c.a(m.p("arm"), [{ transform: "none" }, { transform: "rotate(" + deg + "deg)" }], { t: t, d: d || 360 }); }
  function armBack(c, m, t, deg, d) { return c.a(m.p("arm"), [{ transform: "rotate(" + deg + "deg)" }, { transform: "none" }], { t: t, d: d || 300 }); }
  function flow(c, d, t, dur, reps, w) { /* dashes travelling along a path = moving water */
    var g = c.add('<path d="' + d + '" stroke="' + C.ws + '" stroke-width="' + (w || 5) + '" stroke-dasharray="10 16" opacity="0"/>');
    c.a(g, [{ opacity: 0 }, { opacity: 1 }], { t: t, d: 200 });
    c.a(g, [{ strokeDashoffset: 0 }, { strokeDashoffset: -52 }], { t: t, d: dur || 420, i: reps || 3, e: LIN });
    return g;
  }
  function soil(c, y) { c.add('<rect x="0" y="' + y + '" width="800" height="' + (360 - y) + '" fill="' + C.wt + '" stroke="none"/>' + '<path d="M60,' + (y + 14) + ' l6,0 M180,' + (y + 22) + ' l8,0 M330,' + (y + 12) + ' l5,0 M610,' + (y + 18) + ' l7,0 M720,' + (y + 10) + ' l5,0" stroke="' + C.inkT + '" stroke-width="3"/>', c.back); }
  function pit(c, x, w, depth) { /* sump pit cross-section below the floor line */
    c.add('<rect x="' + x + '" y="' + FLOOR + '" width="' + w + '" height="' + depth + '" fill="#fff" stroke="none"/><path d="M' + x + "," + FLOOR + " V" + (FLOOR + depth) + " H" + (x + w) + " V" + FLOOR + '"/>', c.back);
  }
  function pump(x, y) { return '<rect x="' + (x - 22) + '" y="' + (y - 34) + '" width="44" height="34" rx="6" fill="#fff"/><path d="M' + (x - 14) + "," + (y - 34) + " V" + (y - 44) + " H" + (x + 14) + " V" + (y - 34) + '"/>'; }

  define("shutoff", "Shut off / isolate a leak", function (c) {
    c.add(P.wall(760), c.back);
    c.add(P.pipeV(700, 40, 230) + P.pipeH(700, 760, 230 - 0) + '<path d="M687,140 H713"/>', c.back);
    var lever = c.add('<g><path d="M700,140 H640" stroke-width="9"/><circle cx="700" cy="140" r="9" ' + INKFILL + '/></g>');
    lever.firstChild.style.transformBox = "view-box"; lever.firstChild.style.transformOrigin = "700px 140px";
    var spray = FX.spray(c, 700, 205, 160, 0, 900, 5);
    var m = c.mascot({ x: 330 });
    walkIn(c, m, 0, 120, 560);
    arm(c, m, 600, -30, 360);
    c.a(lever.firstChild, [{ transform: "none" }, { transform: "rotate(-90deg)" }], { t: 980, d: 420, e: "cubic-bezier(.6,0,.3,1)" });
    c.a(spray, [{ opacity: 1 }, { opacity: 0 }], { t: 1250, d: 300 });
    FX.drips(c, 700, 214, 110, 1350, 2, 380);
    FX.word(c, "OFF", 610, 110, 1400, 26);
    armBack(c, m, 1850, -30);
    finale(c, m, 2150, 90, 70);
  });

  define("freezethaw", "Freeze-thaw + minor repair", function (c) {
    c.add(P.pipeH(420, 800, 150), c.back);
    var ice = c.add('<rect x="540" y="128" width="120" height="44" rx="10" fill="' + C.cream + '" stroke-width="3"/>' + P.frost(565, 150) + P.frost(600, 146, 1.2) + P.frost(636, 152));
    var m = c.mascot({ x: 240 });
    m.carry('<path d="M505,272 L640,262" stroke-width="16"/><rect x="630" y="232" width="110" height="58" rx="12" fill="#fff" stroke-width="14"/><path d="M740,250 h40 M740,272 h40" stroke-width="12"/>');
    walkIn(c, m, 0, 110, 560);
    arm(c, m, 600, -14, 320);
    for (var i = 0; i < 3; i++) { var w = c.add('<path d="M' + (530 - i * 6) + ',190 c10,-10 20,-10 30,0 c10,10 20,10 30,0" stroke="' + C.ws + '" stroke-width="4" opacity="0"/>'); c.a(w, [{ opacity: 0, transform: "none" }, { opacity: 1, offset: 0.3 }, { opacity: 0, transform: "translate(30px,-36px)" }], { t: 820 + i * 220, d: 520, i: 2 }); }
    c.a(ice, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.6,.4)" }], { t: 1250, d: 600 });
    FX.drips(c, 600, 170, 150, 1700, 1);
    var band = c.add('<rect x="580" y="132" width="40" height="36" rx="4" fill="' + C.cream + '" opacity="0"/>');
    c.show(band, 1900, 220);
    armBack(c, m, 1950, -14);
    finale(c, m, 2150, 90, 70);
  });

  define("diagnose", "Not sure — just need a plumber", function (c) {
    c.add(P.pipeH(420, 800, 110, 10) + P.pipeV(610, 110, FLOOR, 10) + P.pipeV(720, 110, 260, 10) + '<circle cx="720" cy="270" r="14" fill="#fff"/>', c.back);
    var beam = c.add('<path d="M440,212 L760,120 L760,300 Z" fill="' + C.wt + '" stroke="none" opacity="0"/>', c.back);
    var m = c.mascot({ x: 150 });
    m.carry('<rect x="505" y="252" width="90" height="40" rx="8" fill="#fff" stroke-width="14"/><path d="M595,256 l26,-12 V302 l-26,-12" stroke-width="12"/>');
    walkIn(c, m, 0, 100, 560);
    c.show(beam, 600, 200);
    c.a(beam, [{ transform: "rotate(-8deg)" }, { transform: "rotate(8deg)" }, { transform: "none" }], { t: 600, d: 1100, o: "0% 50%" });
    c.a(m.p("arm"), [{ transform: "rotate(-4deg)" }, { transform: "rotate(5deg)" }, { transform: "none" }], { t: 600, d: 1100 });
    var qm = FX.word(c, "?", 720, 92, 700, 44);
    c.hide(qm, 1650, 200);
    var ring = c.add('<circle cx="720" cy="270" r="24" stroke="' + C.kelly + '" stroke-width="4"/>'); c.draw(ring, 1650, 380);
    c.hide(beam, 1900, 250);
    finale(c, m, 2150, 90, 70);
  });

  define("mainline", "Main line clear (auger)", function (c) {
    soil(c, FLOOR + 4);
    c.add(P.pipeV(560, 230, 344, 11) + '<rect x="544" y="220" width="32" height="14" rx="3" fill="#fff"/>', c.back);
    c.add('<path d="M556,344 H800 M556,322 H800" stroke-width="4"/>', c.back);
    var clogBlob = c.add('<path d="M700,326 c8,-6 18,6 10,12 c8,4 -4,12 -12,4 c-8,6 -14,-6 -6,-10 c-6,-6 2,-10 8,-6Z" fill="' + C.inkT + '" stroke-width="2"/>');
    var drum = c.add('<g><circle cx="470" cy="290" r="36" fill="#fff"/><circle cx="470" cy="290" r="6" ' + INKFILL + '/><path d="M470,256 V324 M436,290 H504" stroke-width="3"/></g>');
    c.add('<path d="M440,326 H500" stroke-width="6"/>', c.back);
    var cable = c.add('<path d="M500,280 C540,260 560,250 560,270 V333 H760" stroke-width="3" stroke-dasharray="8 6"/>');
    var m = c.mascot({ x: 160 });
    walkIn(c, m, 0, 100, 520);
    arm(c, m, 560, 18, 300);
    c.a(drum.firstChild, [{ transform: "none" }, { transform: "rotate(1080deg)" }], { t: 820, d: 1100, e: LIN, o: "50% 50%" });
    c.a(cable, [{ strokeDashoffset: 0 }, { strokeDashoffset: -140 }], { t: 820, d: 1100, e: LIN });
    c.a(clogBlob, [{ transform: "none", opacity: 1 }, { transform: "translateX(60px) scale(.4)", opacity: 0 }], { t: 1500, d: 450 });
    flow(c, "M560,333 H800", 1700, 400, 2);
    armBack(c, m, 1950, 18);
    finale(c, m, 2150, 90, 70);
  });

  define("hydrojet", "Hydro jet the main line", function (c) {
    soil(c, 200);
    c.add('<rect x="380" y="240" width="420" height="56" fill="#fff" stroke="none"/><path d="M380,240 H800 M380,296 H800"/>', c.back);
    var rings = c.add('<path d="M520,244 v48 M600,244 v48 M680,244 v48" stroke="' + C.inkT + '" stroke-width="10"/>');
    var noz = c.add('<g><path d="M380,268 H420" stroke-width="4"/><path d="M420,260 h18 l8,8 -8,8 h-18z" ' + INKFILL + '/></g>');
    var jets = h(noz, '<path d="M418,262 l-26,-12 M418,274 l-26,12 M418,268 h-30" stroke="' + C.ws + '" stroke-width="3"/>');
    var m = c.mascot({ x: 60 });
    m.carry('<path d="M505,272 C620,300 680,360 760,410" stroke-width="12"/>');
    walkIn(c, m, 0, 80, 520);
    c.a(jets, [{ opacity: 0.4 }, { opacity: 1 }], { t: 560, d: 120, i: 10, dir: "alternate" });
    c.a(noz, [{ transform: "none" }, { transform: "translateX(330px)" }], { t: 600, d: 1300, e: "cubic-bezier(.4,0,.6,1)" });
    [].forEach.call([0, 1, 2], function (i) { c.a(rings, [{ opacity: 1 }, { opacity: 1 - (i + 1) / 3 }], { t: 900 + i * 360, d: 250 }); });
    var shine = c.add('<path d="M400,252 H780" stroke="' + C.ws + '" stroke-width="3" opacity="0"/>'); c.show(shine, 1900, 300);
    finale(c, m, 2150, 742, 62);
  });

  define("cleanout", "Cleanout install", function (c) {
    c.add(P.wall(700), c.back);
    c.add(P.pipeV(620, 60, FLOOR, 14) + '<path d="M620,210 H660 M620,250 H660"/><rect x="606" y="200" width="28" height="60" fill="#fff" stroke="none"/><path d="M606,200 V260 M634,200 V260"/>', c.back);
    var cap = c.add('<g><rect x="654" y="208" width="18" height="44" rx="3" fill="#fff"/><rect x="672" y="220" width="10" height="20" ' + INKFILL + '/></g>');
    cap.setAttribute("opacity", "0");
    var m = c.mascot({ x: 230 });
    walkIn(c, m, 0, 100, 520);
    c.a(cap, [{ opacity: 0, transform: "translateX(40px)" }, { opacity: 1, transform: "none" }], { t: 640, d: 360 });
    var wr = m.carry(P.wrenchH()); wr.setAttribute("opacity", "0"); c.show(wr, 900, 150);
    swing(c, m.p("arm"), 1000, 0, -10, 340, 3);
    FX.word(c, "CO", 700, 190, 1700, 22);
    c.hide(wr, 2000, 150);
    finale(c, m, 2150, 90, 70);
  });

  function heaterSwap(c, extras) {
    var old = c.add(P.tank(560, 120, 120, 212) + '<path d="M590,200 l3,3 M640,260 l3,3 M600,300 l3,3" stroke-width="4"/>');
    var neu = c.add(P.tank(560, 120, 120, 212) + '<path d="M600,170 H640" stroke="' + C.kelly + '" stroke-width="5"/>', c.back);
    neu.setAttribute("opacity", "0");
    var m = c.mascot({ x: 210 });
    walkIn(c, m, 0, 100, 520);
    arm(c, m, 560, 10, 300);
    c.a(old, [{ transform: "none", opacity: 1 }, { transform: "translateX(240px) rotate(8deg)", opacity: 0 }], { t: 820, d: 520, e: IN, o: "50% 100%" });
    c.a(neu, [{ transform: "translateX(220px)", opacity: 0 }, { transform: "none", opacity: 1 }], { t: 1300, d: 520, e: OUT });
    dip(c, m, 1320, 500, 8);
    armBack(c, m, 1850, 10);
    if (extras) extras(c, m);
    finale(c, m, extras ? 2350 : 2150, 90, 70);
  }
  define("tankswap", "Tank replace — standard (like-for-like)", function (c) {
    heaterSwap(c);
    var r1 = c.add('<circle cx="596" cy="96" r="9" stroke="' + C.kelly + '" stroke-width="4"/><circle cx="644" cy="96" r="9" stroke="' + C.kelly + '" stroke-width="4"/>'); c.draw(r1, 1850, 300);
  });
  define("tankcode", "Tank replace — w/ code upgrades", function (c) {
    heaterSwap(c, function (c) {
      var exp = c.add('<path d="M644,92 V70"/><ellipse cx="644" cy="52" rx="20" ry="22" fill="#fff"/>'); c.show(exp, 1850, 250);
      var strap = c.add('<path d="M556,190 H684 M556,270 H684" stroke="' + C.kelly + '" stroke-width="5"/>'); c.draw(strap, 1950, 350);
      var pan = c.add('<path d="M545,316 V330 H695 V316" stroke-width="5"/>'); c.draw(pan, 2050, 300);
    });
  });

  define("flush", "Flush / maintenance", function (c) {
    c.add(P.tank(560, 120, 120, 212), c.back);
    var sed = c.add('<path d="M574,318 h90 M584,308 h70" stroke="' + C.inkT + '" stroke-width="8"/>');
    c.add('<path d="M560,300 H540 V290" stroke-width="5"/>', c.back);
    var hose = c.add('<path d="M540,300 C500,300 500,330 470,330" stroke-width="7"/>');
    var m = c.mascot({ x: 150 });
    walkIn(c, m, 0, 100, 520);
    arm(c, m, 560, 12, 300);
    c.draw(hose, 700, 380);
    var gush = flow(c, "M540,300 C500,300 500,330 470,330", 1050, 380, 3, 4);
    var dots = c.add('<circle cx="520" cy="306" r="3" ' + INKFILL + '/><circle cx="500" cy="318" r="3" ' + INKFILL + '/><circle cx="484" cy="326" r="3" ' + INKFILL + '/>');
    c.a(dots, [{ opacity: 1 }, { opacity: 0 }], { t: 1050, d: 1100 });
    c.a(sed, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scaleX(.2)" }], { t: 1150, d: 800 });
    c.hide(gush, 2200, 200);
    armBack(c, m, 2000, 12);
    finale(c, m, 2200, 742, 62);
  });

  define("tankless", "Tankless install", function (c) {
    c.add(P.wall(760), c.back);
    var unit = c.add('<g><rect x="600" y="80" width="110" height="150" rx="12" fill="#fff"/><rect x="624" y="104" width="62" height="30" rx="4"/><path d="M630,230 V300 M680,230 V300" stroke-width="5"/></g>');
    var digits = c.add('<text x="655" y="126" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="20" fill="' + C.kelly + '" stroke="none" opacity="0">120°</text>');
    var m = c.mascot({ x: 260 });
    walkIn(c, m, 0, 100, 520);
    c.a(unit.firstChild, [{ transform: "translateY(60px)", opacity: 0 }, { transform: "none", opacity: 1 }], { t: 560, d: 460, e: OUT });
    arm(c, m, 600, -26, 420);
    swing(c, m.p("arm"), 1080, -26, -32, 300, 2);
    c.show(digits, 1700, 300);
    FX.steam(c, 680, 300, 1750, 2);
    armBack(c, m, 1750, -26);
    finale(c, m, 2250, 90, 70);
  });

  define("sumpswap", "Primary pump replace", function (c) {
    pit(c, 520, 160, 26);
    c.add(P.pipeV(650, 60, FLOOR - 30, 9) + '<path d="M641,60 H800 M659,78 H800"/>', c.back);
    var oldp = c.add(pump(600, FLOOR + 20) + '<path d="M590,300 l4,4 M606,294 l4,4" stroke-width="3"/>');
    var newp = c.add(pump(600, FLOOR + 20)); newp.setAttribute("opacity", "0");
    var m = c.mascot({ x: 230 });
    walkIn(c, m, 0, 100, 520);
    arm(c, m, 560, 16, 300);
    c.a(oldp, [{ transform: "none", opacity: 1 }, { transform: "translate(-30px,-120px)", opacity: 0 }], { t: 820, d: 500, e: IN });
    c.a(newp, [{ transform: "translateY(-120px)", opacity: 0 }, { transform: "none", opacity: 1 }], { t: 1350, d: 450, e: OUT });
    flow(c, "M650," + (FLOOR - 30) + " V69 H800", 1800, 380, 2);
    armBack(c, m, 1800, 16);
    finale(c, m, 2150, 90, 70);
  });

  define("battery", "Battery backup add-on", function (c) {
    pit(c, 560, 120, 26);
    c.add(pump(620, FLOOR + 20) + P.pipeV(620, 80, FLOOR - 24, 8), c.back);
    var bat = c.add('<g><rect x="470" y="262" width="70" height="70" rx="8" fill="#fff"/><path d="M490,262 v-10 M520,262 v-10" stroke-width="5"/></g>');
    var bars = [0, 1, 2].map(function (i) { var b = c.add('<rect x="480" y="' + (314 - i * 18) + '" width="50" height="12" rx="2" fill="' + C.kelly + '" stroke="none" opacity="0"/>'); c.show(b, 1100 + i * 260, 200); return b; });
    var bulb = c.add('<path d="M720,40 V60"/><circle cx="720" cy="76" r="16" fill="' + C.cream + '"/>');
    var m = c.mascot({ x: 150 });
    walkIn(c, m, 0, 100, 520);
    c.a(bat.firstChild, [{ transform: "translateX(-40px)", opacity: 0 }, { transform: "none", opacity: 1 }], { t: 560, d: 400 });
    c.a(bulb, [{ opacity: 1 }, { opacity: 0.25 }], { t: 1900, d: 160 });
    FX.word(c, "POWER OUT", 720, 128, 1950, 18);
    var pumping = flow(c, "M620," + (FLOOR - 24) + " V80", 2000, 380, 2, 4);
    finale(c, m, 2300, 90, 70);
  });

  define("checkvalve", "Check valve / discharge repair", function (c) {
    c.add(P.pipeV(620, 40, FLOOR, 12), c.back);
    var body = c.add('<rect x="602" y="160" width="36" height="56" rx="6" fill="#fff"/><path d="M596,164 h48 M596,212 h48" stroke-width="7"/>');
    var flap = c.add('<path d="M606,188 L634,188" stroke-width="5"/>');
    flap.firstChild.style.transformBox = "view-box"; flap.firstChild.style.transformOrigin = "606px 188px";
    var m = c.mascot({ x: 270 });
    walkIn(c, m, 0, 100, 520);
    arm(c, m, 560, -20, 340);
    swing(c, m.p("arm"), 920, -20, -26, 280, 2);
    var up = flow(c, "M620,300 V60", 1500, 360, 1, 4);
    c.a(flap.firstChild, [{ transform: "none" }, { transform: "rotate(-70deg)" }, { transform: "none" }], { t: 1450, d: 520 });
    c.hide(up, 1880, 150);
    var stop = c.add('<path d="M660,170 l14,14 m0,-14 l-14,14" stroke="' + C.kelly + '" stroke-width="5"/><path d="M680,120 V160 l-6,-8 m6,8 l6,-8" stroke-width="3"/>'); c.show(stop, 1950, 220);
    armBack(c, m, 1950, -20);
    finale(c, m, 2250, 90, 70);
  });

  define("sumptest", "Seasonal test + service", function (c) {
    pit(c, 560, 140, 26);
    c.add(pump(630, FLOOR + 20) + P.pipeV(680, 70, FLOOR, 8), c.back);
    var water = c.add('<rect x="563" y="' + (FLOOR + 6) + '" width="134" height="18" fill="' + C.wm + '" stroke="none" opacity="0"/>', c.back);
    var m = c.mascot({ x: 250 });
    var bucket = m.carry('<path d="M560,240 L580,330 H660 L680,240 Z" fill="#fff" stroke-width="14"/><path d="M560,240 C580,200 660,200 680,240" stroke-width="10"/>');
    walkIn(c, m, 0, 100, 520);
    arm(c, m, 600, -38, 420);
    var pour = c.add('<path d="M560,190 C580,220 590,260 600,320" stroke="' + C.ws + '" stroke-width="6" opacity="0"/>'); c.show(pour, 980, 150); c.hide(pour, 1500, 150);
    c.show(water, 1000, 400);
    var hum = c.add('<path d="M600,286 h-12 M600,296 h-12 M660,286 h12 M660,296 h12" stroke-width="3" opacity="0"/>');
    c.a(hum, [{ opacity: 0 }, { opacity: 1 }], { t: 1550, d: 100, i: 6, dir: "alternate" });
    c.a(water, [{ transform: "none" }, { transform: "scaleY(.1)" }], { t: 1600, d: 500, o: "50% 100%" });
    flow(c, "M680," + FLOOR + " V70", 1600, 360, 2, 4);
    armBack(c, m, 1700, -38);
    c.hide(bucket, 1900, 200);
    finale(c, m, 2200, 90, 70);
  });

  define("thaw", "Safe electric thaw + minor repair", function (c) {
    c.add(P.pipeH(380, 800, 110, 10) + P.pipeV(740, 110, 220, 10) + '<path d="M730,220 H750 V236 H730Z"/>', c.back);
    var frost = c.add([420, 480, 540, 600, 660, 720].map(function (x, i) { return P.frost(x, 110 + (i % 2 ? -18 : 18), 0.9); }).join(""));
    var box = c.add('<rect x="430" y="270" width="70" height="56" rx="6" fill="#fff"/><path d="M445,290 h40" stroke="' + C.kelly + '" stroke-width="4"/>');
    var leads = c.add('<path d="M480,270 C490,200 430,170 430,124 M470,270 C560,220 700,200 720,124" stroke-width="3"/>');
    var m = c.mascot({ x: 120 });
    walkIn(c, m, 0, 100, 520);
    c.draw(leads, 600, 420);
    var glow = c.add('<path d="M430,110 H730" stroke="' + C.kelly + '" stroke-width="8" stroke-opacity=".5"/>'); c.draw(glow, 1050, 700);
    [].forEach.call(frost.querySelectorAll("g"), function (f, i) { c.a(f, [{ opacity: 1 }, { opacity: 0 }], { t: 1150 + i * 110, d: 250 }); });
    FX.drips(c, 740, 246, 80, 1800, 2, 300);
    finale(c, m, 2250, 742, 62);
  });

  define("frozenburst", "Burst pipe repair (accessible)", function (c) {
    c.add(P.pipeH(420, 560, 140) + P.pipeH(640, 800, 140), c.back);
    var bad = c.add(P.pipeH(560, 640, 140) + '<path d="M596,127 l6,8 -6,6 6,8" stroke-width="3"/>' + P.frost(578, 140, 0.8) + P.frost(622, 140, 0.8));
    var good = c.add(P.pipeH(556, 644, 140) + P.coupling(560, 140) + P.coupling(640, 140)); good.setAttribute("opacity", "0");
    var m = c.mascot({ x: 230 });
    m.carry('<path d="M505,272 L600,250" stroke-width="16"/><path d="M600,250 L760,214" stroke-width="10"/><path d="M610,262 l12,-6 l8,10 l12,-6 l8,10 l12,-6 l8,10 l12,-6 l8,10 l12,-6" stroke-width="6"/>');
    walkIn(c, m, 0, 100, 520);
    arm(c, m, 560, -16, 300);
    c.a(m.p("arm"), [{ transform: "rotate(-16deg) translateX(0)" }, { transform: "rotate(-16deg) translateX(18px)" }, { transform: "rotate(-16deg)" }], { t: 880, d: 240, i: 3, e: "cubic-bezier(.6,0,.4,1)" });
    c.a(bad, [{ transform: "none", opacity: 1 }, { transform: "translateY(160px)", opacity: 0 }], { t: 1600, d: 380, e: IN });
    c.a(good, [{ transform: "translateY(-40px)", opacity: 0 }, { transform: "none", opacity: 1 }], { t: 1820, d: 380, e: OUT });
    armBack(c, m, 1900, -16);
    finale(c, m, 2250, 90, 70);
  });

  define("slab", "Difficult access / slab approach", function (c) {
    c.add('<rect x="0" y="' + FLOOR + '" width="800" height="28" fill="' + C.wt + '" stroke="none"/>', c.back);
    var hole = c.add('<rect x="520" y="' + FLOOR + '" width="120" height="28" fill="#fff" stroke="none"/><path d="M520,' + FLOOR + ' V360 M640,' + FLOOR + ' V360"/>' + P.pipeH(520, 640, FLOOR + 18, 7), c.back);
    hole.setAttribute("opacity", "0");
    var m = c.mascot({ x: 250 });
    var chisel = m.carry('<path d="M505,272 L700,560" stroke-width="16"/><rect x="560" y="300" width="70" height="60" rx="10" transform="rotate(34 595 330)" fill="#fff" stroke-width="12"/>');
    walkIn(c, m, 0, 100, 520);
    for (var i = 0; i < 4; i++) {
      var t = 620 + i * 280;
      c.a(m.p("body"), [{ transform: "none" }, { transform: "translateY(6px)" }, { transform: "none" }], { t: t, d: 260, e: "cubic-bezier(.6,0,.4,1)" });
      var chip = c.add('<path d="M' + (560 + i * 18) + ',' + (FLOOR - 2) + ' l6,-4 4,6 -6,3z" fill="' + C.cream + '" stroke-width="2"/>');
      c.a(chip, [{ transform: "none", opacity: 0 }, { opacity: 1, offset: 0.1 }, { transform: "translate(" + (i % 2 ? 26 : -22) + "px,-34px)", opacity: 0 }], { t: t + 100, d: 420 });
    }
    c.show(hole, 1700, 300);
    c.hide(chisel, 1750, 200);
    var ring = c.add('<circle cx="580" cy="' + (FLOOR + 18) + '" r="20" stroke="' + C.kelly + '" stroke-width="4"/>'); c.draw(ring, 1950, 350);
    finale(c, m, 2250, 90, 70);
  });

  function softTanks(c, x) {
    c.add('<rect x="' + x + '" y="110" width="60" height="222" rx="26" fill="#fff"/><rect x="' + (x + 80) + '" y="190" width="90" height="142" rx="8" fill="#fff"/><path d="M' + (x + 20) + ',110 V90 H' + (x + 40) + ' V110"/>', c.back);
  }
  define("softservice", "Softener service / resin check", function (c) {
    softTanks(c, 560);
    var salt = c.add('<path d="M650,300 H720" stroke="' + C.inkT + '" stroke-width="4"/>');
    var m = c.mascot({ x: 250 });
    var bag = m.carry('<path d="M520,200 h130 l-10,150 h-110z" fill="' + C.cream + '" stroke-width="14"/><path d="M548,260 h70" stroke="' + C.kelly + '" stroke-width="12"/>');
    walkIn(c, m, 0, 100, 520);
    arm(c, m, 560, -30, 380);
    for (var i = 0; i < 8; i++) { var g = c.add('<rect x="' + (668 + (i % 4) * 9) + '" y="196" width="6" height="6" fill="' + C.cream + '" stroke-width="1.5"/>'); g.setAttribute("opacity", "0"); c.a(g, [{ opacity: 0, transform: "none" }, { opacity: 1, offset: 0.1 }, { opacity: 0.9, transform: "translateY(90px)" }], { t: 960 + i * 80, d: 420, e: IN }); }
    c.a(salt, [{ transform: "none" }, { transform: "translateY(-60px)" }], { t: 1100, d: 700, e: LIN });
    armBack(c, m, 1750, -30);
    c.hide(bag, 1900, 200);
    var meter = c.add('<circle cx="590" cy="150" r="14" fill="#fff"/><path d="M590,150 l8,-8" stroke-width="3"/>');
    var tick = c.add('<path d="M590,150 l-10,4" stroke="' + C.kelly + '" stroke-width="4" opacity="0"/>'); c.show(tick, 1900, 250);
    finale(c, m, 2150, 90, 70);
  });

  define("softinstall", "Softener install", function (c) {
    c.add(P.pipeH(380, 800, 70, 8), c.back);
    var tanks = c.add('<rect x="560" y="110" width="60" height="222" rx="26" fill="#fff"/><rect x="640" y="190" width="90" height="142" rx="8" fill="#fff"/><path d="M580,110 V78 M600,110 V78"/>');
    var bypass = c.add('<g><circle cx="590" cy="98" r="10" fill="#fff"/><path d="M582,98 h16" stroke-width="4"/></g>'); bypass.setAttribute("opacity", "0");
    var scale = c.add('<path d="M430,70 l4,4 M470,70 l4,4 M510,70 l4,4" stroke-width="4"/>');
    var m = c.mascot({ x: 230 });
    walkIn(c, m, 0, 100, 520);
    c.a(tanks, [{ transform: "translateX(160px)", opacity: 0 }, { transform: "none", opacity: 1 }], { t: 560, d: 520, e: OUT });
    c.show(bypass, 1150, 200);
    arm(c, m, 1100, -40, 360);
    c.a(bypass.firstChild, [{ transform: "none" }, { transform: "rotate(90deg)" }], { t: 1420, d: 300 });
    flow(c, "M380,70 H560", 1600, 380, 2, 4);
    c.a(scale, [{ opacity: 1 }, { opacity: 0 }], { t: 1700, d: 400 });
    armBack(c, m, 1850, -40);
    finale(c, m, 2200, 742, 62);
  });

  define("ironro", "Iron filter / RO under-sink", function (c) {
    c.add('<path d="M500,150 H760 V' + FLOOR + ' H500Z" fill="#fff"/><path d="M490,150 H770" stroke-width="7"/><path d="M700,150 V112 C700,96 680,96 680,112" stroke-width="5"/>', c.back);
    var cans = c.add([540, 590, 640].map(function (x) { return '<rect x="' + (x - 14) + '" y="210" width="28" height="80" rx="8" fill="#fff"/>'; }).join("") + '<path d="M540,210 V196 H640 V210 M590,196 V210"/>');
    cans.setAttribute("opacity", "0");
    var m = c.mascot({ x: 200 });
    walkIn(c, m, 0, 100, 520);
    arm(c, m, 560, 20, 300);
    c.show(cans, 760, 300);
    var drop = c.add(P.drop(540, 230)); drop.setAttribute("opacity", "0");
    c.a(drop, [{ opacity: 0, transform: "none" }, { opacity: 1, offset: 0.1 }, { transform: "translateX(50px)", offset: 0.4 }, { transform: "translateX(100px)", offset: 0.7 }, { opacity: 0, transform: "translate(140px,-110px)" }], { t: 1100, d: 900, e: LIN });
    var glass = c.add('<path d="M664,60 l6,40 h20 l6,-40" fill="#fff"/>');
    var gl = c.add('<rect x="668" y="78" width="24" height="20" fill="' + C.wm + '" stroke="none"/>');
    c.a(gl, [{ transform: "scaleY(0)" }, { transform: "none" }], { t: 1900, d: 400, o: "50% 100%" });
    armBack(c, m, 1900, 20);
    finale(c, m, 2250, 90, 70);
  });

  define("remodel", "Basement bath, re-pipe, or fixture package", function (c) {
    var sheet = c.add('<rect x="420" y="70" width="340" height="230" fill="' + C.cream + '" stroke-width="3"/><path d="M460,70 V300 M500,70 V300 M540,70 V300 M580,70 V300 M620,70 V300 M660,70 V300 M700,70 V300 M740,70 V300" stroke="' + C.line + '" stroke-width="2"/>', c.back);
    c.a(sheet, [{ transform: "scaleX(0)" }, { transform: "none" }], { t: 520, d: 480, o: "0% 50%" });
    var lines = c.add('<path d="M440,260 H740 M500,260 V160 H560 M640,260 V190 M700,260 V140" stroke="' + C.kelly + '" stroke-width="5"/><rect x="620" y="150" width="40" height="40" rx="6"/><path d="M690,120 h22 v20 h-22z"/>');
    var m = c.mascot({ x: 140 });
    m.carry('<path d="M505,272 L640,250" stroke-width="10"/><path d="M640,250 l10,-4" stroke-width="14"/>');
    walkIn(c, m, 0, 100, 500);
    c.draw(lines, 1050, 520);
    c.a(m.p("arm"), [{ transform: "none" }, { transform: "rotate(-10deg)" }, { transform: "rotate(4deg)" }, { transform: "none" }], { t: 1050, d: 1000 });
    finale(c, m, 2150, 742, 40);
  });

  define("commercial", "Backflow test, service contract, or build-out", function (c) {
    c.add(P.pipeH(420, 800, 230, 12) + '<rect x="540" y="208" width="44" height="44" rx="8" fill="#fff"/><rect x="640" y="208" width="44" height="44" rx="8" fill="#fff"/><path d="M562,208 V186 M662,208 V186 M600,218 V200 M620,218 V200" stroke-width="5"/>', c.back);
    var gauge = c.add('<g><path d="M610,200 C610,160 600,150 600,130" stroke-width="3"/><circle cx="600" cy="110" r="26" fill="#fff"/><path d="M582,118 A22,22 0 0,1 618,118" stroke="' + C.kelly + '" stroke-width="5"/><path class="nd" d="M600,110 L584,118" stroke-width="4"/></g>');
    gauge.setAttribute("opacity", "0");
    var nd = gauge.querySelector(".nd"); nd.style.transformBox = "view-box"; nd.style.transformOrigin = "600px 110px";
    var m = c.mascot({ x: 250 });
    walkIn(c, m, 0, 100, 520);
    arm(c, m, 560, -24, 340);
    c.show(gauge, 820, 250);
    c.a(nd, [{ transform: "none" }, { transform: "rotate(150deg)" }, { transform: "rotate(130deg)" }], { t: 1100, d: 700 });
    var tag = c.add('<path d="M680,252 L700,290"/><rect x="684" y="290" width="48" height="26" rx="4" fill="#fff"/><text x="708" y="309" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="16" fill="' + C.kelly + '" stroke="none">PASS</text>');
    c.a(tag, [{ opacity: 0, transform: "rotate(-14deg)" }, { opacity: 1, transform: "none" }], { t: 1850, d: 380, o: "0% 0%" });
    armBack(c, m, 1850, -24);
    finale(c, m, 2250, 90, 70);
  });

  define("other", "Tell us what's going on", function (c) {
    var box = c.add('<rect x="520" y="270" width="150" height="62" rx="8" fill="#fff"/><path d="M570,270 V256 H620 V270"/>');
    var lid = c.add('<path d="M516,270 H674" stroke-width="7"/>');
    var tools = c.add('<path d="M560,264 V190 M548,190 h24" stroke-width="6"/><path d="M600,264 V170" stroke-width="6"/><path d="M586,176 C586,156 614,156 614,176Z" ' + INKFILL + '/><path d="M640,264 V200" stroke-width="6"/><circle cx="640" cy="192" r="10" fill="#fff"/>');
    tools.setAttribute("opacity", "0");
    var m = c.mascot({ x: 220 });
    walkIn(c, m, 0, 100, 520);
    c.a(lid, [{ transform: "none" }, { transform: "rotate(-40deg)" }], { t: 620, d: 360, o: "0% 50%" });
    c.a(tools, [{ opacity: 0, transform: "translateY(40px)" }, { opacity: 1, transform: "none" }], { t: 900, d: 420, e: OUT });
    var qm = FX.word(c, "?", 600, 120, 1000, 40); c.hide(qm, 1600, 200);
    c.a(m.p("head"), [{ transform: "none" }, { transform: "rotate(-5deg)" }, { transform: "none" }], { t: 1300, d: 600 });
    var hl = c.add('<path d="M586,150 h28" stroke="' + C.kelly + '" stroke-width="5" opacity="0"/>'); c.show(hl, 1700, 200);
    finale(c, m, 2050, 742, 62);
  });

  /* ---------- new fixture installs ---------- */
  function toiletArt(x) { return '<rect x="' + (x + 128) + '" y="150" width="70" height="104" rx="8" fill="#fff"/><path d="M' + (x + 128) + ',170 H' + (x + 198) + '"/><path d="M' + x + ',254 H' + (x + 168) + ' C' + (x + 168) + ',292 ' + (x + 140) + ',306 ' + (x + 116) + ',308 L' + (x + 124) + ',' + FLOOR + ' H' + (x + 54) + ' L' + (x + 62) + ',308 C' + (x + 30) + ',304 ' + (x + 2) + ',288 ' + x + ',254 Z" fill="#fff"/><path d="M' + (x - 4) + ',248 H' + (x + 172) + '" stroke-width="7"/>'; }
  define("toilet", "Toilet install", function (c) {
    c.add('<rect x="480" y="' + (FLOOR - 4) + '" width="60" height="6" fill="' + C.kelly + '" stroke="none"/>', c.back);
    var t = c.add(toiletArt(440));
    var m = c.mascot({ x: 160 });
    walkIn(c, m, 0, 100, 520);
    c.a(t, [{ transform: "translateY(-70px)", opacity: 0 }, { transform: "none", opacity: 1 }], { t: 560, d: 520, e: OUT });
    arm(c, m, 900, 22, 300);
    swing(c, m.p("arm"), 1200, 22, 30, 260, 2);
    armBack(c, m, 1720, 22);
    var sw = c.add('<path d="M524,266 m-36,0 a36,8 0 1,1 72,0 a24,6 0 1,1 -48,0" stroke="' + C.ws + '" stroke-width="4" opacity="0"/>');
    c.a(sw, [{ opacity: 0, transform: "none" }, { opacity: 1, offset: 0.2 }, { opacity: 0, transform: "rotate(-360deg) scale(.4)" }], { t: 1750, d: 560, e: IN });
    finale(c, m, 2200, 742, 62);
  });

  define("sink", "Sink install", function (c) {
    c.add(P.wall(780), c.back);
    c.add('<rect x="500" y="200" width="230" height="132" rx="6" fill="#fff"/><path d="M615,200 V332"/>', c.back);
    var top = c.add('<path d="M490,196 H740" stroke-width="8"/><path d="M560,196 C566,226 664,226 670,196" fill="#fff"/>');
    var faucet = c.add('<path d="M660,196 V150 C660,132 630,132 630,150 V158" stroke-width="7"/>'); faucet.setAttribute("opacity", "0");
    var m = c.mascot({ x: 200 });
    walkIn(c, m, 0, 100, 520);
    c.a(top, [{ transform: "translateY(-50px)", opacity: 0 }, { transform: "none", opacity: 1 }], { t: 560, d: 440, e: OUT });
    c.a(faucet, [{ transform: "translateY(-30px)", opacity: 0 }, { transform: "none", opacity: 1 }], { t: 1000, d: 360, e: OUT });
    c.a(m.p("body"), [{ transform: "none" }, { transform: "translateY(14px)" }, { transform: "translateY(14px)" }, { transform: "none" }], { t: 1100, d: 800 });
    swing(c, m.p("arm"), 1200, 10, 18, 260, 2);
    var stream = c.add('<path d="M630,160 V214" stroke="' + C.ws + '" stroke-width="6" opacity="0"/>');
    c.a(stream, [{ opacity: 0, transform: "scaleY(0)" }, { opacity: 1, transform: "none" }], { t: 1800, d: 260, o: "50% 0%" });
    c.hide(stream, 2150, 200);
    finale(c, m, 2200, 90, 70);
  });

  define("shower", "Shower install", function (c) {
    c.add('<rect x="540" y="40" width="230" height="292" fill="' + C.cream + '" stroke-width="3"/><path d="M540,120 H770 M540,200 H770 M540,280 H770 M610,40 V120 M690,120 V200 M610,200 V280 M690,280 V332" stroke="' + C.line + '" stroke-width="3"/>', c.back);
    c.add('<path d="M700,60 V90 H660" stroke-width="6"/>', c.back);
    var head = c.add('<path d="M640,84 l24,0 l-4,14 h-16 z" fill="#fff" stroke-width="5"/>'); head.setAttribute("opacity", "0");
    var valve = c.add('<g><circle cx="700" cy="190" r="16" fill="#fff"/><path d="M700,190 h-14" stroke-width="5"/></g>');
    var m = c.mascot({ x: 250 });
    walkIn(c, m, 0, 100, 520);
    arm(c, m, 560, -44, 380);
    c.a(head, [{ opacity: 0, transform: "rotate(-60deg)" }, { opacity: 1, transform: "none" }], { t: 900, d: 420 });
    c.a(valve.firstChild, [{ transform: "none" }, { transform: "rotate(-120deg)" }], { t: 1400, d: 380 });
    for (var i = 0; i < 5; i++) { var s = c.add('<path d="M' + (646 + i * 4) + ',104 l' + (-14 + i * 7) + ',70" stroke="' + C.ws + '" stroke-width="3" stroke-dasharray="12 14" opacity="0"/>'); c.show(s, 1650, 200); c.a(s, [{ strokeDashoffset: 0 }, { strokeDashoffset: -52 }], { t: 1650, d: 300, i: 3, e: LIN }); }
    FX.steam(c, 600, 120, 1800, 2);
    armBack(c, m, 1800, -44);
    finale(c, m, 2250, 90, 70);
  });

  define("tub", "Bath / tub install", function (c) {
    c.add(P.wall(780), c.back);
    var tub = c.add('<path d="M480,230 H770 V300 C770,320 750,332 730,332 H520 C500,332 480,320 480,300 Z" fill="#fff"/><path d="M470,230 H780" stroke-width="7"/>');
    var fill = c.add('<rect x="488" y="250" width="274" height="60" fill="' + C.wm + '" stroke="none"/>');
    var spout = c.add('<path d="M780,170 H740 v12" stroke-width="7"/>');
    var m = c.mascot({ x: 160 });
    walkIn(c, m, 0, 100, 520);
    c.a(tub, [{ transform: "translateX(200px)", opacity: 0 }, { transform: "none", opacity: 1 }], { t: 520, d: 520, e: OUT });
    var bead = c.add('<path d="M480,228 H770" stroke="' + C.kelly + '" stroke-width="4"/>');
    m.carry('<path d="M505,272 L640,240" stroke-width="12"/><rect x="560" y="214" width="70" height="34" rx="6" fill="#fff" stroke-width="12" transform="rotate(-12 595 231)"/>');
    arm(c, m, 1000, -10, 300);
    c.draw(bead, 1100, 600, LIN);
    c.a(m.wrap, [{ transform: "none" }, { transform: "translateX(40px)" }, { transform: "none" }], { t: 1100, d: 700 });
    var str = c.add('<path d="M746,184 V250" stroke="' + C.ws + '" stroke-width="6" opacity="0"/>'); c.show(str, 1800, 160); c.hide(str, 2250, 200);
    c.a(fill, [{ transform: "scaleY(0)" }, { transform: "none" }], { t: 1820, d: 500, o: "50% 100%" });
    armBack(c, m, 1750, -10);
    finale(c, m, 2250, 90, 70);
  });


  function camera(c, branch) {
    soil(c, 230);
    c.add(branch ? '<path d="M380,262 H560 C600,262 610,250 640,224 L700,170 L720,190 L656,246 C626,274 612,290 566,290 H380Z" fill="#fff"/>' : '<rect x="380" y="258" width="420" height="36" fill="#fff" stroke="none"/><path d="M380,258 H800 M380,294 H800"/>', c.back);
    var mon = c.add('<g><rect x="430" y="96" width="110" height="80" rx="8" fill="#fff"/><rect x="442" y="108" width="86" height="56" rx="3" fill="' + C.cream + '"/><path d="M485,176 V206 M462,206 H508"/></g>');
    var view = c.add('<circle cx="485" cy="136" r="18" stroke="' + C.ink + '" stroke-width="3"/><circle cx="485" cy="136" r="7" stroke="' + C.inkT + '" stroke-width="3"/>');
    view.setAttribute("opacity", "0");
    var head = c.add('<g><path d="M380,276 H392" stroke-width="3"/><rect x="392" y="268" width="22" height="16" rx="5" ' + INKFILL + '/><path d="M414,272 l14,-6 M414,280 l14,6" stroke="' + C.ws + '" stroke-width="3"/></g>');
    var m = c.mascot({ x: 110 });
    walkIn(c, m, 0, 90, 520);
    arm(c, m, 540, 10, 300);
    c.show(view, 760, 250);
    c.a(view, [{ transform: "scale(.6)" }, { transform: "scale(1.15)" }], { t: 800, d: 1200, e: LIN });
    var path = branch ? [{ transform: "none" }, { transform: "translateX(170px)", offset: 0.55 }, { transform: "translate(250px,-70px) rotate(-40deg)" }] : [{ transform: "none" }, { transform: "translateX(340px)" }];
    c.a(head, path, { t: 760, d: 1300, e: "cubic-bezier(.4,0,.6,1)" });
    var rec = c.add('<circle cx="530" cy="116" r="4" fill="' + C.kelly + '" stroke="none"/>');
    c.a(rec, [{ opacity: 1 }, { opacity: 0.2 }], { t: 760, d: 300, i: 4, dir: "alternate" });
    var found = c.add('<rect x="448" y="146" width="36" height="12" rx="2" fill="' + C.kelly + '" stroke="none" opacity="0"/>'); c.show(found, 2000, 200);
    armBack(c, m, 2000, 10);
    finale(c, m, 2200, 742, 62);
  }
  define("cammain", "Camera inspection (main line)", function (c) { camera(c, false); });
  define("cambranch", "Camera inspection (branch)", function (c) { camera(c, true); });

  define("disposal", "Garbage disposal replace", function (c) {
    c.add('<rect x="500" y="200" width="250" height="132" rx="6" fill="#fff"/><path d="M490,196 H760" stroke-width="8"/><path d="M590,196 C596,222 664,222 670,196" fill="#fff"/><path d="M700,196 V150 C700,132 670,132 670,150 V158" stroke-width="7"/>', c.back);
    var old = c.add('<rect x="604" y="226" width="52" height="64" rx="10" fill="#fff"/><path d="M612,250 l4,4 M640,270 l4,4" stroke-width="3"/>');
    var neu = c.add('<rect x="604" y="226" width="52" height="64" rx="10" fill="#fff"/><path d="M612,246 H648" stroke="' + C.kelly + '" stroke-width="4"/><path d="M656,262 H690 V300" stroke-width="4"/>'); neu.setAttribute("opacity", "0");
    var m = c.mascot({ x: 230 });
    walkIn(c, m, 0, 100, 520);
    c.a(m.p("body"), [{ transform: "none" }, { transform: "translateY(16px)" }], { t: 560, d: 340 });
    arm(c, m, 600, 16, 300);
    c.a(old, [{ transform: "none", opacity: 1 }, { transform: "translate(-60px,50px) rotate(-20deg)", opacity: 0 }], { t: 920, d: 420, e: IN });
    c.a(neu, [{ transform: "translateY(50px)", opacity: 0 }, { transform: "none", opacity: 1 }], { t: 1360, d: 380, e: OUT });
    swing(c, m.p("arm"), 1760, 16, 24, 240, 2);
    var hum = c.add('<path d="M594,240 h-10 M594,256 h-10 M666,240 h10 M666,256 h10" stroke-width="3" opacity="0"/>');
    c.a(hum, [{ opacity: 0 }, { opacity: 1 }], { t: 2050, d: 90, i: 4, dir: "alternate" });
    c.a(m.p("body"), [{ transform: "translateY(16px)" }, { transform: "none" }], { t: 2050, d: 300 });
    armBack(c, m, 2050, 16);
    finale(c, m, 2400, 90, 70);
  });

  define("cartridge", "Shower valve cartridge", function (c) {
    c.add('<rect x="540" y="40" width="230" height="292" fill="' + C.cream + '" stroke-width="3"/><path d="M540,140 H770 M540,240 H770" stroke="' + C.line + '" stroke-width="3"/>', c.back);
    c.add('<circle cx="660" cy="190" r="34" fill="#fff"/>', c.back);
    var handle = c.add('<g><circle cx="660" cy="190" r="16" fill="#fff"/><path d="M660,190 h-26" stroke-width="6"/></g>');
    var oldC = c.add('<rect x="650" y="178" width="20" height="24" rx="3" ' + INKFILL + '/>'); oldC.setAttribute("opacity", "0");
    var newC = c.add('<rect x="650" y="178" width="20" height="24" rx="3" fill="' + C.kelly + '" stroke="none"/>'); newC.setAttribute("opacity", "0");
    var drip = FX.drips(c, 700, 70, 60, 0, 3, 360);
    c.add('<path d="M720,48 V64 H696" stroke-width="5"/>', c.back);
    var m = c.mascot({ x: 250 });
    walkIn(c, m, 0, 100, 520);
    arm(c, m, 560, -30, 360);
    c.a(handle, [{ transform: "none", opacity: 1 }, { transform: "translate(-40px,40px)", opacity: 0 }], { t: 920, d: 360, e: IN });
    c.show(oldC, 900, 150);
    c.a(oldC, [{ transform: "none", opacity: 1 }, { transform: "translateX(-60px)", opacity: 0 }], { t: 1280, d: 320, e: IN });
    c.a(newC, [{ transform: "translateX(-60px)", opacity: 0 }, { transform: "none", opacity: 1 }], { t: 1620, d: 320, e: OUT });
    c.a(handle, [{ transform: "translate(-40px,40px)", opacity: 0 }, { transform: "none", opacity: 1 }], { t: 1960, d: 300, e: OUT });
    armBack(c, m, 2000, -30);
    FX.word(c, "NO DRIP", 655, 100, 2100, 18);
    finale(c, m, 2300, 90, 70);
  });

  window.EEScenes = { define: define, resolve: resolve, play: play, list: function () { return Object.keys(SCENES).map(function (k) { return SCENES[k]; }); },
    OPTION_SCENES: OPTION_SCENES, JOB_SCENES: JOB_SCENES, _lib: { C: C, P: P, FX: FX, h: h, walkIn: walkIn, tipHat: tipHat, dip: dip, swing: swing, finale: finale, FLOOR: FLOOR, SETTLE: SETTLE, IN: IN, OUT: OUT, LIN: LIN } };
})();

(function () {
  "use strict";

  var JOBS = [
    { id: "burst", ticker: "Burst", service: "Emergency repair", optionIndex: 1, emergency: true },
    { id: "leak", ticker: "Leak", service: "Emergency repair", optionIndex: 0, emergency: true },
    { id: "clog", ticker: "Clog", service: "Drain / sewer", optionIndex: 0, emergency: false },
    { id: "backup", ticker: "Backup", service: "Drain / sewer", optionIndex: 1, emergency: true },
    { id: "frozen", ticker: "Frozen", service: "Frozen or burst pipe", optionIndex: 0, emergency: true },
    { id: "nohot", ticker: "No hot water", service: "Water heater", optionIndex: 3, emergency: true },
    { id: "heater", ticker: "Heater", service: "Water heater", optionIndex: 0, emergency: false },
    { id: "sump", ticker: "Sump", service: "Sump pump / flooding", optionIndex: 0, emergency: true },
    { id: "softener", ticker: "Softener", service: "Softener / filtration", optionIndex: 0, emergency: false },
    { id: "other", ticker: "Other", service: "Something else", optionIndex: 0, emergency: false },
  ];

  var TOWNS = [
    "Grand Forks, ND",
    "East Grand Forks, MN",
    "Fargo, ND",
    "West Fargo, ND",
    "Moorhead, MN",
    "Crookston, MN",
    "Grafton, ND",
    "Mayville, ND",
    "Hillsboro, ND",
    "Larimore, ND",
    "Casselton, ND",
    "Thief River Falls, MN",
    "Ada, MN",
    "Warren, MN",
    "Other — still call",
  ];

  var state = {
    job: JOBS[0],
    rail: "now",
    day: null,
    fill: [],
    days: [],
  };

  var pb = window.EEPricebook;
  var sked = window.EESchedule;
  var quoteBox = document.getElementById("quoteBox");
  var jobPills = document.getElementById("jobPills");
  var dayGrid = document.getElementById("dayGrid");
  var nowNote = document.getElementById("nowNote");
  var form = document.getElementById("book");
  var submitBtn = document.getElementById("bookSubmit");
  var tickerTrack = document.getElementById("tickerTrack");
  var tickerWrap = document.getElementById("tickerWrap");
  var tickerPause = document.getElementById("tickerPause");
  var townSelect = document.getElementById("ftown");
  var truckList = document.getElementById("truckList");
  var serviceInput = document.getElementById("fservice");
  var urgencyNow = document.getElementById("urgNow");
  var urgencyWeek = document.getElementById("urgWeek");
  var urgencyPlan = document.getElementById("urgPlan");

  function money(n) {
    return "$" + Number(n).toLocaleString("en-US");
  }

  function urgencyValue() {
    if (state.rail === "now" && state.job.emergency) return "Emergency — now";
    if (state.rail === "now") return "This week";
    return "Planning ahead";
  }

  function priced() {
    if (!pb) return { label: "Call for a number", note: "Pricebook did not load." };
    var u = urgencyValue();
    var est = pb.estimate(state.job.service, state.job.optionIndex, u);
    var label = pb.formatRange(est.range);
    return { label: label, note: (est.notes || []).join(" "), range: est.range, slots: est.slots };
  }

  function renderQuote() {
    var q = priced();
    document.getElementById("fEstimate").value = q.label;
    document.getElementById("fOption").value = String(state.job.optionIndex);
    if (serviceInput) serviceInput.value = state.job.service;
    quoteBox.innerHTML =
      '<p class="quote-kicker">Starting estimate</p>' +
      '<p class="quote-amt">' +
      q.label +
      "</p>" +
      '<p class="quote-note">' +
      q.note +
      "</p>";
    if (submitBtn) {
      submitBtn.textContent = state.rail === "now" ? "Dispatch a plumber" : "Hold this day";
    }
    var u = urgencyValue();
    if (urgencyNow) urgencyNow.checked = u === "Emergency — now";
    if (urgencyWeek) urgencyWeek.checked = u === "This week";
    if (urgencyPlan) urgencyPlan.checked = u === "Planning ahead";
  }

  function pill(job, selected) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "pill" + (selected ? " on" : "");
    b.textContent = job.ticker;
    b.setAttribute("aria-pressed", selected ? "true" : "false");
    b.addEventListener("click", function () {
      pickJob(job);
    });
    return b;
  }

  function renderPills() {
    jobPills.innerHTML = "";
    JOBS.forEach(function (j) {
      jobPills.appendChild(pill(j, j.id === state.job.id));
    });
  }

  function pickJob(job) {
    state.job = job;
    state.rail = job.emergency ? "now" : "day";
    document.getElementById("railNow").classList.toggle("on", state.rail === "now");
    document.getElementById("railDay").classList.toggle("on", state.rail === "day");
    renderPills();
    renderDays();
    renderQuote();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderDays() {
    var dayMode = state.rail === "day";
    dayGrid.hidden = !dayMode;
    nowNote.hidden = dayMode;
    if (!dayMode) {
      document.getElementById("fDay").value = "";
      return;
    }
    if (!sked) {
      dayGrid.innerHTML = "<p>Calendar loads with the shop book.</p>";
      return;
    }
    var need = priced().slots || 2;
    state.days = sked.dayOptions(state.fill, need);
    dayGrid.innerHTML = "";
    state.days.slice(0, 10).forEach(function (d) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "day-chip" + (state.day === d.day ? " on" : "");
      b.disabled = !d.open;
      b.innerHTML =
        "<span>" +
        d.label +
        "</span><small>" +
        (d.open ? "Open" : "Full") +
        "</small>";
      b.addEventListener("click", function () {
        state.day = d.day;
        document.getElementById("fDay").value = d.day;
        renderDays();
      });
      dayGrid.appendChild(b);
    });
    if (!state.day) {
      var first = state.days.filter(function (d) {
        return d.open;
      })[0];
      if (first) {
        state.day = first.day;
        document.getElementById("fDay").value = first.day;
        renderDays();
      }
    }
  }

  function renderTicker() {
    tickerTrack.innerHTML = "";
    var loop = JOBS.concat(JOBS);
    loop.forEach(function (job, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "pill" + (state.job.id === job.id ? " on" : "");
      b.textContent = job.ticker;
      b.addEventListener("click", function () {
        pickJob(job);
      });
      tickerTrack.appendChild(b);
    });
  }

  function loadTowns() {
    if (!townSelect) return;
    townSelect.innerHTML = "";
    TOWNS.forEach(function (t) {
      var o = document.createElement("option");
      o.value = t;
      o.textContent = t;
      townSelect.appendChild(o);
    });
  }

  function truckKey() {
    return "ellingson-bookings-v1";
  }

  function readTruck() {
    try {
      return JSON.parse(localStorage.getItem(truckKey()) || "[]");
    } catch (e) {
      return [];
    }
  }

  function writeTruck(rows) {
    localStorage.setItem(truckKey(), JSON.stringify(rows.slice(0, 24)));
  }

  function renderTruck() {
    if (!truckList) return;
    var rows = readTruck();
    if (!rows.length) {
      truckList.innerHTML =
        '<p class="empty-board">Empty board. Hold a day or dispatch now and this fills in.</p>';
      return;
    }
    truckList.innerHTML = rows
      .map(function (b) {
        return (
          '<li><b>' +
          b.job +
          "</b><span>" +
          (b.rail === "now" ? "Dispatch now" : b.day) +
          " · " +
          b.town +
          '</span><em>' +
          b.estimate +
          "</em></li>"
        );
      })
      .join("");
  }

  function liveHost() {
    var host = location.hostname;
    return (
      document.body.getAttribute("data-live") === "true" ||
      /netlify\.app$/.test(host) ||
      host.indexOf("ellingson") !== -1
    );
  }

  function encodeForm(formEl) {
    var data = new FormData(formEl);
    var parts = [];
    data.forEach(function (value, key) {
      parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(value)));
    });
    return parts.join("&");
  }

  async function holdSlot() {
    var body = {
      service: state.job.service,
      optionIndex: state.job.optionIndex,
      urgency: urgencyValue(),
      day: state.rail === "day" ? state.day : null,
      asap: state.rail === "now",
    };
    try {
      var res = await fetch("/.netlify/functions/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async function loadAvailability() {
    try {
      var res = await fetch("/.netlify/functions/availability", { cache: "no-store" });
      if (!res.ok) return;
      var data = await res.json();
      state.fill = data.fill || [];
      renderDays();
    } catch (e) {
      /* empty fill = every day open */
    }
  }

  document.getElementById("railNow").addEventListener("click", function () {
    state.rail = "now";
    this.classList.add("on");
    document.getElementById("railDay").classList.remove("on");
    renderDays();
    renderQuote();
  });
  document.getElementById("railDay").addEventListener("click", function () {
    state.rail = "day";
    this.classList.add("on");
    document.getElementById("railNow").classList.remove("on");
    renderDays();
    renderQuote();
  });

  tickerPause.addEventListener("click", function () {
    var paused = tickerWrap.getAttribute("data-paused") === "true";
    tickerWrap.setAttribute("data-paused", paused ? "false" : "true");
    this.textContent = paused ? "Pause" : "Play";
    this.setAttribute("aria-pressed", paused ? "false" : "true");
  });

  form.addEventListener("submit", async function (ev) {
    ev.preventDefault();
    var name = document.getElementById("fname").value.trim();
    var phone = document.getElementById("fphone").value.replace(/\D/g, "");
    if (!name || phone.length < 10) {
      quoteBox.querySelector(".quote-note").textContent =
        "Name and a real phone number — we’ll call you back.";
      return;
    }
    renderQuote();
    submitBtn.disabled = true;
    submitBtn.textContent = "Holding the window…";
    var held = await holdSlot();
    if (held && held.confirmedDay) {
      state.day = held.confirmedDay;
      document.getElementById("fDay").value = held.confirmedDay;
    }
    if (held && held.range && pb) {
      document.getElementById("fEstimate").value = pb.formatRange(held.range);
    }
    writeTruck(
      [
        {
          job: state.job.ticker,
          rail: state.rail,
          day: state.day || "",
          town: townSelect.value,
          estimate: document.getElementById("fEstimate").value,
        },
      ].concat(readTruck())
    );
    renderTruck();

    if (liveHost()) {
      try {
        await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: encodeForm(form),
        });
        location.href = "/thanks.html";
        return;
      } catch (e) {
        form.submit();
        return;
      }
    }

    document.getElementById("formMsg").style.display = "block";
    submitBtn.disabled = false;
    submitBtn.textContent = "Request received";
  });

  loadTowns();
  renderPills();
  renderTicker();
  renderQuote();
  renderDays();
  renderTruck();
  loadAvailability();
})();

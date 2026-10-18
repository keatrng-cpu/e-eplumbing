/**
 * Home Team Plan checkout buttons.
 *
 * Falls back to the phone number whenever Stripe is not configured yet — a
 * dead button on a price is worse than no button, and the shop can still sell
 * the plan over the phone while the price IDs are being created.
 */
(function () {
  "use strict";
  var msg = document.getElementById("planMsg");
  var PHONE = '<a href="tel:+12187792553">(218) 779-2553</a>';
  if (!msg) return;

  function fallback(why) {
    msg.innerHTML = "Online signup isn't live yet — call " + PHONE + " and we'll set the plan up on the phone.";
    console.warn("[plan]", why);
  }

  document.querySelectorAll("[data-plan]").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      var plan = btn.getAttribute("data-plan");
      btn.disabled = true;
      msg.textContent = "Opening secure checkout…";
      (window.EETrack || function () {})("plan_checkout_started", { plan: plan });
      try {
        var res = await fetch("/.netlify/functions/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: plan }),
        });
        var data = await res.json();
        if (data && data.ok && data.url) { location.href = data.url; return; }
        fallback(data && data.error);
      } catch (e) {
        fallback(e);
      }
      btn.disabled = false;
    });
  });
})();

/**
 * Booking-funnel analytics.
 *
 * Why this exists: before this file there was no instrumentation at all, so
 * "nobody is visiting" and "the form is broken" looked identical from the
 * outside — and the Netlify form had sat at zero submissions for three months
 * with no way to tell which it was.
 *
 * Privacy: autocapture and session recording are OFF on purpose. This form
 * collects a customer's name, phone number and home address; autocapture would
 * record clicks and DOM text around those fields and recording would capture
 * the fields themselves. Every event below is fired by hand and carries only
 * non-identifying shape data — which service, which price band, which step.
 * Never add a field here that could identify a household.
 *
 * window.EETrack(event, props) is a no-op if PostHog fails to load, so the
 * booking card never depends on it.
 */
(function () {
  "use strict";

  var KEY = "phc_nLu24WszcQhQY44YUBX8ks7eQpHpkczJPwRZkeVb4ktD";
  var HOST = "https://us.i.posthog.com";

  // Respect Do Not Track and localhost — no point polluting the funnel with
  // our own testing.
  var optOut =
    navigator.doNotTrack === "1" ||
    /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  window.EETrack = function () {};
  if (optOut) return;

  /* eslint-disable */
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  /* eslint-enable */

  posthog.init(KEY, {
    api_host: HOST,
    person_profiles: "identified_only",
    autocapture: false,            // see the privacy note above
    disable_session_recording: true,
    capture_pageview: true,
    capture_pageleave: true,
    mask_all_text: true,
    mask_all_element_attributes: true,
    persistence: "localStorage+cookie",
  });

  window.EETrack = function (event, props) {
    try {
      posthog.capture(event, props || {});
    } catch (e) {
      /* analytics must never break the booking card */
    }
  };

  // Calls to the phone number are the other half of the funnel — for a plumber
  // they may well be the larger half, and they are invisible without this.
  document.addEventListener(
    "click",
    function (ev) {
      var a = ev.target.closest && ev.target.closest('a[href^="tel:"], a[href^="sms:"]');
      if (!a) return;
      window.EETrack("contact_tapped", {
        channel: a.getAttribute("href").indexOf("sms:") === 0 ? "sms" : "call",
        placement: a.className || a.closest("[id]")?.id || "body",
      });
    },
    true
  );
})();

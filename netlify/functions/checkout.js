// POST /.netlify/functions/checkout  { plan: "monthly" | "yearly" }
//
// Home Team Plan checkout. The plan ($29/mo · $279/yr) has been advertised on
// the live page with no way to buy it — the CTA was an anchor to #contact.
// This is the only offer the shop has that can be sold without a truck
// leaving, so it is the only recurring line the business can start today.
//
// No Stripe SDK: one POST to the REST API keeps package.json to the single
// dependency the function bundler already needs.
//
// Site settings → Environment variables:
//   STRIPE_SECRET_KEY           sk_live_… or sk_test_…
//   STRIPE_PRICE_HTP_MONTHLY    price_… for $29/mo   (create in the Stripe dashboard)
//   STRIPE_PRICE_HTP_YEARLY     price_… for $279/yr
//
// Prices live in Stripe, not here: a number hardcoded in two places drifts,
// and the pricebook rule in this repo is one source of truth per number.

const PLANS = {
  monthly: { env: "STRIPE_PRICE_HTP_MONTHLY", label: "Home Team Plan — monthly" },
  yearly: { env: "STRIPE_PRICE_HTP_YEARLY", label: "Home Team Plan — annual" },
};

function json(statusCode, body) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { ok: false, error: "Method not allowed" });

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, error: "Bad request" });
  }

  const plan = PLANS[data.plan];
  if (!plan) return json(400, { ok: false, error: "Unknown plan" });

  const secret = process.env.STRIPE_SECRET_KEY;
  const price = process.env[plan.env];
  if (!secret || !price) {
    // Fail loudly but politely: the page falls back to "call us" rather than
    // showing a broken button.
    console.error(`[checkout] missing env: ${!secret ? "STRIPE_SECRET_KEY " : ""}${!price ? plan.env : ""}`);
    return json(503, { ok: false, error: "not_configured" });
  }

  const origin =
    event.headers.origin ||
    (event.headers.host ? `https://${event.headers.host}` : "https://plumbingmidwest.netlify.app");

  const form = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    success_url: `${origin}/thanks.html?plan=${encodeURIComponent(data.plan)}`,
    cancel_url: `${origin}/#plan`,
    client_reference_id: `htp-${Date.now().toString(36)}`,
    "metadata[offer]": plan.label,
    // The plan is per-address: collecting it here means the first inspection
    // can be scheduled without another phone call.
    billing_address_collection: "required",
    "phone_number_collection[enabled]": "true",
    allow_promotion_codes: "true",
  });

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
    const body = await res.json();
    if (!res.ok) {
      console.error("[checkout] stripe error", body?.error?.message);
      return json(502, { ok: false, error: "stripe_error" });
    }
    return json(200, { ok: true, url: body.url });
  } catch (err) {
    console.error("[checkout] failed", err);
    return json(502, { ok: false, error: "stripe_unreachable" });
  }
};

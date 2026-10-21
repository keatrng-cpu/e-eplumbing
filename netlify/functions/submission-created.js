/**
 * Netlify Form trigger: runs after a successful `service-request` submit.
 *
 * Builds the dispatch ticket — everything the plumber needs to load the truck
 * and drive, in the order the phone script in OPERATIONS.md §1 asks for it —
 * and pushes it somewhere that actually buzzes a phone at 2am.
 *
 * Site settings → Environment variables:
 *   NOTIFY_WEBHOOK    Slack / Zapier / Make incoming webhook URL
 *   TWILIO_SID        Twilio account SID          ┐ all three required
 *   TWILIO_TOKEN      Twilio auth token           │ for the SMS leg
 *   TWILIO_FROM       Twilio number, E.164        ┘
 *   DISPATCH_SMS      comma-separated E.164 numbers to text (on-call plumbers)
 *   NOTIFY_EMAIL      informational only (Netlify UI sends the actual email)
 */

const FIELDS = [
  ['Ref', 'ref'],
  ['Urgency', 'urgency'],
  ['Service', 'service'],
  ['Scope', 'scope'],
  ['Estimate', 'estimate'],
  ['Day', 'day'],
  ['Window', 'window'],
  ['Name', 'name'],
  ['Phone', 'phone'],
  ['Email', 'email'],
  ['Contact pref', 'contactPref'],
  ['OK to text', 'smsConsent'],
  ['Address', 'street'],
  ['Town', 'town'],
  ['ZIP', 'zip'],
  ['Map', 'mapLink'],
  ['Property', 'property'],
  ['Role', 'role'],
  ['Who is home', 'whoHome'],
  ['Main shut-off', 'shutoffKnown'],
  ['Access', 'access'],
  ['Job details', 'details'],
  ['Message', 'message'],
];

/** Netlify sends uploaded files as { url, filename, ... } (or a bare URL string). */
function photoUrls(data) {
  return ['photo1', 'photo2', 'photo3', 'photo']
    .map((k) => data[k])
    .filter(Boolean)
    .map((v) => (typeof v === 'string' ? v : v && typeof v === 'object' ? v.url || '' : ''))
    .filter((u) => /^https?:/.test(u));
}

function ticket(data) {
  const lines = ['North Fork Plumbing Co. — new service request'];
  for (const [label, key] of FIELDS) {
    const v = data[key];
    if (v && typeof v !== 'object') lines.push(`${label}: ${String(v).replace(/\n/g, ' / ')}`);
  }
  const photos = photoUrls(data);
  if (photos.length) lines.push(`Photos (${photos.length}): ${photos.join(' ')}`);
  lines.push('Call back: (218) 309-8215');
  return lines.join('\n');
}

/** The 160-character version that fits one SMS and still dispatches a truck. */
function sms(data) {
  const urgent = data.urgency === 'Emergency — now' ? '🚨 EMERGENCY' : 'New job';
  return [
    `${urgent} ${data.ref || ''}`,
    `${data.scope || data.service || 'Service call'} — ${data.estimate || 'quote on call'}`,
    `${data.name || '?'} ${data.phone || ''}`,
    `${data.street || ''}, ${data.town || ''}`,
    photoUrls(data).length ? `📷 ${photoUrls(data).length} photo(s) in Netlify Forms` : '',
    data.urgency === 'Emergency — now' ? 'Dispatch now' : `${data.day || 'first opening'} ${data.window || ''}`,
  ].filter(Boolean).join('\n');
}

async function sendSms(body) {
  const { TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM, DISPATCH_SMS } = process.env;
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM || !DISPATCH_SMS) return 'sms: not configured';
  const to = DISPATCH_SMS.split(',').map((n) => n.trim()).filter(Boolean);
  const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64');
  const results = await Promise.allSettled(
    to.map((number) =>
      fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: number, From: TWILIO_FROM, Body: body }),
      })
    )
  );
  const failed = results.filter((r) => r.status === 'rejected' || !r.value.ok).length;
  return `sms: ${to.length - failed}/${to.length} sent`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let payload = {};
  try {
    const parsed = JSON.parse(event.body || '{}');
    payload = parsed.payload || parsed;
  } catch (err) {
    return { statusCode: 400, body: 'Bad payload' };
  }

  const data = payload.data || payload;
  const summary = ticket(data);
  const notes = [];

  const webhook = process.env.NOTIFY_WEBHOOK;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summary, data }),
      });
      notes.push('webhook: ok');
    } catch (err) {
      console.error('NOTIFY_WEBHOOK failed', err);
      notes.push('webhook: failed');
    }
  } else {
    notes.push('webhook: not configured');
  }

  try {
    notes.push(await sendSms(sms(data)));
  } catch (err) {
    console.error('SMS failed', err);
    notes.push('sms: failed');
  }

  // Always log the full ticket — it is the last-resort record if every
  // notification channel is unconfigured or down.
  console.log(summary, '\n--', notes.join(' | '));

  return { statusCode: 200, body: 'ok' };
};

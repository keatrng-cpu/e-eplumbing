/**
 * Netlify Form trigger: runs after a successful `service-request` submit.
 * Site settings → Environment variables:
 *   NOTIFY_WEBHOOK  optional Slack/Zapier/Make incoming webhook URL
 *   NOTIFY_EMAIL    informational only (Netlify UI sends the actual email)
 */
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || '{}').payload || JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: 'Bad payload' };
  }

  const data = payload.data || payload;
  const webhook = process.env.NOTIFY_WEBHOOK;
  const summary = [
    'Ellingson Plumbing — new service request',
    `Name: ${data.name || '—'}`,
    `Phone: ${data.phone || '—'}`,
    `Town: ${data.town || '—'}`,
    `Service: ${data.service || '—'}`,
    `Urgency: ${data.urgency || '—'}`,
    `Message: ${data.message || '—'}`,
    'Call back: (218) 779-2553',
  ].join('\n');

  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summary, data }),
      });
    } catch (err) {
      console.error('NOTIFY_WEBHOOK failed', err);
    }
  } else {
    console.log(summary);
  }

  return { statusCode: 200, body: 'ok' };
};

# Ellingson Plumbing — launch runbook

Do these in order. The site is already production-wired (`data-live="true"`, canonical `https://ellingsonplumbing.com`, form posts to Netlify Forms → `/thanks.html`).

---

## 1. Netlify + domain (20 minutes)

1. [app.netlify.com](https://app.netlify.com) → **Add new site** → Import from Git → `keatrng-cpu/e-eplumbing` → branch `site-parity` (or `main` after merge).
2. Build: none. Publish directory: `.`
3. Site settings → Domain management:
   - Add `ellingsonplumbing.com` and `www.ellingsonplumbing.com`
   - Buy the domain in Netlify **or** point existing DNS:
     - `A` `@` → Netlify load balancer shown in the UI
     - `CNAME` `www` → `ellingsonplumbing.netlify.app`
4. HTTPS: wait for Let’s Encrypt (automatic).
5. Environment variables:
   - `NOTIFY_WEBHOOK` = Zapier / Make / Slack incoming webhook (optional, powers SMS)
6. Confirm `https://ellingsonplumbing.com` loads lockup + form.

Until DNS is live, the Netlify default `*.netlify.app` URL still accepts the form because `data-live="true"`.

---

## 2. Form email + SMS (10 minutes)

**Email (required)**  
Site settings → Forms → Form notifications → **Add notification**

| Field | Value |
|---|---|
| Form | `service-request` |
| Event | New submission |
| Email to | `nateplumb97@icloud.com` |
| Subject | `Ellingson job — {{urgency}} — {{town}}` |

Add a second email if a dispatcher should get a copy.

**SMS (recommended)**  
1. Zapier or Make: trigger **Netlify → New form submission** (form `service-request`).
2. Action **SMS** (Twilio or Zapier SMS) to `(218) 779-2553`:
   ```
   Ellingson: {{urgency}} / {{service}} / {{town}} / {{phone}} / {{name}}
   ```
3. Paste that Zap webhook into Netlify env `NOTIFY_WEBHOOK` if you also want the `submission-created` function to fire Slack.

Office target: callback **< 15 min**. After-hours “Right now” rows: **< 30 min**.

---

## 3. Google Business Profile

Paste `GBP-CONTENT.md` into the profile. Verify by postcard or video. Do not publish reviews that did not happen.

Primary category: **Plumber**  
Phone: **(218) 779-2553**  
Website: **https://ellingsonplumbing.com**

---

## 4. Minnesota contractor number

There is no public MN DLI `#PC-…` on file for this shop yet. Do not invent one.

1. Apply: [dli.mn.gov plumbing contractor licensing](https://www.dli.mn.gov/business/plumbing-contractors/licensing-plumbing-contractor-licenses)
2. Lookup: [dli.mn.gov/license-and-registration-lookup](https://www.dli.mn.gov/license-and-registration-lookup)
3. When DLI issues the number, replace the footer sentence in `index.html` with:
   `Minnesota DLI Plumbing Contractor Lic. #PC-______ · $25,000 MN Code Compliance Bond`

North Dakota Master / shop license: same rule — post the real board number in the footer when you have it.

---

## 5. Reviews

Site no longer carries sample quotes. After job one:

1. Send the SMS in `TEMPLATES.md`
2. Paste the public Google review text into the three `#reviews` cards
3. Link the section eyebrow to the live GBP URL

---

## 6. Home Team price (locked)

Published on the site from `PRICEBOOK.md`:

- **$29 / month**
- **$279 / year** (save $69 vs month-to-month)
- Includes: annual inspection, water-heater flush, pre-melt sump test, priority scheduling, 10% off repairs

Change the number in `index.html` (plan band) and this file together if COGS moves.

---

## 7. Canonical / OG / sitemap

Already pointed at `https://ellingsonplumbing.com`:

- `<link rel="canonical">`
- `og:url` / `og:image` → `/lockup.svg`
- `robots.txt` sitemap line
- `sitemap.xml`

After the domain is live, request indexing in Google Search Console for that URL.

# Ellingson Plumbing — launch runbook

The production site on Netlify is wired: `data-live="true"`, form `service-request` → `/thanks.html`, canonical `https://ellingsonplumbing.com`.

## 1. Netlify (this repo)

Site: **ellingson-plumbing** (`https://ellingson-plumbing.netlify.app`)  
Repo: `keatrng-cpu/e-eplumbing` · branch **`main`**  
Build: none. Publish directory: `.`  
Forms: **enabled**.

After a push to `main`, wait for deploy ready, then confirm:

- Title is **Ellingson Plumbing**, not E&E
- Dispatch line ticks
- Tapping Burst shows a dollar range (not “—”)
- Pick a day shows weekday chips
- Form lands on `/thanks.html`

## 2. Custom domain

Site settings → Domain management:

- Add `ellingsonplumbing.com` and `www.ellingsonplumbing.com`
- `A` `@` → Netlify load balancer in the UI
- `CNAME` `www` → `ellingson-plumbing.netlify.app`

Until DNS is live, `*.netlify.app` still accepts the form.

Env vars:

- `NOTIFY_WEBHOOK` = Zapier / Make / Slack incoming webhook (optional SMS)

## 3. Form email + SMS

Site settings → Forms → Form notifications → **Add notification**

| Field | Value |
|---|---|
| Form | `service-request` |
| Event | New submission |
| Email to | `nateplumb97@icloud.com` |
| Subject | `Ellingson job — {{urgency}} — {{town}}` |

SMS: Zapier/Make trigger **Netlify → New form submission** → SMS to `(218) 779-2553`:

```
Ellingson: {{urgency}} / {{service}} / {{town}} / {{phone}} / {{name}}
```

## 4. Google Business Profile

Paste `GBP-CONTENT.md`. Primary category **Plumber**. Phone **(218) 779-2553**. Website **https://ellingsonplumbing.com**. Do not publish reviews that did not happen.

## 5. Minnesota contractor number

No public MN DLI `#PC-…` on file. Do not invent one. When DLI issues it, replace the footer sentence in `index.html`.

## 6. Home Team price (locked)

- **$29 / month**
- **$279 / year**

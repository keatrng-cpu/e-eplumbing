# North Fork Plumbing Co. — launch runbook

The production site on Netlify is wired: `data-live="true"`, form `service-request` → `/thanks.html`, canonical `https://plumbingmidwest.netlify.app/` until a North Fork domain is connected.

## 1. Netlify (this repo)

Site: **plumbingmidwest** (`https://plumbingmidwest.netlify.app`)
Repo: `keatrng-cpu/e-eplumbing` · branch **`main`**  
Build: none. Publish directory: `.`  
Forms: **enabled**.

After a push to `main`, wait for deploy ready, then confirm:

- Title is **North Fork Plumbing Co.**
- Dispatch line ticks
- Tapping Burst shows a dollar range (not “—”)
- Pick a day shows weekday chips
- Form lands on `/thanks.html`

## 2. Custom domain

Site settings → Domain management:

- Add the verified North Fork domain and its `www` host
- `A` `@` → Netlify load balancer in the UI
- `CNAME` `www` → `plumbingmidwest.netlify.app`

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
| Subject | `North Fork job — {{urgency}} — {{town}}` |

SMS: Zapier/Make trigger **Netlify → New form submission** → SMS to `(218) 309-8215`:

```
North Fork: {{urgency}} / {{service}} / {{town}} / {{phone}} / {{name}}
```

## 4. Google Business Profile

Update `GBP-CONTENT.md` before using it. Primary category **Plumber**. Phone **(218) 309-8215**. Use the verified North Fork domain when it is connected. Do not publish reviews that did not happen.

## 5. Minnesota contractor number

No public MN DLI `#PC-…` on file. Do not invent one. When DLI issues it, replace the footer sentence in `index.html`.

## 6. Home Team price (locked)

- **$29 / month**
- **$279 / year**

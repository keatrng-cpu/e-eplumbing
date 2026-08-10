# Jobber Setup Checklist (E&E)

Recommended first field-service system. Housecall Pro is a fine alternative if you prefer its marketing tools.

---

## Day 1 setup

1. Create account at getjobber.com (trial).
2. **Company profile:** Estad & Ellingson Plumbing, phone (218) 779-2553, email nateplumb97@icloud.com, service area cities from the website.
3. **Users:** Owner + any helper. Enable mobile app.
4. **Services / products:** Import categories from `PRICEBOOK.md` (DIAG, EMG, DRN, WH, SMP, FIX, SFT, RMI, COM).
5. **Tax:** Configure ND / MN sales tax rules with your accountant.
6. **Payments:** Enable Jobber Payments or connect Square.
7. **QuickBooks Online:** Connect when books are ready.
8. **Requests:** Turn on online booking request form OR keep using Netlify form → manual job creation for week 1.
9. **Automated messages:**
   - Appointment confirmation
   - On-my-way text
   - Invoice sent
   - Review request (Google link)
10. **Custom fields:** Referred by, Membership (Y/N), License jurisdiction (ND/MN).

---

## Lead flow (recommended)

```
Phone or Netlify form
    → Create Client + Request/Job in Jobber within 15 min
    → Schedule with arrival window
    → Tech mobile app
    → Quote → Approve → Work → Invoice → Pay → Review request
```

For true emergencies: create the job on the drive; don’t wait for perfect data entry.

---

## Netlify form → Jobber

Options:
- Manual: email notification → create job (fine for first 20 leads/week).
- Zapier/Make: Netlify Forms webhook → Jobber “Create request” (when volume justifies ~$20–30/mo).

---

## Weekly owner review in Jobber

- Unscheduled requests
- Overdue invoices
- Jobs missing photos/notes
- New reviews collected
- Membership tags added

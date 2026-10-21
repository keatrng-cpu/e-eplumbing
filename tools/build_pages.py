#!/usr/bin/env python3
"""Builds the static pages (index, services, book, reviews, plans, about) from
shared partials so header, footer, tab bar and head stay identical everywhere.
Run from the repo root:  python3 tools/build_pages.py
Services prices come from pricebook.js (via tools/svcdata.js) -- never typed here."""
import json, subprocess, html, os
from urllib.parse import quote
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda f: open(os.path.join(R, "tools/pages", f)).read()
HOST = "https://plumbingmidwest.netlify.app"
TEL = '<a href="tel:+12183098215">(218) 309-8215</a>'
D = json.loads(subprocess.check_output(["node", os.path.join(R, "tools/svcdata.js")]))
e = html.escape

ICONS = {
 "home": '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
 "services": '<path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.6 2.6-2.4-.6-.6-2.4z"/>',
 "book": '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/><path d="m9 15 2 2 4-4"/>',
 "plans": '<path d="M12 3.5 19 6v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
 "star": '<path d="m12 3.8 2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8z"/>',
 "more": '<circle cx="5.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18.5" cy="12" r="1.6"/>',
 "phone": '<path d="M6.6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.1 6.1l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z"/>',
}
def icon(k): return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + ICONS[k] + '</svg>'

NAV = [("/", "Home", "home"), ("/services.html", "Services &amp; Book", "services"),
       ("/plans.html", "Plans", "plans"), ("/reviews.html", "Reviews", None), ("/about.html", "About &amp; Contact", None)]

def head(title, desc, path, extra=""):
    url = HOST + path
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:image" content="{HOST}/og.svg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="{url}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{HOST}/og.svg">
<meta name="theme-color" content="#009A44">
<link rel="canonical" href="{url}">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="badge.svg">
<link rel="manifest" href="site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="ee-chat.css">
<link rel="stylesheet" href="site.css">
<link rel="stylesheet" href="motion.css">
{extra}<script>document.documentElement.classList.add('js')</script>
</head>
'''

def chrome_top(active):
    links = "".join(f'<a href="{h}"' + (' aria-current="page"' if h == active else "") + f'>{t}</a>' for h, t, _ in NAV)
    return f'''<body data-live="true" data-page="{active}">
<a class="skip" href="#main">Skip to content</a>
<div class="topbar"><div class="wrap">
  <div><span class="pulse" aria-hidden="true"></span><b>24/7 Emergency Service:</b> {TEL}</div>
  <div class="lic">Serving North Dakota + Minnesota</div>
</div></div>
<header class="site" id="siteHeader"><div class="wrap nav">
  <a class="brand" href="/"><img src="badge.svg" alt=""><span class="name">North Fork <span>Plumbing Co.</span></span></a>
  <nav class="links" id="navLinks" aria-label="Primary">{links}</nav>
  <a class="btn btn-green nav-book" href="/services.html">Book</a>
  <a class="hdr-call" href="tel:+12183098215" aria-label="Call (218) 309-8215">{icon("phone")}<span>Call</span></a>
</div></header>
'''

def chrome_bottom(active, scripts):
    tabs = ""
    for h, t, k in [("/", "Home", "home"), ("/services.html", "Book", "book"), ("/plans.html", "Plans", "plans"), ("/reviews.html", "Reviews", "star")]:
        cur = ' aria-current="page"' if h == active else ""
        tabs += f'<a class="tab" href="{h}"{cur}>{icon(k)}<span>{t}</span></a>'
    more_on = active in ("/about.html",)
    tabs += (f'<details class="tab-more"><summary class="tab"' + (' aria-current="page"' if more_on else "") +
             f'>{icon("more")}<span>More</span></summary><div class="tab-sheet" role="menu">'
             '<a role="menuitem" href="/services.html">All services</a><a role="menuitem" href="/about.html">About &amp; Contact</a>'
             '<a role="menuitem" href="/about.html#area">Service area</a><a role="menuitem" href="/about.html#faq">FAQ</a>'
             '<button type="button" role="menuitem" class="sheet-chat">Chat with us</button>'
             '<a role="menuitem" class="sheet-call" href="tel:+12183098215">Call (218) 309-8215</a></div></details>')
    foot_links = "".join(f'<a href="{h}">{t}</a>' for h, t, _ in NAV)
    nxt = []
    if active != "/services.html": nxt.append('<a class="ns-item" href="/services.html"><b>Got a problem now?</b><span>Find your job, see the price, book →</span></a>')
    if active != "/plans.html": nxt.append('<a class="ns-item" href="/plans.html"><b>We don’t just fix it — we prevent it</b><span>Home Team Plan, $29/mo →</span></a>')
    nxt.append('<a class="ns-item" href="/north-fork-plumbing.vcf" download><b>Save our number</b><span>Add (218) 309-8215 to contacts →</span></a>')
    band = '<aside class="next-steps" aria-label="Next steps"><div class="wrap">' + "".join(nxt[:3]) + '</div></aside>'
    return band + f'''
<div class="trust"><div class="wrap">
  <div><b>ND + MN</b>Both sides of the river</div>
  <div><b>Flat-rate</b>Approved before work starts</div>
  <div><b>24/7</b>Plumber on the line, not a bot</div>
  <div><b>Valley-built</b>Freeze, melt, hard water</div>
</div></div>
<footer><div class="wrap">
  <div class="top">
    <div>
      <div class="brandline" style="display:flex;gap:12px;align-items:center;margin-bottom:14px">
        <img src="badge.svg" alt="" style="height:44px;width:44px"><span class="name">North Fork Plumbing Co.</span>
      </div>
      <p>Hometown plumbing for Greater Grand Forks, Eastern North Dakota, and Western Minnesota. One name on the truck. One standard of work.</p>
    </div>
    <div><h4>Pages</h4>{foot_links}</div>
    <div><h4>Reach us</h4><a href="tel:+12183098215">(218) 309-8215</a><a href="mailto:nateplumb97@icloud.com">nateplumb97@icloud.com</a><a href="/north-fork-plumbing.vcf" download>Save our number</a><a href="/about.html#area">Service area</a><a href="/about.html#faq">FAQ</a></div>
  </div>
  <div class="bottom">
    <span>© <span id="yr">2026</span> North Fork Plumbing Co. All rights reserved.</span>
    <span>Serving Greater Grand Forks and the Red River Valley</span>
  </div>
</div></footer>
<nav class="tabbar" aria-label="Sections">{tabs}</nav>
{P("_chat.part")}<a class="float-call" href="tel:+12183098215" aria-label="Call North Fork Plumbing Co. now">Call Now</a>
<script src="site.js" defer></script>
<script src="analytics.js" defer></script>
{scripts}<script src="ee-chat.js" defer></script>
</body>
</html>
'''

def page(fn, path, title, desc, body, scripts="", extra=""):
    out = head(title, desc, path, extra) + chrome_top(path) + '<main id="main">\n' + body + '\n</main>' + chrome_bottom(path, scripts)
    open(os.path.join(R, fn), "w").write(out)

def money(o):
    if o.get("low"): return f"${o['low']:,}–${o['high']:,}"
    if o.get("diagnostic"): return f"${D['diag']['low']}–${D['diag']['high']} diagnostic"
    return "Quoted on site"
def from_price(svc):
    lows = [o["low"] for o in D["services"][svc]["options"] if o.get("low")]
    if lows: return f"from ${min(lows):,}"
    if any(o.get("diagnostic") for o in D["services"][svc]["options"]): return f"from ${D['diag']['low']} diagnostic"
    return "quoted on site"
def book_link(svc, i=None):
    return "/services.html?job=" + quote(svc) + ("" if i is None else f"&amp;opt={i}")

DESC = {
 "Emergency repair": "Burst lines, sewer backups, failed shut-offs. Call for active water — day, night, or blizzard.",
 "Drain / sewer": "Camera inspections, augering, and hydro jetting for lines choked by roots, grease, or Valley clay silt.",
 "Water heater": "Tank and tankless — sized for households that run showers, laundry, and a hockey-bag wash cycle at once.",
 "Sump pump / flooding": "Primary pumps, battery backups, and check-valve service — ready before the Red River says it’s spring.",
 "Frozen or burst pipe": "Safe electric thawing, repair, and re-routing of freeze-prone runs so one cold snap never bites twice.",
 "Softener / filtration": "Valley water is famously hard. Softeners, iron filters, and RO systems that protect fixtures and taste right.",
 "Fixture install": "Toilets, faucets, shower valves, tubs, and garbage disposals — pick the closest match and see the starting estimate first.",
 "Remodel / rough-in": "Kitchen, bath, and addition plumbing that will pass inspection on both sides of the river.",
 "Commercial": "Light commercial, backflow, and service contracts for shops that cannot wait on a residential queue.",
 "Something else": "Low pressure, a smell, a noise you can’t place. Describe it and we sort it out — diagnostic first, fix quoted before work.",
}
TAG = {"Emergency repair": "Urgent", "Sump pump / flooding": "Flood Zone", "Frozen or burst pipe": "Winter"}
ORDER = list(DESC)

# ------------------------------------------------------------------ Home
HOME_LD = '''<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Plumber","name":"North Fork Plumbing Co.","alternateName":"North Fork Plumbing","url":"https://plumbingmidwest.netlify.app/","image":"https://plumbingmidwest.netlify.app/og.svg","telephone":"+1-218-309-8215","email":"nateplumb97@icloud.com","priceRange":"$$","address":{"@type":"PostalAddress","addressLocality":"Grand Forks","addressRegion":"ND","addressCountry":"US"},"areaServed":["Greater Grand Forks ND","Grand Forks ND","Fargo ND","West Fargo ND","Grafton ND","Devils Lake ND","Wahpeton ND","Hillsboro ND","Mayville ND","Larimore ND","Casselton ND","East Grand Forks MN","Moorhead MN","Crookston MN","Thief River Falls MN","Detroit Lakes MN","Ada MN","Warren MN","Fertile MN","Breckenridge MN","Dilworth MN"],"openingHours":"Mo-Su 00:00-24:00"}
</script>
<script>/* Old one-page links (/#book, /#plan …) moved to their own pages. */
(function(){var m={book:"/services.html",services:"/services.html",plan:"/plans.html",season:"/plans.html#season",reviews:"/reviews.html",why:"/about.html#why",how:"/about.html#how",area:"/about.html#area",faq:"/about.html#faq",contact:"/about.html#contact",truck:"/services.html",top:null};var h=location.hash.slice(1);if(m[h])location.replace(m[h]);})();</script>
'''
top4 = ORDER[:4]
home_cards = "".join(
    f'<a class="svc svc-link reveal" href="{book_link(s)}">' + (f'<span class="tag">{TAG[s]}</span>' if s in TAG else "") +
    f'<h3>{e(D["guide"][s]["label"])}</h3><p>{e(D["guide"][s]["hint"])}.</p><span class="from">{from_price(s)} · Book →</span></a>' for s in top4)
home = f'''<div class="hero hero-home"><div class="wrap">
  <div>
    <span class="kicker">Greater Grand Forks Born · Red River Valley Proud</span>
    <h1>The Valley’s Plumbers.<br><em>On Call. On Time.</em></h1>
    <p class="lead">Flat-rate price before a wrench turns, on both sides of the Red River.</p>
    <ul class="trust3">
      <li><b>24/7</b> a plumber answers, not a machine</li>
      <li><b>Flat-rate</b> you approve the number first</li>
      <li><b>ND + MN</b> one crew, both sides of the river</li>
    </ul>
    <div class="ctas ctas-big">
      <a class="btn btn-green btn-xl" href="/services.html">Book &amp; see your price</a>
      <a class="btn btn-ghost btn-xl" href="tel:+12183098215">Call (218) 309-8215</a>
    </div>
  </div>
  <div class="hero-stage" id="heroLane" aria-hidden="true"><noscript><img src="assets/hero-still.svg" alt="" width="1000" height="552"></noscript></div>
</div></div>
<a class="season-tip" id="seasonTip" href="/plans.html#season"><span class="st-ico" aria-hidden="true">❄</span><span><b id="seasonLabel">Valley season</b> <span id="seasonCopy">Freeze, melt and hard water each have a season. Here’s what to do now.</span></span><span class="st-go" aria-hidden="true">→</span></a>
<section class="sec-tight"><div class="wrap">
  <div class="sec-head"><div class="eyebrow">Most-booked</div><h2>Top services</h2></div>
  <div class="svc-grid svc-grid-4">{home_cards}</div>
  <p class="more-link"><a href="/services.html">All services and starting prices →</a></p>
</div></section>
<div class="plan plan-teaser"><div class="wrap">
  <div><h2>We don’t just fix it — we prevent it.</h2>
    <p>The Home Team Plan: annual inspection, water-heater flush, pre-melt sump test, priority scheduling and 10% off repairs (up to $120).</p>
    <span class="price">$29/mo · $279/yr</span>
  </div>
  <div class="plan-actions"><a class="btn btn-green" href="/plans.html">See what’s included</a></div>
</div></div>
'''
page("index.html", "/", "North Fork Plumbing Co. | Greater Grand Forks & the Red River Valley",
     "North Fork Plumbing Co. serves Greater Grand Forks, Eastern North Dakota, and Western Minnesota. 24/7 emergency repairs, drains, water heaters, sump pumps and frozen pipes with flat-rate prices before work starts.",
     home, '<script src="motion.js" defer></script>\n', HOME_LD)

# ------------------------------------------------------------------ Services
cats = ""
for s in ORDER:
    g = D["guide"][s]; opts = D["services"][s]["options"]
    rows = "".join(
        f'<li><button type="button" class="opt-btn" aria-expanded="false" aria-controls="optDetail" data-svc="{e(s)}" data-idx="{i}"><span class="o-name">{e(D["scope"].get(o["label"], o["label"]))}</span>'
        + (f'<span class="o-hint">{e(D["hint"][o["label"]])}</span>' if o["label"] in D["hint"] else "")
        + f'<span class="o-price">{money(o)}</span></button></li>' for i, o in enumerate(opts))
    cats += (f'<details class="svc-cat" id="{quote(s.split(" ")[0].lower())}">'
             f'<summary><span class="sc-h"><b>{e(g["label"])}</b>' + (f'<span class="tag">{TAG[s]}</span>' if s in TAG else "") +
             f'<small>{e(g["hint"])}</small></span><span class="sc-from">{from_price(s)}</span></summary>'
             f'<div class="sc-body"><p>{e(DESC[s])}</p><p class="sc-pick">Tap a job to see the price and book it:</p><ul class="opt-list">{rows}</ul></div></details>')
services = f'''<a class="em-strip" href="tel:+12183098215"><span class="em-dot" aria-hidden="true"></span><b>Water emergency?</b> <span>Call now — (218) 309-8215</span></a>
<section class="page-head"><div class="wrap">
  <div class="eyebrow">Services &amp; booking</div><h1>Find your job. See the price. Book it.</h1>
  <p>Tap what’s going on, then the job that fits. You’ll see what it means, what we do and the starting price — and book it right there. Flat-rate before we start.</p>
</div></section>
<section class="sec-tight"><div class="wrap svc-cats">{cats}
  <div class="opt-detail" id="optDetail" role="region" hidden><div class="od-scene scene"></div><div class="od-body"></div>
  <form class="bf" id="bookForm" name="service-request" method="POST" action="/thanks.html" data-netlify="true" netlify-honeypot="bot-field" novalidate hidden aria-label="Book this job">
    <input type="hidden" name="form-name" value="service-request">
    <input type="hidden" name="notify" value="nateplumb97@icloud.com">
    <input type="hidden" name="service"><input type="hidden" name="scope"><input type="hidden" name="optionIndex">
    <input type="hidden" name="urgency"><input type="hidden" name="estimate"><input type="hidden" name="day"><input type="hidden" name="window">
    <input type="hidden" name="ref"><input type="hidden" name="town"><input type="hidden" name="zip">
    <p class="bf-hp" hidden><label>Don’t fill this <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
    <div class="bf-head"><span class="bf-job"></span><span class="bf-price" aria-live="polite"></span></div>
    <div class="bf-grid">
      <label class="bf-f"><span>Name</span><input name="name" autocomplete="name" required aria-describedby="e-name"><small class="bf-err" id="e-name" data-err="name" aria-live="polite"></small></label>
      <label class="bf-f"><span>Phone</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="218-555-0100" aria-describedby="e-phone"><small class="bf-err" id="e-phone" data-err="phone" aria-live="polite"></small></label>
      <label class="bf-f bf-wide"><span>Service address</span><input name="street" autocomplete="street-address" required placeholder="1420 Demers Ave, Grand Forks 58201" aria-describedby="e-street"><small class="bf-err" id="e-street" data-err="street" aria-live="polite"></small></label>
      <label class="bf-f bf-wide"><span>Email <em>(optional)</em></span><input name="email" type="email" autocomplete="email" aria-describedby="e-email"><small class="bf-err" id="e-email" data-err="email" aria-live="polite"></small></label>
    </div>
    <div class="bf-photos">
      <span class="bf-lab" id="bfPhLab">Photos <em>(optional, up to 3)</em></span>
      <p class="bf-hint" id="bfPhHint">Optional: a photo of the leak, part, or label helps us bring the right parts.</p>
      <div class="bf-thumbs" role="list" aria-label="Attached photos"></div>
      <label class="btn btn-line bf-addph"><input type="file" class="bf-pick" accept="image/*" multiple aria-describedby="bfPhHint"><span class="bf-addtxt">Add photos</span></label>
      <p class="bf-phmsg" aria-live="polite"></p>
      <div hidden><input type="file" name="photo1" accept="image/*" tabindex="-1"><input type="file" name="photo2" accept="image/*" tabindex="-1"><input type="file" name="photo3" accept="image/*" tabindex="-1"></div>
      <input type="hidden" name="photoCount" value="0">
    </div>
    <div class="bf-when"><span class="bf-lab" id="bfWhen">Preferred date</span><div class="bf-days" role="radiogroup" aria-labelledby="bfWhen"></div></div>
    <p class="bf-plan">Members save 10% on repairs, up to $120 — <a href="/plans.html">see the Home Team Plan</a>.</p>
    <button type="submit" class="btn btn-green bf-submit">Book this job</button>
    <p class="bf-msg" role="alert"></p>
    <p class="bf-fine">We call to confirm the time and give a flat-rate price before any work. Nothing is charged online.</p>
  </form>
  </div>
  <p class="fine">Starting estimates from our pricebook. Diagnostic (${D["diag"]["low"]}–${D["diag"]["high"]}) is credited toward the repair if you approve the work.</p>
</div></section>
'''
page("services.html", "/services.html", "Plumbing Services & Starting Prices | North Fork Plumbing Co.",
     "Every North Fork Plumbing service with plain-language descriptions and flat-rate starting prices: emergency leaks, drains and sewer, water heaters, sump pumps, frozen pipes, softeners, fixtures, remodels and commercial.",
     services, '<script src="pricebook.js"></script>\n<script src="schedule.js"></script>\n<script src="tips.js" defer></script>\n<script src="jobinfo.js" defer></script>\n<script src="services.js" defer></script>\n')

# ------------------------------------------------------------------ Book (moved)
# Booking lives on services.html now. Netlify 301s /book.html -> /services.html (query kept);
# this page is the fallback for anything that still serves the file.
open(os.path.join(R, "book.html"), "w").write('''<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Book a plumber | North Fork Plumbing Co.</title>
<meta name="robots" content="noindex"><link rel="canonical" href="https://plumbingmidwest.netlify.app/services.html">
<script>location.replace("/services.html" + location.search + location.hash);</script>
<meta http-equiv="refresh" content="0; url=/services.html"></head>
<body><p>Booking moved to <a href="/services.html">Services</a>. Emergencies: <a href="tel:+12183098215">(218) 309-8215</a>.</p></body></html>
''')

# ------------------------------------------------------------------ Reviews
reviews = f'''<section class="page-head"><div class="wrap">
  <div class="eyebrow">Word of mouth</div><h1>Reviews after the work. Not before.</h1>
  <p>North Fork Plumbing Co. is new under this name, so there are no reviews to show yet — and we will not publish made-up stars, names or counts. The first real reviews go on our Google Business profile, then here.</p>
</div></section>
<section class="sec-tight"><div class="wrap two-col">
  <div class="cardc reveal"><h2 class="h3">Leave a review</h2>
    <p>After each completed job we text you a review link. Our Google Business profile is still being set up; until it’s live, reply to that text or email <a href="mailto:nateplumb97@icloud.com">nateplumb97@icloud.com</a> and tell us how we did — good or bad.</p>
    <p>Want to check us out first? Call {TEL} and ask about recent jobs.</p>
    <p><a class="btn btn-green btn-sm" href="mailto:nateplumb97@icloud.com?subject=How%20North%20Fork%20did&amp;body=Town%3A%20%0AJob%3A%20%0AHow%20did%20we%20do%3F%20">Had us out? Tell us how we did</a></p>
    <p class="fine">We read every one. Honest beats five stars — if something wasn’t right, we want the chance to fix it.</p></div>
  <div class="standard reveal"><h2 class="h3">Our guarantee: the North Fork Standard</h2>
    <ul>
      <li>Flat-rate price from the pricebook, approved by you before work starts</li>
      <li>Shoe covers and a drop cloth — your floor is not a parts bench</li>
      <li>Photos of the work before we close the wall or leave the basement</li>
      <li>Same-day invoice, card or check</li>
      <li>A follow-up after the first week</li>
    </ul></div>
</div></section>
<section class="sec-tight sec-alt"><div class="wrap">
  <div class="sec-head"><div class="eyebrow">How we work</div><h2>Three steps. No runaround.</h2></div>
  <div class="how-grid">
    <div class="how-card"><div class="n">01</div><h3>You call or book</h3><p>We triage shut-off and safety, then give you an arrival window.</p></div>
    <div class="how-card"><div class="n">02</div><h3>Flat-rate quote</h3><p>On site we price from the book before a wrench turns. You approve the number.</p></div>
    <div class="how-card"><div class="n">03</div><h3>Fix + photos</h3><p>Work, documentation, same-day invoice. Then a check-in.</p></div>
  </div>
</div></section>
'''
page("reviews.html", "/reviews.html", "Reviews | North Fork Plumbing Co.",
     "North Fork Plumbing Co. publishes only real customer reviews. See how we work, our flat-rate guarantee, and how to leave a review after your job.",
     reviews)

# ------------------------------------------------------------------ Plans
plans = f'''<section class="page-head page-head-plan"><div class="wrap">
  <div class="eyebrow">Home Team Plan · maintenance membership</div><h1>We don’t just fix it — we prevent it.</h1>
  <p>One plan, built around the Valley’s freeze and thaw. We keep the heater flushed, the sump tested before melt, and you at the front of the line.</p>
  <div class="plan-price"><b>$29<small>/mo</small></b><span>or <b>$279/yr</b> paid yearly (save $69)</span></div>
  <div class="plan-actions plan-actions-row">
    <button type="button" class="btn btn-green" data-plan="monthly">Join — $29/mo</button>
    <button type="button" class="btn btn-ghost" data-plan="yearly">Pay yearly — $279</button>
    <a class="btn btn-ghost" href="tel:+12183098215">Ask on the phone</a>
  </div>
  <p class="plan-msg" id="planMsg" role="status"></p>
</div></section>
<section class="sec-tight"><div class="wrap two-col">
  <div class="standard reveal"><h2 class="h3">What’s included</h2>
    <ul>
      <li><b>Annual plumbing inspection</b> — supply lines, shut-offs, drains, fixtures, heater and sump</li>
      <li><b>Water-heater flush</b> — Valley hard water leaves scale; a flush keeps the tank working</li>
      <li><b>Pre-melt sump test</b> — pump, float and check valve tested before the Red River rises</li>
      <li><b>Priority scheduling</b> — members go to the front of the line</li>
      <li><b>10% off repairs</b> — on flat-rate repair pricing, up to $120 per repair</li>
    </ul></div>
  <div class="cardc reveal"><h2 class="h3">Member perks at a glance</h2>
    <p><b>Priority</b> when the phone is ringing off the hook in a cold snap or melt week.</p>
    <p><b>10% off</b> every repair (up to $120), always quoted flat-rate first.</p>
    <p><b>One crew</b> that already knows your house, on both sides of the river.</p></div>
</div></section>
<section id="season" class="sec-tight sec-alt"><div class="wrap">
  <div class="sec-head"><div class="eyebrow">Valley calendar</div><h2>The river has a schedule. So do your visits.</h2>
    <p>We book your visits with you around the Grand Forks seasons. Typical timing:</p></div>
  <div class="season-grid">
    <article class="szn" data-months="9,10,11"><div class="when">Fall · before freeze-up</div><h3>Inspection + heater flush</h3><p>Check exposed runs, hose bibs and shut-offs, and flush scale out of the heater before the minus-thirty mornings.</p></article>
    <article class="szn" data-months="11,12,1,2,3"><div class="when">Nov – Mar · freeze watch</div><h3>Priority when it freezes</h3><p>No water after a cold snap? Members go to the front of the line, with 10% off the repair (up to $120).</p></article>
    <article class="szn" data-months="3,4"><div class="when">Mar – Apr · before the melt</div><h3>Pre-melt sump test</h3><p>Pump, float and check valve tested with a bucket before the Red River writes your weekend.</p></article>
  </div>
</div></section>
<section id="plan-faq" class="sec-tight"><div class="wrap faq-wrap">
  <div class="sec-head"><div class="eyebrow">Plan FAQ</div><h2>Questions about the plan</h2></div>
  <details><summary>How much is it?</summary><p>$29 a month, or $279 a year paid up front (that saves $69).</p></details>
  <details><summary>When do the visits happen?</summary><p>We schedule them with you — typically the inspection and heater flush in the fall before freeze-up, and the sump test in early spring before the melt.</p></details>
  <details><summary>Does the 10% apply to emergencies?</summary><p>The 10% (up to $120 per repair) applies to repairs, and every repair is quoted flat-rate before work starts. Ask us about your specific job.</p></details>
  <details><summary>Can I cancel?</summary><p>Call or email us and we’ll walk you through it — plan terms are confirmed when you sign up.</p></details>
  <details><summary>How do I sign up?</summary><p>Use the Join buttons above for secure online checkout. If online signup isn’t available yet, the button tells you, and we set it up over the phone at (218) 309-8215.</p></details>
</div></section>
'''
page("plans.html", "/plans.html", "Home Team Plan — Plumbing Maintenance Membership | North Fork Plumbing Co.",
     "North Fork Plumbing’s Home Team Plan: annual inspection, water-heater flush, pre-melt sump test, priority scheduling and 10% off repairs (up to $120) for $29/mo or $279/yr in the Grand Forks area.",
     plans, '<script src="plan.js" defer></script>\n')

# ------------------------------------------------------------------ About
about = f'''<section class="page-head"><div class="wrap">
  <div class="eyebrow">About North Fork</div><h1>The name on the truck is the name on the work.</h1>
  <p>Valley homes have their own rhythm: hard water, freeze-thaw, spring melt, and a river between towns. North Fork keeps the request, estimate, and schedule simple so your family can get back to normal.</p>
</div></section>
<section id="contact" class="sec-tight"><div class="wrap">
  <div class="cinfo cinfo-3">
    <div class="cardc"><b>Call or text</b><a class="big" href="tel:+12183098215">(218) 309-8215</a><p>24/7 — a plumber answers, not a machine.</p></div>
    <div class="cardc"><b>Email</b><a class="big" style="font-size:18px" href="mailto:nateplumb97@icloud.com">nateplumb97@icloud.com</a><p>Estimates, plan questions, and paperwork.</p></div>
    <div class="cardc"><b>Hours</b><p><b>Emergencies:</b> 24/7/365<br><b>Office:</b> Mon–Fri, 7:00 AM–5:00 PM</p></div>
  </div>
</div></section>
<section id="why" class="sec-tight sec-alt"><div class="wrap">
  <div class="points">
    <div class="point"><b>Dual-state by design</b><p>Grand Forks and East Grand Forks are one service area, not two contractors. We confirm job-specific requirements and permits for your property and jurisdiction before work begins.</p></div>
    <div class="point"><b>A plumber answers</b><p>24/7/365. If it is flooding, you talk to someone who can tell you which valve to turn while they roll.</p></div>
    <div class="point"><b>Flat-rate, then wrenches</b><p>Pricebook number first. You approve. After-hours uses a published 1.5× multiplier — still quoted before we start.</p></div>
  </div>
</div></section>
<section id="area" class="sec-tight"><div class="wrap">
  <div class="sec-head"><div class="eyebrow">Service area</div><h2>Both sides of the Red River</h2>
    <p>Greater Grand Forks and East Grand Forks first, then the Valley towns.</p></div>
  <div class="area-grid">
    <div class="area-col"><h3>Eastern North Dakota <span class="st">ND</span></h3>
      <div class="towns"><span class="town">Grand Forks</span><span class="town">Fargo</span><span class="town">West Fargo</span><span class="town">Grafton</span><span class="town">Devils Lake</span><span class="town">Wahpeton</span><span class="town">Hillsboro</span><span class="town">Mayville</span><span class="town">Larimore</span><span class="town">Casselton</span></div></div>
    <div class="area-col"><h3>Western Minnesota <span class="st mn">MN</span></h3>
      <div class="towns"><span class="town">East Grand Forks</span><span class="town">Moorhead</span><span class="town">Crookston</span><span class="town">Thief River Falls</span><span class="town">Detroit Lakes</span><span class="town">Ada</span><span class="town">Warren</span><span class="town">Fertile</span><span class="town">Breckenridge</span><span class="town">Dilworth</span></div></div>
  </div>
  <p class="area-note">Don’t see your town? Call anyway. If we can make the drive and pull a permit, we will.</p>
</div></section>
<section id="how" class="sec-tight sec-alt"><div class="wrap">
  <div class="sec-head"><div class="eyebrow">The call</div><h2>Three steps. No runaround.</h2></div>
  <div class="how-grid">
    <div class="how-card"><div class="n">01</div><h3>You call</h3><p>We triage shut-off and safety, then give you an arrival window.</p></div>
    <div class="how-card"><div class="n">02</div><h3>Flat-rate quote</h3><p>On site we price from the book before a wrench turns. You approve the number.</p></div>
    <div class="how-card"><div class="n">03</div><h3>Fix + photos</h3><p>Work, documentation, same-day invoice. Then a check-in.</p></div>
  </div>
</div></section>
<section id="faq" class="sec-tight"><div class="wrap faq-wrap">
  <div class="sec-head"><div class="eyebrow">Straight answers</div><h2>FAQ</h2></div>
  <details><summary>What if water is moving at 2 a.m.?</summary><p>Call (218) 309-8215 — do not wait on the form. Shut off the main water if it is safe, keep power away from standing water, and tell us what you see.</p></details>
  <details><summary>Do you serve Minnesota and North Dakota?</summary><p>Yes — we serve both sides of the Red River. Availability and any permitting requirements depend on the job and jurisdiction, so call if you are unsure.</p></details>
  <details><summary>Will I know the price before work starts?</summary><p>Flat-rate from the pricebook, approved first. After-hours carries a published multiplier — still quoted before we start.</p></details>
  <details><summary>Same-day water heater?</summary><p>Often, when the unit is a common size we stock. Tank and tankless, sized for real Valley households.</p></details>
  <details><summary>How do I pay?</summary><p>Same-day invoice, card or check.</p></details>
</div></section>
'''
FAQ_LD = '''<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"Do you answer the phone at night?","acceptedAnswer":{"@type":"Answer","text":"For urgent water issues, call (218) 309-8215 rather than waiting on an online request."}},
{"@type":"Question","name":"Do you work on both sides of the Red River?","acceptedAnswer":{"@type":"Answer","text":"Yes. North Fork Plumbing Co. serves Eastern North Dakota and Western Minnesota; availability and permits depend on the job and jurisdiction."}},
{"@type":"Question","name":"Do I get a price before work starts?","acceptedAnswer":{"@type":"Answer","text":"Yes. Flat-rate quote before a wrench turns."}},
{"@type":"Question","name":"What should I do if a pipe bursts?","acceptedAnswer":{"@type":"Answer","text":"Shut off the main valve, keep power away from standing water, and call (218) 309-8215."}}
]}
</script>
'''
page("about.html", "/about.html", "About & Contact — Grand Forks & EGF Plumbers | North Fork Plumbing Co.",
     "Contact North Fork Plumbing Co.: (218) 309-8215, 24/7 emergencies, office Mon–Fri 7–5. Serving Grand Forks, East Grand Forks and towns across Eastern ND and Western MN.",
     about, "", FAQ_LD)
print("built")

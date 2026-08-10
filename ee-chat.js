(function(){
  var btn = document.getElementById('eeChatBtn');
  var panel = document.getElementById('eeChatPanel');
  var closeBtn = document.getElementById('eeChatClose');
  var msgs = document.getElementById('eeChatMsgs');
  var chipsEl = document.getElementById('eeChatChips');
  var form = document.getElementById('eeChatForm');
  var input = document.getElementById('eeChatInput');
  if(!btn || !panel) return;

  var PHONE = '(218) 779-2553';
  var TEL = 'tel:+12187792553';
  var starters = ['Emergency help','Book a service','Water heater','Drain / sewer','Sump pump','Service area','Hours & pricing','Home Team Plan','Something else'];

  function addBubble(text, who){
    var d = document.createElement('div');
    d.className = 'ee-bubble ' + who;
    d.innerHTML = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function setChips(list){
    chipsEl.innerHTML = '';
    (list || starters).forEach(function(label){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ee-chip';
      b.textContent = label;
      b.addEventListener('click', function(){ handleUser(label); });
      chipsEl.appendChild(b);
    });
  }
  function openChat(){
    panel.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded','true');
    panel.setAttribute('aria-hidden','false');
    if(!msgs.childElementCount){
      addBubble('Hi — I\'m the E&E helper. Ask me about emergencies, booking a call, water heaters, drains, sumps, pricing, or anything else plumbing-related.\n\nIf water is actively flooding or you smell gas, call <a href="'+TEL+'">'+PHONE+'</a> right now — a licensed plumber answers 24/7.', 'bot');
      setChips(starters);
    }
    setTimeout(function(){ input.focus(); }, 50);
  }
  function closeChat(){
    panel.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
    panel.setAttribute('aria-hidden','true');
  }
  function reply(text){ setTimeout(function(){ addBubble(text, 'bot'); }, 280); }

  function match(q){
    q = (q || '').toLowerCase().trim();
    if(!q) return null;
    if(/(emerg|flood|burst|gushing|no water|gas smell|sewer backup|backup in house|ceiling wet|pipe broke|actively leak)/.test(q) || q === 'emergency help')
      return 'This sounds urgent.\n\n1. Shut off the main water valve (usually by the meter / basement front wall).\n2. Kill power near standing water.\n3. Call us now — a licensed plumber answers 24/7.\n\n<a href="'+TEL+'">'+PHONE+'</a>\n\nYou can also <a href="#contact">request service online</a>, but calling is fastest for emergencies.';
    if(/(book|schedul|appoint|request service|come out|dispatch)/.test(q) || q === 'book a service')
      return 'To get on the schedule:\n\n• Call or text <a href="'+TEL+'">'+PHONE+'</a>\n• Or use the <a href="#contact">Request Service</a> form on this page\n\nTell us your town, what\'s going on, and how urgent it is. We\'ll call back with an arrival window. Flat-rate quote before we start any work.';
    if(/(water heater|hot water|no hot|tankless|heater)/.test(q) || q === 'water heater')
      return 'We install and repair tank and tankless water heaters — sized for real Valley households.\n\nCommon needs: no hot water, leaking tank, rumbling/sediment, replacements, expansion tanks.\n\n<a href="#contact">Request service</a> or call <a href="'+TEL+'">'+PHONE+'</a>.';
    if(/(drain|sewer|clog|slow sink|toilet overflow|hydro|camera|root)/.test(q) || q.indexOf('drain') !== -1)
      return 'Drain & sewer work we handle:\n\n• Augering sinks, tubs, toilets, mains\n• Camera inspections\n• Hydro jetting for roots, grease, and clay silt\n\nIf sewage is coming up in the house, treat it as an emergency and call <a href="'+TEL+'">'+PHONE+'</a>.\n\nOtherwise <a href="#contact">book online</a> and note “drain/sewer.”';
    if(/(sump|basement water|flood zone|battery backup|check valve)/.test(q) || q === 'sump pump')
      return 'Sump pumps are critical before Red River melt. We service and install primary pumps, battery backups, and check valves.\n\nTest with a bucket before spring. Need one now? <a href="#contact">Request service</a> or call <a href="'+TEL+'">'+PHONE+'</a>.';
    if(/(frozen|freeze|ice in pipe|no flow winter)/.test(q))
      return 'Frozen pipes: don\'t use an open flame.\n\n• Keep the faucet open\n• Warm the area gently if you can\n• Call us for safe electric thawing and a lasting repair\n\n<a href="'+TEL+'">'+PHONE+'</a> — 24/7.';
    if(/(softener|hard water|iron filter|filtration|ro system)/.test(q))
      return 'Valley water is hard. We install and service softeners, iron filters, and RO systems.\n\n<a href="#contact">Request a visit</a> or call <a href="'+TEL+'">'+PHONE+'</a>.';
    if(/(area|town|city|serve|fargo|grand forks|moorhead|crookston|where do you)/.test(q) || q === 'service area')
      return 'We cover both sides of the Red River — Eastern ND and Western MN (Grand Forks, Fargo, East Grand Forks, Moorhead, Crookston, and surrounding towns).\n\nDon\'t see your town? Call anyway. <a href="#area">Full list</a> · <a href="'+TEL+'">'+PHONE+'</a>';
    if(/(hour|open|when|24\/7|weekend|night)/.test(q) || q.indexOf('hours') !== -1)
      return 'Emergencies: 24/7/365 — a licensed plumber answers.\n\nOffice / scheduling: Mon–Fri, 7:00 AM–5:00 PM.\n\nAfter-hours rates are higher; we still give a flat-rate number before we start.\n\n<a href="'+TEL+'">'+PHONE+'</a>';
    if(/(price|cost|rate|quote|how much|flat)/.test(q) || q.indexOf('pricing') !== -1)
      return 'We use upfront flat-rate pricing — you approve the number before we touch a wrench.\n\nFor a number on your specific job, call <a href="'+TEL+'">'+PHONE+'</a> or <a href="#contact">request service</a>.';
    if(/(member|home team|plan|maintenance)/.test(q) || q === 'home team plan')
      return 'The Home Team Plan includes an annual inspection, water heater flush, sump test before melt season, priority scheduling, and member pricing on repairs.\n\nAsk about current rates when you book: <a href="#contact">contact form</a> or <a href="'+TEL+'">'+PHONE+'</a>.';
    if(/(license|insured|bonded|minnesota|north dakota)/.test(q))
      return 'E&E is set up for both North Dakota and Minnesota — licensing, bonding, and insurance so you don\'t need two contractors at the state line.';
    if(/(toilet|faucet|disposal|fixture|leak under sink)/.test(q))
      return 'We handle fixture repairs and replacements — toilets, faucets, supply stops, disposals, and more.\n\n<a href="#contact">Request service</a> or call <a href="'+TEL+'">'+PHONE+'</a>.';
    if(/(commercial|business|restaurant|backflow)/.test(q))
      return 'We take on light commercial work: service contracts, backflow testing, and build-outs.\n\nCall <a href="'+TEL+'">'+PHONE+'</a> or use the form and choose “Commercial.”';
    if(/(hello|hi |hey|thanks|thank you)/.test(q))
      return 'Happy to help — what do you need? Emergency, booking, water heater, drains, sump, or something else?';
    if(/(human|person|agent|real person|talk to)/.test(q))
      return 'For a real plumber, call or text <a href="'+TEL+'">'+PHONE+'</a> anytime. Or leave details on the <a href="#contact">Request Service</a> form.';
    if(/(warranty|guarantee|guarantee|how long)/.test(q))
      return 'We stand behind our work. Ask about the labor warranty and manufacturer coverage on parts when we quote your job.\n\nCall <a href="'+TEL+'">'+PHONE+'</a> or <a href="#contact">request service</a>.';
    if(/(payment|pay|credit|card|cash|financing|bill)/.test(q))
      return 'We accept major cards, checks, and cash. Financing options are available on larger jobs — ask when we quote.\n\n<a href="#contact">Request service</a> or call <a href="'+TEL+'">'+PHONE+'</a>.';
    if(/(review|rating|google|yelp|testimonial)/.test(q))
      return 'We love happy customers. After the job we\'ll send a quick review link. You can also find us on Google Business.\n\nNeed help now? <a href="#contact">Request service</a> or call <a href="'+TEL+'">'+PHONE+'</a>.';
    if(/(who are you|about|company|estad|ellingson)/.test(q))
      return 'We\'re Estad & Ellingson Plumbing (E&E) — local licensed plumbers serving both sides of the Red River Valley. Flat-rate pricing, 24/7 emergency response, and the Home Team Plan for priority service.\n\n<a href="#contact">Request service</a> · <a href="'+TEL+'">'+PHONE+'</a>';
    if(/(help|what can you|anything|whatever|something else)/.test(q) || q === 'something else')
      return 'I can help with:\n• Emergencies & shut-off tips\n• Booking a service call\n• Water heaters, drains, sumps, frozen pipes\n• Softeners / filtration\n• Service area, hours, pricing\n• Home Team membership\n• Warranties & payment options\n\nJust type what you need, tap a suggestion, or call <a href="'+TEL+'">'+PHONE+'</a>.\n\nFor a specific job: <a href="#contact">Request Service</a>.';
    if(q === 'call now'){ window.location.href = TEL; return 'Opening your phone dialer…'; }
    if(q === 'shut-off tips') return match('What should I do if a pipe bursts?');
    return 'Got it. I can help with emergencies, booking, water heaters, drains, sumps, frozen pipes, softeners, service area, hours, pricing, warranties, payments, and the Home Team Plan.\n\nTry a suggestion below, describe what you need, or call <a href="'+TEL+'">'+PHONE+'</a> anytime.\n\nJob request: <a href="#contact">Request Service</a>.';
  }

  function handleUser(text){
    text = (text || '').trim();
    if(!text) return;
    addBubble(text.replace(/</g,'&lt;'), 'user');
    reply(match(text));
    if(/emerg|flood|burst/i.test(text)) setChips(['Call now','Book a service','Shut-off tips']);
    else if(/book|schedul/i.test(text)) setChips(['Emergency help','Service area','Hours & pricing']);
    else setChips(starters);
  }

  btn.addEventListener('click', function(){ panel.classList.contains('open') ? closeChat() : openChat(); });
  closeBtn.addEventListener('click', closeChat);
  form.addEventListener('submit', function(ev){ ev.preventDefault(); var v = input.value; input.value=''; handleUser(v); });
})();

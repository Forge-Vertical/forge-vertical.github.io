/*
 * Bookkeepers South Africa — combined contact launcher ("Lily" chat + WhatsApp)
 * -----------------------------------------------------------------------
 * UI SHELL ONLY — no backend wired up yet. This is intentional, same pattern
 * as the careers.html Apply modal: build and agree on the UX first, wire up
 * the real AI + notification plumbing once the API/email provider is chosen.
 *
 * What's real right now:
 *   - The quick-reply chips answer instantly from FAQ_DATA below (the same
 *     14 questions on the homepage FAQ) — genuinely correct, no AI needed.
 *   - The WhatsApp button in the panel header is the real, free click-to-chat
 *     link (wa.me) — works today, no changes needed.
 *
 * What's simulated (clearly marked with TODO):
 *   - Typing a free-text question currently always falls through to the
 *     lead-capture flow (name → phone → email) and shows a local "Lindsay
 *     will reach out" confirmation. In the real version, that free-text
 *     message should first go to an LLM scoped to FAQ_DATA — if it can
 *     answer confidently, reply directly; if not, THEN start lead capture.
 *     The lead-capture submission should POST to a Cloud Function that
 *     emails Lindsay (not an automated WhatsApp message — see proposal
 *     notes on why: WhatsApp Business API now charges per message as of
 *     Oct 2026, and unofficial automation risks her number being banned).
 *
 * Swap the avatar: replace the .chat-avatar / .launcher-avatar spans below
 * with an <img> once Lindsay has picked Lily's look and name.
 */
(function(){
  var WHATSAPP_URL = 'https://wa.me/27727791046';
  var BOT_NAME = 'Lily';

  // Same 14 Q&As as the homepage FAQ — kept here so every page (not just
  // the homepage) can offer instant, correct answers without a backend.
  var FAQ_DATA = [
    { q: 'What does a bookkeeper do?', a: "A bookkeeper manages your business's financial records, including tracking income and expenses, reconciling bank accounts, preparing financial reports, and ensuring compliance with tax regulations." },
    { q: 'Why do I need a bookkeeper for my small business?', a: 'A bookkeeper ensures your financial records are accurate, up-to-date, and compliant with laws, giving you more time to focus on growing your business. They also provide insights into your financial health.' },
    { q: "What's the difference between a bookkeeper and an accountant?", a: 'A bookkeeper focuses on daily financial transactions, while an accountant provides strategic advice, prepares tax returns, and offers financial analysis based on bookkeeping data.' },
    { q: 'How often should I update my books?', a: 'This depends on your business size and needs. Most businesses require monthly services, but larger enterprises may need weekly or even daily support.' },
    { q: 'Do you handle payroll?', a: 'Yes, we offer payroll services, including calculating salaries, deductions, and taxes, and generating payslips for your employees.' },
    { q: 'Can you help with SARS and tax compliance?', a: 'Yes, we provide SARS correspondence, tax registrations, eFiling submissions, and assistance with tax returns and directives.' },
    { q: 'Do you assist with company registrations?', a: 'Yes, we handle company registrations, ensuring your business is compliant and ready to operate legally.' },
    { q: 'What types of businesses do you work with?', a: 'We serve small to medium-sized businesses across various industries, tailoring our services to meet their specific needs.' },
    { q: 'Can you provide monthly financial reports?', a: 'Yes, we provide monthly management accounts and reports to help you track performance and make informed decisions.' },
    { q: 'Do you offer estate planning services?', a: 'Yes, we offer estate planning, will drafting, and preparation of legal cost documents to safeguard your financial future.' },
    { q: 'What accounting software do you use?', a: 'We work with leading accounting software like Xero, QuickBooks, and Pastel, ensuring accuracy and efficiency in managing your finances.' },
    { q: 'How much do your services cost?', a: 'Our pricing depends on the size of your business and the scope of work. Contact us for a consultation to discuss your needs and get a personalised quote.' },
    { q: 'Do you offer outsourced bookkeeping?', a: 'Yes, we provide comprehensive outsourcing services, including bookkeeping, payroll, tax compliance, and financial reporting.' },
    { q: 'How do I get started?', a: "It's simple! Book a consultation with us, and we'll discuss your needs, create a tailored plan, and provide ongoing support to manage your finances efficiently." }
  ];
  var QUICK_REPLY_COUNT = 4;

  function el(tag, cls, html){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(html !== undefined) e.innerHTML = html;
    return e;
  }

  var WA_SVG = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.04 2.5c-5.27 0-9.54 4.27-9.54 9.54 0 1.68.44 3.3 1.28 4.73L2.5 21.5l4.86-1.27a9.5 9.5 0 0 0 4.68 1.22h.01c5.27 0 9.54-4.27 9.54-9.54 0-2.55-1-4.94-2.8-6.74a9.47 9.47 0 0 0-6.75-2.67Z" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><path d="M8.5 7.8c.22-.5.4-.5.6-.5h.44c.18 0 .42.02.63.48.26.55.86 1.95.94 2.1.08.14.13.3.03.5-.1.19-.15.3-.3.47-.15.17-.3.3-.43.4-.15.13-.3.27-.14.56.17.3.76 1.3 1.68 2.11 1.16 1.03 2.1 1.36 2.4 1.5.3.17.48.14.65-.05.17-.19.74-.84.94-1.13.2-.28.4-.23.65-.14.26.1 1.67.8 1.95.95.28.14.47.21.54.33.07.13.07.72-.17 1.4-.24.69-1.42 1.3-1.95 1.34-.5.05-.98.23-3.3-.7-2.8-1.14-4.57-4.03-4.71-4.22-.14-.19-1.1-1.48-1.1-2.82 0-1.34.68-1.99.93-2.25Z" fill="#fff"/></svg>';

  function buildLauncher(){
    var wrap = el('div', 'chat-launcher');
    wrap.id = 'chatLauncher';

    var btn = el('button', 'launcher-btn');
    btn.type = 'button';
    btn.id = 'launcherBtn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Chat with ' + BOT_NAME + ' or WhatsApp us');
    btn.innerHTML =
      '<span class="launcher-avatar">' + BOT_NAME.charAt(0) + '</span>' +
      '<span class="launcher-label">Chat with ' + BOT_NAME + '</span>';
    wrap.appendChild(btn);

    var panel = el('div', 'chat-panel');
    panel.id = 'chatPanel';
    panel.hidden = true;
    panel.innerHTML =
      '<div class="chat-panel-header">' +
        '<span class="chat-avatar">' + BOT_NAME.charAt(0) + '</span>' +
        '<div class="chat-header-text"><strong>' + BOT_NAME + '</strong><small>Bookkeepers South Africa</small></div>' +
        '<a class="chat-wa-btn" href="' + WHATSAPP_URL + '" target="_blank" rel="noopener" aria-label="Chat on WhatsApp instead">' + WA_SVG + '</a>' +
        '<button type="button" class="chat-close-btn" id="chatCloseBtn" aria-label="Close chat">&times;</button>' +
      '</div>' +
      '<div class="chat-body" id="chatBody"></div>' +
      '<div class="chat-quick-replies" id="chatQuickReplies"></div>' +
      '<form class="chat-input-row" id="chatInputForm">' +
        '<input type="text" id="chatInput" placeholder="Type a question…" autocomplete="off">' +
        '<button type="submit" aria-label="Send">➤</button>' +
      '</form>';
    wrap.appendChild(panel);

    document.body.appendChild(wrap);
    return wrap;
  }

  function addBubble(body, who, html){
    var row = el('div', 'chat-row ' + who);
    var bubble = el('div', 'chat-bubble', html);
    row.appendChild(bubble);
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
    return row;
  }

  function addTyping(body){
    var row = addBubble(body, 'bot', '<span class="chat-typing"><span></span><span></span><span></span></span>');
    row.classList.add('is-typing');
    return row;
  }

  function botSay(body, html, delay){
    return new Promise(function(resolve){
      var typingRow = addTyping(body);
      setTimeout(function(){
        typingRow.remove();
        addBubble(body, 'bot', html);
        resolve();
      }, delay || 650);
    });
  }

  function renderQuickReplies(container, body, onUsed){
    container.innerHTML = '';
    FAQ_DATA.slice(0, QUICK_REPLY_COUNT).forEach(function(item){
      var chip = el('button', 'chat-chip', item.q);
      chip.type = 'button';
      chip.addEventListener('click', function(){
        addBubble(body, 'user', item.q);
        botSay(body, item.a);
        onUsed();
      });
      container.appendChild(chip);
    });
    var more = el('button', 'chat-chip chat-chip-ghost', 'Something else…');
    more.type = 'button';
    more.addEventListener('click', function(){
      var input = document.getElementById('chatInput');
      if(input) input.focus();
    });
    container.appendChild(more);
  }

  function init(){
    var wrap = buildLauncher();
    var btn = document.getElementById('launcherBtn');
    var panel = document.getElementById('chatPanel');
    var body = document.getElementById('chatBody');
    var quickReplies = document.getElementById('chatQuickReplies');
    var closeBtn = document.getElementById('chatCloseBtn');
    var form = document.getElementById('chatInputForm');
    var input = document.getElementById('chatInput');

    var opened = false;
    var leadStep = 'idle'; // idle -> name -> phone -> email -> done
    var lead = {};

    function openPanel(){
      panel.hidden = false;
      wrap.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      if(!opened){
        opened = true;
        botSay(body, "Hi, I'm " + BOT_NAME + " 👋 I can answer common questions right away, or get Lindsay to reach out for anything specific. What would you like to know?", 450)
          .then(function(){ renderQuickReplies(quickReplies, body, function(){}); });
      }
      input.focus();
    }
    function closePanel(){
      panel.hidden = true;
      wrap.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', function(){
      if(panel.hidden){ openPanel(); } else { closePanel(); }
    });
    closeBtn.addEventListener('click', closePanel);

    function startLeadCapture(){
      leadStep = 'name';
      botSay(body, "I'll get Lindsay to help with that directly. What's your name?");
    }

    form.addEventListener('submit', function(evt){
      evt.preventDefault();
      var val = input.value.trim();
      if(!val) return;
      addBubble(body, 'user', val.replace(/</g, '&lt;'));
      input.value = '';

      if(leadStep === 'idle'){
        // TODO: send `val` to an LLM scoped to FAQ_DATA here. If it can
        // answer confidently, botSay() the answer and stop. If not (or
        // once that backend exists), fall through to lead capture below.
        startLeadCapture();
      } else if(leadStep === 'name'){
        lead.name = val;
        leadStep = 'phone';
        botSay(body, 'Thanks, ' + val.split(' ')[0] + '. And a phone number so she can reach you?');
      } else if(leadStep === 'phone'){
        lead.phone = val;
        leadStep = 'email';
        botSay(body, "Got it. Email address too, if you'd like a reply there as well? (You can type \"skip\")");
      } else if(leadStep === 'email'){
        lead.email = /^skip$/i.test(val) ? '' : val;
        leadStep = 'done';
        // TODO: POST { name, phone, email, transcript } to a Cloud Function
        // that emails Lindsay — not an automated WhatsApp message (see
        // notes at top of this file for why).
        botSay(body, "Thanks " + lead.name.split(' ')[0] + " — Lindsay will reach out shortly" + (lead.phone ? ' at ' + lead.phone : '') + ". You can also WhatsApp us directly any time using the button up top.");
      } else {
        botSay(body, "I've passed that along to Lindsay already — she'll be in touch shortly. Feel free to WhatsApp us directly too.");
      }
    });

    document.addEventListener('keydown', function(evt){
      if(evt.key === 'Escape' && !panel.hidden) closePanel();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

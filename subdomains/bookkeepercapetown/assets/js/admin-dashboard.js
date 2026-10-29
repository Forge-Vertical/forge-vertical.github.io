/*
 * Bookkeepers South Africa — staff dashboard (Phase A mock)
 * ----------------------------------------------------------------------
 * FRONTEND PREVIEW ONLY. Leads in admin-dashboard.html are placeholder
 * data — this file wires up visual interactions (mark contacted/closed,
 * the Lily chat panel, the mobile drawer toggles) so Lindsay can click
 * around and see how it feels. Nothing here talks to Firestore yet.
 *
 * TODO once Lindsay's own Firebase project exists:
 *   - Replace the hardcoded .lead-card markup with a Firestore-backed
 *     render loop (same shape as Lily's existing lead-capture fields:
 *     name, phone, email, request summary, timestamp).
 *   - Lily's replies here are canned; swap for a Cloud Function call
 *     that hits Gemini 3.8 Flash, scoped to this business's own GSC/GA
 *     data and lead history.
 */
(function(){
  var shell = document.querySelector('.admin-shell');
  var lilyToggle = document.getElementById('adminLilyToggle');
  var lilyCollapse = document.getElementById('adminLilyCollapse');
  var lilyBody = document.getElementById('adminLilyBody');
  var lilyForm = document.getElementById('adminLilyForm');
  var lilyInput = document.getElementById('adminLilyInput');

  if(lilyToggle){
    lilyToggle.addEventListener('click', function(){
      shell.classList.toggle('lily-open');
    });
  }
  if(lilyCollapse){
    lilyCollapse.addEventListener('click', function(){
      shell.classList.remove('lily-open');
    });
  }

  function addBubble(role, text){
    var row = document.createElement('div');
    row.className = 'lily-row ' + role;
    var bubble = document.createElement('div');
    bubble.className = 'lily-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);
    lilyBody.appendChild(row);
    lilyBody.scrollTop = lilyBody.scrollHeight;
  }

  // A tiny bank of canned replies so the panel feels alive in a demo —
  // not real reasoning, just enough to show the intended shape.
  var CANNED_REPLIES = [
    "Noted — once this is wired up I'll be pulling that straight from your GSC/GA data and the lead history here, so I can give you a real answer instead of this placeholder one.",
    "Good question. For now I'm just a mock-up on this screen, but that's exactly the kind of thing I'll be able to answer once I'm connected to the live data.",
    "I don't have that wired up yet in this preview — but that's the plan for Phase B, so you can just ask me instead of digging through reports yourself."
  ];
  var replyIndex = 0;

  if(lilyForm){
    lilyForm.addEventListener('submit', function(evt){
      evt.preventDefault();
      var val = lilyInput.value.trim();
      if(!val) return;
      addBubble('user', val);
      lilyInput.value = '';
      setTimeout(function(){
        addBubble('bot', CANNED_REPLIES[replyIndex % CANNED_REPLIES.length]);
        replyIndex++;
      }, 500);
    });
  }

  // Lead status actions — visual only for now.
  document.querySelectorAll('.lead-action').forEach(function(btn){
    btn.addEventListener('click', function(){
      if(btn.disabled) return;
      var card = btn.closest('.lead-card');
      var statusEl = card.querySelector('.lead-status');
      if(btn.textContent.trim() === 'Mark contacted'){
        statusEl.textContent = 'Contacted';
        statusEl.className = 'lead-status contacted';
        btn.textContent = 'Mark closed';
        card.classList.remove('is-new');
      } else if(btn.textContent.trim() === 'Mark closed'){
        statusEl.textContent = 'Closed';
        statusEl.className = 'lead-status closed';
        btn.textContent = 'Handled';
        btn.disabled = true;
      }
    });
  });

  // Lead temperature (Cold / Warm / Hot) — separate from status/stage,
  // just marks where the lead is at so Lindsay can prioritise follow-up.
  document.querySelectorAll('.lead-temp').forEach(function(group){
    group.querySelectorAll('button').forEach(function(btn){
      btn.addEventListener('click', function(){
        group.querySelectorAll('button').forEach(function(b){ b.classList.remove('is-active'); });
        btn.classList.add('is-active');
      });
    });
  });

  // Delete lead — visual only for now (no backend to delete from yet).
  document.querySelectorAll('.lead-delete').forEach(function(btn){
    btn.addEventListener('click', function(){
      var card = btn.closest('.lead-card');
      card.classList.add('is-removing');
      setTimeout(function(){ card.remove(); }, 200);
    });
  });

  // Support request modal — "Request support" in the sidebar. No backend
  // yet, so this opens a pre-filled email straight to Jarrit. Once the
  // real "shop" catalogue exists this can post to a proper request
  // tracker instead of mailto.
  var supportLink = document.getElementById('supportNavLink');
  var supportOverlay = document.getElementById('supportModalOverlay');
  var supportClose = document.getElementById('supportModalClose');
  var supportForm = document.getElementById('supportForm');
  var supportMessage = document.getElementById('supportMessage');
  var supportSuccess = document.getElementById('supportSuccess');
  var supportSuccessClose = document.getElementById('supportSuccessClose');

  function openSupport(){
    if(supportOverlay) supportOverlay.classList.add('open');
  }
  function closeSupport(){
    if(!supportOverlay) return;
    supportOverlay.classList.remove('open');
    if(supportSuccess) supportSuccess.classList.remove('show');
    if(supportForm) supportForm.reset();
  }

  if(supportLink){
    supportLink.addEventListener('click', function(e){
      e.preventDefault();
      openSupport();
    });
  }
  if(supportClose) supportClose.addEventListener('click', closeSupport);
  if(supportSuccessClose) supportSuccessClose.addEventListener('click', closeSupport);
  if(supportOverlay){
    supportOverlay.addEventListener('click', function(e){
      if(e.target === supportOverlay) closeSupport();
    });
  }
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && supportOverlay && supportOverlay.classList.contains('open')) closeSupport();
  });
  if(supportForm){
    supportForm.addEventListener('submit', function(evt){
      evt.preventDefault();
      var msg = supportMessage.value.trim();
      if(!msg) return;
      var subject = encodeURIComponent('Dashboard request — Bookkeepers SA');
      var body = encodeURIComponent(msg + '\n\n— Sent from Lindsay\'s dashboard');
      window.location.href = 'mailto:jarrit@forgevertical.com?subject=' + subject + '&body=' + body;
      if(supportSuccess) supportSuccess.classList.add('show');
    });
  }
})();

/*
 * Bookkeepers South Africa — cookie consent banner + preferences modal
 * ----------------------------------------------------------------------
 * Shared across every page. Shows the bottom banner once, on a visitor's
 * first visit to any page, then remembers their choice in localStorage.
 * The footer "Cookies" link (id="cookieSettingsLink" on every page)
 * reopens the preferences modal at any time to change the choice.
 *
 * Categories are generic placeholders ready for whatever's actually wired
 * up later (GA4, a Facebook/Meta pixel, etc.) — "Necessary" can't be
 * turned off, the rest default to off until the visitor opts in.
 *
 * Other scripts can check consent before loading anything that sets a
 * cookie, e.g.:
 *   if (window.cookieConsent && window.cookieConsent.get().analytics) { ... }
 * and react live to changes:
 *   document.addEventListener('cookieconsentchange', function(e){ ... });
 */
(function(){
  var STORAGE_KEY = 'bk_cookie_consent';

  var CATEGORIES = [
    {
      id: 'necessary',
      label: 'Necessary',
      locked: true,
      desc: 'Required for the site to work — things like remembering this cookie choice. Always on.'
    },
    {
      id: 'functional',
      label: 'Functional',
      locked: false,
      desc: 'Remembers choices you make on the site (like office/location filters) to make it work better for you.'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      locked: false,
      desc: 'Helps us understand how visitors use the site, so we can improve it. No data is sold.'
    },
    {
      id: 'marketing',
      label: 'Marketing',
      locked: false,
      desc: 'Used to measure the effectiveness of ads and show relevant content on other sites.'
    }
  ];

  function readConsent(){
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return null;
      var parsed = JSON.parse(raw);
      if(parsed && typeof parsed === 'object') return parsed;
    } catch(e){ /* ignore — storage unavailable or corrupt */ }
    return null;
  }

  function writeConsent(consent){
    consent.necessary = true;
    consent.ts = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(consent)); } catch(e){ /* ignore */ }
    document.dispatchEvent(new CustomEvent('cookieconsentchange', { detail: consent }));
    return consent;
  }

  function defaultConsent(allOn){
    var c = {};
    CATEGORIES.forEach(function(cat){ c[cat.id] = cat.locked ? true : !!allOn; });
    return c;
  }

  function el(tag, cls, html){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(html !== undefined) e.innerHTML = html;
    return e;
  }

  var banner, modal, modalToggles = {};

  function buildBanner(){
    banner = el('div', 'cookie-banner');
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie notice');
    banner.innerHTML =
      '<div class="cookie-banner-inner">' +
        '<p>We use cookies to run this site and, with your permission, to understand how it’s used. You can accept everything, decline anything non-essential, or choose exactly what’s allowed.</p>' +
        '<div class="cookie-banner-actions">' +
          '<button type="button" class="btn ghost sm" id="cookieManageBtn">Manage preferences</button>' +
          '<button type="button" class="btn ghost sm" id="cookieDeclineBtn">Decline</button>' +
          '<button type="button" class="btn sm" id="cookieAcceptBtn">Accept all</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    document.getElementById('cookieAcceptBtn').addEventListener('click', function(){
      writeConsent(defaultConsent(true));
      hideBanner();
    });
    document.getElementById('cookieDeclineBtn').addEventListener('click', function(){
      writeConsent(defaultConsent(false));
      hideBanner();
    });
    document.getElementById('cookieManageBtn').addEventListener('click', function(){
      openModal();
    });
  }

  function updateBannerHeightVar(){
    if(!banner) return;
    document.documentElement.style.setProperty('--cookie-banner-h', banner.offsetHeight + 'px');
  }

  function showBanner(){
    if(!banner) buildBanner();
    document.body.classList.add('cookie-banner-open');
    requestAnimationFrame(function(){
      banner.classList.add('is-visible');
      updateBannerHeightVar();
    });
    window.addEventListener('resize', updateBannerHeightVar);
  }

  function hideBanner(){
    if(banner) banner.classList.remove('is-visible');
    document.body.classList.remove('cookie-banner-open');
    window.removeEventListener('resize', updateBannerHeightVar);
  }

  function buildModal(){
    modal = el('div', 'cookie-modal-overlay');
    var rowsHtml = CATEGORIES.map(function(cat){
      var checkedAttr = cat.locked ? 'checked disabled' : '';
      return (
        '<div class="cookie-row">' +
          '<div class="cookie-row-text">' +
            '<strong>' + cat.label + (cat.locked ? ' <span class="cookie-row-tag">Always on</span>' : '') + '</strong>' +
            '<p>' + cat.desc + '</p>' +
          '</div>' +
          '<label class="cookie-switch">' +
            '<input type="checkbox" data-cat="' + cat.id + '" ' + checkedAttr + '>' +
            '<span class="cookie-switch-track"><span class="cookie-switch-thumb"></span></span>' +
          '</label>' +
        '</div>'
      );
    }).join('');

    modal.innerHTML =
      '<div class="cookie-modal" role="dialog" aria-modal="true" aria-label="Cookie preferences">' +
        '<button type="button" class="apply-modal-close" id="cookieModalClose" aria-label="Close">&times;</button>' +
        '<h3>Cookie preferences</h3>' +
        '<p class="apply-modal-sub">Choose what you’re comfortable with. Necessary cookies can’t be switched off since the site needs them to function.</p>' +
        '<div class="cookie-rows">' + rowsHtml + '</div>' +
        '<div class="cookie-modal-actions">' +
          '<button type="button" class="btn ghost sm" id="cookieModalDecline">Decline all</button>' +
          '<button type="button" class="btn ghost sm" id="cookieModalAccept">Accept all</button>' +
          '<button type="button" class="btn sm" id="cookieModalSave">Save preferences</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    Array.prototype.forEach.call(modal.querySelectorAll('input[data-cat]'), function(input){
      modalToggles[input.getAttribute('data-cat')] = input;
    });

    document.getElementById('cookieModalClose').addEventListener('click', closeModal);
    modal.addEventListener('click', function(e){ if(e.target === modal) closeModal(); });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

    document.getElementById('cookieModalAccept').addEventListener('click', function(){
      setToggles(defaultConsent(true));
    });
    document.getElementById('cookieModalDecline').addEventListener('click', function(){
      setToggles(defaultConsent(false));
    });
    document.getElementById('cookieModalSave').addEventListener('click', function(){
      var consent = {};
      CATEGORIES.forEach(function(cat){
        consent[cat.id] = cat.locked ? true : !!modalToggles[cat.id].checked;
      });
      writeConsent(consent);
      closeModal();
      hideBanner();
    });
  }

  function setToggles(consent){
    CATEGORIES.forEach(function(cat){
      if(!cat.locked && modalToggles[cat.id]) modalToggles[cat.id].checked = !!consent[cat.id];
    });
  }

  function openModal(){
    if(!modal) buildModal();
    var current = readConsent() || defaultConsent(false);
    setToggles(current);
    modal.classList.add('open');
  }

  function closeModal(){
    if(modal) modal.classList.remove('open');
  }

  // Public API for other scripts (and for future analytics/marketing snippets).
  window.cookieConsent = {
    get: function(){ return readConsent() || defaultConsent(false); },
    openPreferences: openModal
  };

  function init(){
    var existing = readConsent();
    if(!existing){
      // Small delay so it doesn't fight the page's own entrance animations.
      setTimeout(showBanner, 600);
    }

    var footerLink = document.getElementById('cookieSettingsLink');
    if(footerLink){
      footerLink.addEventListener('click', function(e){
        e.preventDefault();
        openModal();
      });
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/*
 * Bookkeepers South Africa — POPIA notice modal
 * ----------------------------------------------------------------------
 * Shared across every page. The footer "POPIA" link (id="popiaLink")
 * opens a short, plain-language notice covering the basics: what the
 * website itself collects (Google Analytics + Search Console), the
 * software client data is processed in (SageOne, Xero), and who can
 * access it (Bookkeepers South Africa staff, on-site computers only).
 * Lindsay can ask for more detail to be added later — this covers the
 * essentials for now. No terms & conditions page exists, by design.
 */
(function(){
  var modal, built = false;

  function el(tag, cls, html){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(html !== undefined) e.innerHTML = html;
    return e;
  }

  function build(){
    modal = el('div', 'popia-modal-overlay');
    modal.innerHTML =
      '<div class="popia-modal" role="dialog" aria-modal="true" aria-label="POPIA notice">' +
        '<button type="button" class="popia-modal-close" id="popiaModalClose" aria-label="Close">&times;</button>' +
        '<h3>How we handle your information</h3>' +
        '<p class="popia-modal-sub">In line with South Africa\'s Protection of Personal Information Act (POPIA), here\'s a plain-language summary of what we collect and how client information is kept secure.</p>' +
        '<div class="popia-body">' +
          '<h4>On this website</h4>' +
          '<p>We use Google Analytics and Google Search Console to understand how visitors use this site — pages viewed, general location and device type. This is aggregated usage data, used to improve the site, and is never sold.</p>' +
          '<h4>Client bookkeeping data</h4>' +
          '<p>Client financial records are processed using SageOne and Xero, both encrypted, access-controlled accounting platforms built for this purpose.</p>' +
          '<h4>Who can access it</h4>' +
          '<ul>' +
            '<li>Client records are only accessible from Bookkeepers South Africa\'s own office computers.</li>' +
            '<li>Access is restricted to authorised Bookkeepers South Africa staff only.</li>' +
          '</ul>' +
          '<h4>Questions or requests</h4>' +
          '<p>To access, correct or request deletion of your personal information, contact <a href="mailto:info@bookkeepersincapetown.co.za">info@bookkeepersincapetown.co.za</a>.</p>' +
        '</div>' +
        '<div class="popia-modal-actions"><button type="button" class="btn sm" id="popiaModalOk">Got it</button></div>' +
      '</div>';
    document.body.appendChild(modal);

    document.getElementById('popiaModalClose').addEventListener('click', close);
    document.getElementById('popiaModalOk').addEventListener('click', close);
    modal.addEventListener('click', function(e){ if(e.target === modal) close(); });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && modal.classList.contains('open')) close();
    });
    built = true;
  }

  function open(){
    if(!built) build();
    modal.classList.add('open');
  }
  function close(){
    if(modal) modal.classList.remove('open');
  }

  function init(){
    var link = document.getElementById('popiaLink');
    if(!link) return;
    link.addEventListener('click', function(e){
      e.preventDefault();
      open();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

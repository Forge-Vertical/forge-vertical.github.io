// Mobile hamburger menu — shared across every page.
// Toggles a slide-down panel for the primary nav so links never just
// vanish under 980px; the header CTA ("Book a consultation") and the
// sticky mobile CTA bar stay as backup actions the whole time.
(function(){
  var header = document.querySelector('.site-header');
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');
  if(!header || !toggle || !nav) return;

  function isOpen(){ return header.classList.contains('nav-open'); }

  function openNav(){
    header.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeNav(){
    header.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function(){
    if(isOpen()){ closeNav(); } else { openNav(); }
  });

  // Collapse the menu once a link is actually used.
  Array.prototype.forEach.call(nav.querySelectorAll('a'), function(a){
    a.addEventListener('click', function(){ closeNav(); });
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && isOpen()) closeNav();
  });

  // Don't leave it open if the viewport grows back past the breakpoint.
  window.addEventListener('resize', function(){
    if(window.innerWidth > 980 && isOpen()) closeNav();
  });

  // Tap outside the header to dismiss.
  document.addEventListener('click', function(e){
    if(isOpen() && !header.contains(e.target)) closeNav();
  });
})();

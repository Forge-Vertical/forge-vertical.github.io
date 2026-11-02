/* ============================================================
   DIGI ADS MEDIA GROUP — global.js
   1. Loads nav.html / footer.html (or any partial) into every page
      via <div data-include="partials/nav.html"></div>
   2. Wires up the mobile nav toggle once the nav is loaded.

   To add a new page (e.g. about.html):
     - copy index.html
     - keep the two data-include divs and the <script src="js/global.js">
     - swap out only the <main> content
   The nav and footer will automatically match every other page.
   ============================================================ */

async function loadIncludes() {
  const includeNodes = document.querySelectorAll('[data-include]');

  await Promise.all(
    Array.from(includeNodes).map(async (node) => {
      const path = node.getAttribute('data-include');
      try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`${path} returned ${res.status}`);
        node.innerHTML = await res.text();
      } catch (err) {
        console.error('[global.js] Failed to load partial:', path, err);
        node.innerHTML = `<!-- failed to load ${path} -->`;
      }
    })
  );

  document.dispatchEvent(new Event('includes:loaded'));
}

function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close the menu after tapping a link (mobile)
  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

document.addEventListener('DOMContentLoaded', loadIncludes);
document.addEventListener('includes:loaded', initNavToggle);

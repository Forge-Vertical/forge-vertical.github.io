/**
 * FORGE VERTICAL - GLOBAL UI CONTROLLER
 */

// 1. Mobile Menu Toggle Logic
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const bar1 = document.getElementById('bar-1');
    const bar2 = document.getElementById('bar-2');
    const bar3 = document.getElementById('bar-3');

    if (!menu) return;

    menu.classList.toggle('translate-x-full');

    // Hamburger to X animation
    if (!menu.classList.contains('translate-x-full')) {
        bar1.style.transform = 'translateY(10px) rotate(45deg)';
        bar2.style.opacity = '0';
        bar3.style.transform = 'translateY(-10px) rotate(-45deg)';
    } else {
        bar1.style.transform = 'none';
        bar2.style.opacity = '1';
        bar3.style.transform = 'none';
    }
}

// 2. Build Modal Logic
function showBuildModal() {
    alert("Industrial-Grade Build Tool: We are currently finalizing the 'Build Your Own' sandbox for public beta. Sign up for our newsletter or contact us directly for early access.");
}

// 3. Component Injection Logic
async function injectGlobals() {
    try {
        const navPlaceholder = document.getElementById('global-nav');
        const footerPlaceholder = document.getElementById('global-footer');

        if (navPlaceholder) {
            const nav = await fetch('/nav.html');
            if (nav.ok) navPlaceholder.innerHTML = await nav.text();
        }

        if (footerPlaceholder) {
            const footer = await fetch('/footer.html');
            if (footer.ok) footerPlaceholder.innerHTML = await footer.text();
        }
    } catch (e) {
        console.error("Global Component Injection Failed:", e);
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', injectGlobals);

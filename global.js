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
    alert("Industrial-Grade Build Tool: We are currently finalizing the 'Build Your Own' sandbox for public beta.");
}

// 3. Load Firebase SDK dynamically then initialise auth modal
function loadFirebaseAndAuth() {
    if (window._fvFirebaseInit) {
        initAuthModal();
        return;
    }

    const sdkBase = 'https://www.gstatic.com/firebasejs/9.23.0/';

    function loadScript(src, cb) {
        const s = document.createElement('script');
        s.src = src;
        s.onload = cb;
        document.head.appendChild(s);
    }

    loadScript(sdkBase + 'firebase-app-compat.js', function() {
        loadScript(sdkBase + 'firebase-auth-compat.js', function() {
            if (!window._fvFirebaseInit) {
                window._fvFirebaseInit = true;
                firebase.initializeApp({
                    apiKey:            "AIzaSyBTilhnShlJ5SyOeBOOrlLalDPjtNs2TJs",
                    authDomain:        "forge-vertical.firebaseapp.com",
                    projectId:         "forge-vertical",
                    storageBucket:     "forge-vertical.firebasestorage.app",
                    messagingSenderId: "868451682331",
                    appId:             "1:868451682331:web:28c7bda02648624b7cd0be",
                    measurementId:     "G-ZVXJ25BS8Z"
                });
            }
            initAuthModal();
        });
    });
}

// 4. Auth Modal — inline so it is always available
/**
 * FORGE VERTICAL — AUTH MODAL
 * Drop-in Firebase Auth modal for the static marketing site.
 * Works on any page that loads global.js.
 * 
 * Requires Firebase SDK loaded before this script.
 * Handles: Login · Create Account · Forgot Password
 */

(function() {

  // ── Firebase config (already initialised in global.js or inline) ──
  // This module assumes firebase/auth is already available.
  // If not yet initialised, it will self-init using the project config.

  const PORTAL_URL = 'https://portal.forgevertical.com';

  // ── Inject modal HTML ──────────────────────────────────────────────
  function injectModal() {
    if (document.getElementById('fv-auth-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'fv-auth-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'fv-modal-title');
    modal.innerHTML = `
<style>
#fv-auth-modal{
  position:fixed;inset:0;z-index:9999;
  display:flex;align-items:center;justify-content:center;
  background:rgba(6,8,12,0.85);backdrop-filter:blur(4px);
  opacity:0;pointer-events:none;transition:opacity 0.2s;
}
#fv-auth-modal.open{opacity:1;pointer-events:all;}
#fv-auth-box{
  background:#0b0f14;border:1px solid #1c2638;border-radius:20px;
  padding:40px 36px;width:100%;max-width:420px;margin:16px;
  position:relative;
  box-shadow:0 24px 64px rgba(0,0,0,0.6);
}
#fv-auth-close{
  position:absolute;top:16px;right:16px;
  background:none;border:none;color:#3a4d66;cursor:pointer;
  font-size:20px;line-height:1;padding:4px 8px;border-radius:6px;
  transition:color 0.15s;
}
#fv-auth-close:hover{color:#eef0f4;}
.fv-auth-logo{
  font-family:'JetBrains Mono',monospace;
  font-size:13px;font-weight:700;color:#84cc16;
  letter-spacing:0.1em;margin-bottom:24px;display:block;
}
#fv-modal-title{
  font-family:'Outfit',sans-serif;
  font-size:22px;font-weight:800;color:#eef0f4;
  letter-spacing:-0.02em;margin-bottom:6px;
}
.fv-modal-sub{
  font-size:14px;color:#5c7494;margin-bottom:28px;line-height:1.6;
}
.fv-field{margin-bottom:16px;}
.fv-label{
  font-family:'JetBrains Mono',monospace;
  font-size:10px;font-weight:700;text-transform:uppercase;
  letter-spacing:0.12em;color:#3a4d66;
  display:block;margin-bottom:8px;
}
.fv-input{
  width:100%;background:rgba(255,255,255,0.03);
  border:1px solid #1c2638;border-radius:8px;
  padding:12px 16px;color:#eef0f4;
  font-family:'Outfit',sans-serif;font-size:14px;
  outline:none;transition:border-color 0.2s;box-sizing:border-box;
}
.fv-input:focus{border-color:#84cc16;}
.fv-input::placeholder{color:#3a4d66;}
.fv-btn-primary{
  width:100%;background:linear-gradient(90deg,#10b981,#84cc16);
  color:#06080c;padding:14px;border-radius:10px;
  font-family:'JetBrains Mono',monospace;font-size:11px;
  font-weight:700;text-transform:uppercase;letter-spacing:0.14em;
  border:none;cursor:pointer;transition:opacity 0.15s;margin-top:4px;
}
.fv-btn-primary:hover{opacity:0.88;}
.fv-btn-primary:disabled{opacity:0.5;cursor:not-allowed;}
.fv-error{
  font-size:12px;color:#ef4444;margin-top:8px;
  min-height:18px;line-height:1.5;
}
.fv-success{
  font-size:12px;color:#84cc16;margin-top:8px;
  min-height:18px;line-height:1.5;
}
.fv-switch{
  text-align:center;margin-top:20px;
  font-size:13px;color:#5c7494;
}
.fv-switch a{
  color:#84cc16;text-decoration:none;cursor:pointer;font-weight:600;
}
.fv-switch a:hover{text-decoration:underline;}
.fv-divider{
  display:flex;align-items:center;gap:12px;margin:20px 0;
}
.fv-divider span{font-size:12px;color:#3a4d66;white-space:nowrap;}
.fv-divider::before,.fv-divider::after{
  content:'';flex:1;height:1px;background:#1c2638;
}
.fv-btn-google{
  width:100%;display:flex;align-items:center;justify-content:center;gap:10px;
  background:#fff;color:#3c4043;border:1px solid #dadce0;
  padding:11px 16px;border-radius:10px;cursor:pointer;
  font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;
  transition:box-shadow 0.15s;margin-top:0;
}
.fv-btn-google:hover{box-shadow:0 1px 6px rgba(0,0,0,0.2);}
.fv-view{display:none;}
.fv-view.active{display:block;}
</style>

<div id="fv-auth-box">
  <button id="fv-auth-close" aria-label="Close">&times;</button>
  <span class="fv-auth-logo">// Forge Vertical</span>

  <!-- LOGIN VIEW -->
  <div class="fv-view active" id="fv-view-login">
    <div id="fv-modal-title">Welcome back.</div>
    <div class="fv-modal-sub">Log in to your client portal.</div>
    <div class="fv-field">
      <label class="fv-label" for="fv-login-email">Email</label>
      <input class="fv-input" type="email" id="fv-login-email" placeholder="you@company.com" autocomplete="email">
    </div>
    <div class="fv-field">
      <label class="fv-label" for="fv-login-pass">Password</label>
      <input class="fv-input" type="password" id="fv-login-pass" placeholder="••••••••" autocomplete="current-password">
    </div>
    <div class="fv-error" id="fv-login-error"></div>
    <button class="fv-btn-primary" id="fv-login-btn">Log in →</button>
    <div class="fv-switch">
      <a onclick="fvShowView('forgot')">Forgot password?</a>
      &nbsp;·&nbsp;
      No account? <a onclick="fvShowView('signup')">Create one</a>
    </div>
    <div class="fv-divider"><span>or</span></div>
    <button class="fv-btn-google" onclick="handleGoogle()">
      <svg width="16" height="16" viewBox="0 0 48 48" style="flex-shrink:0"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
      Continue with Google
    </button>
  </div>

  <!-- SIGNUP VIEW -->
  <div class="fv-view" id="fv-view-signup">
    <div id="fv-modal-title">Create account.</div>
    <div class="fv-modal-sub">Access your Forge Vertical client portal.</div>
    <div class="fv-field">
      <label class="fv-label" for="fv-signup-name">Full name</label>
      <input class="fv-input" type="text" id="fv-signup-name" placeholder="Jane Smith" autocomplete="name">
    </div>
    <div class="fv-field">
      <label class="fv-label" for="fv-signup-email">Email</label>
      <input class="fv-input" type="email" id="fv-signup-email" placeholder="you@company.com" autocomplete="email">
    </div>
    <div class="fv-field">
      <label class="fv-label" for="fv-signup-pass">Password</label>
      <input class="fv-input" type="password" id="fv-signup-pass" placeholder="Min 8 characters" autocomplete="new-password">
    </div>
    <div class="fv-error" id="fv-signup-error"></div>
    <button class="fv-btn-primary" id="fv-signup-btn">Create account →</button>
    <div class="fv-switch">
      Already have an account? <a onclick="fvShowView('login')">Log in</a>
    </div>
    <div class="fv-divider"><span>or</span></div>
    <button class="fv-btn-google" onclick="handleGoogle()">
      <svg width="16" height="16" viewBox="0 0 48 48" style="flex-shrink:0"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
      Continue with Google
    </button>
  </div>

  <!-- FORGOT PASSWORD VIEW -->
  <div class="fv-view" id="fv-view-forgot">
    <div id="fv-modal-title">Reset password.</div>
    <div class="fv-modal-sub">Enter your email and we will send a reset link.</div>
    <div class="fv-field">
      <label class="fv-label" for="fv-forgot-email">Email</label>
      <input class="fv-input" type="email" id="fv-forgot-email" placeholder="you@company.com" autocomplete="email">
    </div>
    <div class="fv-error" id="fv-forgot-error"></div>
    <div class="fv-success" id="fv-forgot-success"></div>
    <button class="fv-btn-primary" id="fv-forgot-btn">Send reset link →</button>
    <div class="fv-switch">
      <a onclick="fvShowView('login')">← Back to login</a>
    </div>
  </div>

</div>`;

    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', function(e) {
      if (e.target === modal) fvCloseModal();
    });

    // Close button
    document.getElementById('fv-auth-close').addEventListener('click', fvCloseModal);

    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') fvCloseModal();
    });

    // Wire up buttons
    document.getElementById('fv-login-btn').addEventListener('click', handleLogin);
    document.getElementById('fv-signup-btn').addEventListener('click', handleSignup);
    document.getElementById('fv-forgot-btn').addEventListener('click', handleForgot);

    // Enter key support
    ['fv-login-email','fv-login-pass'].forEach(id => {
      document.getElementById(id).addEventListener('keydown', e => {
        if (e.key === 'Enter') handleLogin();
      });
    });
    ['fv-signup-name','fv-signup-email','fv-signup-pass'].forEach(id => {
      document.getElementById(id).addEventListener('keydown', e => {
        if (e.key === 'Enter') handleSignup();
      });
    });
    document.getElementById('fv-forgot-email').addEventListener('keydown', e => {
      if (e.key === 'Enter') handleForgot();
    });
  }

  // ── View switching ─────────────────────────────────────────────────
  window.fvShowView = function(view) {
    document.querySelectorAll('.fv-view').forEach(v => v.classList.remove('active'));
    document.getElementById('fv-view-' + view).classList.add('active');
    clearErrors();
  };

  function clearErrors() {
    ['fv-login-error','fv-signup-error','fv-forgot-error','fv-forgot-success'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
  }

  // ── Open / close ───────────────────────────────────────────────────
  window.fvOpenModal = function(view) {
    injectModal();
    fvShowView(view || 'login');
    const modal = document.getElementById('fv-auth-modal');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const first = document.querySelector('#fv-view-' + (view || 'login') + ' .fv-input');
      if (first) first.focus();
    }, 100);
  };

  function fvCloseModal() {
    const modal = document.getElementById('fv-auth-modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── Firebase Auth handlers ─────────────────────────────────────────
  function getAuth() {
    if (window.firebase && window.firebase.auth) return window.firebase.auth();
    return null;
  }

  function handleGoogle() {
    const auth = getAuth();
    if (!auth) return;
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(() => {
        fvCloseModal();
        window.location.href = PORTAL_URL;
      })
      .catch(e => {
        const err = document.querySelector('.fv-view.active .fv-error');
        if (err) err.textContent = friendlyError(e.code);
      });
  }

  function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? 'Please wait...' : btn.dataset.label || btn.textContent;
  }

  function handleLogin() {
    const email = document.getElementById('fv-login-email').value.trim();
    const pass  = document.getElementById('fv-login-pass').value;
    const err   = document.getElementById('fv-login-error');

    if (!email || !pass) { err.textContent = 'Please enter your email and password.'; return; }

    const auth = getAuth();
    if (!auth) { err.textContent = 'Auth not ready — please try again.'; return; }

    setLoading('fv-login-btn', true);
    auth.signInWithEmailAndPassword(email, pass)
      .then(() => {
        fvCloseModal();
        window.location.href = PORTAL_URL;
      })
      .catch(e => {
        err.textContent = friendlyError(e.code);
        setLoading('fv-login-btn', false);
      });
  }

  function handleSignup() {
    const name  = document.getElementById('fv-signup-name').value.trim();
    const email = document.getElementById('fv-signup-email').value.trim();
    const pass  = document.getElementById('fv-signup-pass').value;
    const err   = document.getElementById('fv-signup-error');

    if (!name)            { err.textContent = 'Please enter your full name.'; return; }
    if (!email)           { err.textContent = 'Please enter your email.'; return; }
    if (pass.length < 8)  { err.textContent = 'Password must be at least 8 characters.'; return; }

    const auth = getAuth();
    if (!auth) { err.textContent = 'Auth not ready — please try again.'; return; }

    setLoading('fv-signup-btn', true);
    auth.createUserWithEmailAndPassword(email, pass)
      .then(cred => cred.user.updateProfile({ displayName: name }))
      .then(() => {
        // New accounts need admin approval before portal access
        // Show a pending message instead of redirecting
        fvShowView('login');
        document.getElementById('fv-login-error').style.color = '#84cc16';
        document.getElementById('fv-login-error').textContent =
          'Account created. Jarrit will activate your portal access within 24 hours.';
      })
      .catch(e => {
        err.textContent = friendlyError(e.code);
        setLoading('fv-signup-btn', false);
      });
  }

  function handleForgot() {
    const email   = document.getElementById('fv-forgot-email').value.trim();
    const err     = document.getElementById('fv-forgot-error');
    const success = document.getElementById('fv-forgot-success');

    if (!email) { err.textContent = 'Please enter your email address.'; return; }

    const auth = getAuth();
    if (!auth) { err.textContent = 'Auth not ready — please try again.'; return; }

    setLoading('fv-forgot-btn', true);
    auth.sendPasswordResetEmail(email)
      .then(() => {
        success.textContent = 'Reset link sent. Check your inbox.';
        err.textContent = '';
        setLoading('fv-forgot-btn', false);
      })
      .catch(e => {
        err.textContent = friendlyError(e.code);
        setLoading('fv-forgot-btn', false);
      });
  }

  // ── Friendly error messages ────────────────────────────────────────
  function friendlyError(code) {
    const map = {
      'auth/user-not-found':       'No account found with that email.',
      'auth/wrong-password':       'Incorrect password. Try again.',
      'auth/email-already-in-use': 'That email is already registered. Log in instead.',
      'auth/weak-password':        'Password must be at least 8 characters.',
      'auth/invalid-email':        'Please enter a valid email address.',
      'auth/too-many-requests':    'Too many attempts. Try again in a few minutes.',
      'auth/network-request-failed': 'Network error. Check your connection.',
      'auth/invalid-credential':   'Incorrect email or password.',
    };
    return map[code] || 'Something went wrong. Please try again.';
  }

  // ── Auto-check auth state on load ─────────────────────────────────
  // If already logged in, update the nav login button to show name
  document.addEventListener('DOMContentLoaded', function() {
    const auth = getAuth();
    if (!auth) return;
    auth.onAuthStateChanged(function(user) {
      const loginBtn = document.getElementById('fv-nav-login-btn');
      if (!loginBtn) return;
      if (user) {
        const name = user.displayName ? user.displayName.split(' ')[0] : 'Portal';
        loginBtn.textContent = name + ' →';
        loginBtn.onclick = () => window.location.href = PORTAL_URL;
      } else {
        loginBtn.textContent = 'Login';
        loginBtn.onclick = () => fvOpenModal('login');
      }
    });
  });

})();


// 5. Component Injection Logic
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
    // Load Firebase + auth modal AFTER nav is injected
    loadFirebaseAndAuth();
}

// Initialize on load
window.addEventListener('DOMContentLoaded', injectGlobals);// cache-bust: 1790931533

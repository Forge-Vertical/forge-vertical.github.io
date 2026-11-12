/* In-Touch Schools preview. Sample data only. No network calls, no storage. */
(function () {
  'use strict';

  /* ---------- icons (custom SVG, stroke style) ---------- */
  var ICONS = {
    logo: '<circle cx="8" cy="12" r="4"/><circle cx="17" cy="8" r="3"/><path d="M11.6 10.4l2.9-1.4M11.4 13.4l3.6 3.4"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    home: '<path d="M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6"/>',
    school: '<path d="M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4.5 2 4.5 5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
    book: '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19V5"/><path d="M9 7h6M9 11h6"/>',
    megaphone: '<path d="M3 11v3l3 .5 8 4V6.5L6 10.5z"/><path d="M18 9a4 4 0 010 6M6 14.5l1 4h3"/>',
    bell: '<path d="M6 16v-5a6 6 0 1112 0v5l2 2H4z"/><path d="M10 20a2 2 0 004 0"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
    chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-3"/>',
    check: '<path d="M5 12l4 4 10-10"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    sync: '<path d="M20 11a8 8 0 00-14-4L4 9"/><path d="M4 5v4h4"/><path d="M4 13a8 8 0 0014 4l2-2"/><path d="M20 19v-4h-4"/>',
    file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>'
  };
  function icon(n, c) { return '<svg class="i ' + (c || '') + '" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }
  function mountSprite() {
    var s = '<svg xmlns="http://www.w3.org/2000/svg">';
    Object.keys(ICONS).forEach(function (k) { s += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + ICONS[k] + '</symbol>'; });
    document.getElementById('sprite').innerHTML = s + '</svg>';
  }

  /* ---------- sample data ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rnd(seed) { var x = Math.sin(seed) * 10000; return x - Math.floor(x); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function stamp() { var d = new Date(); return 'Today ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }

  var LEARNERS = [
    { id: 1, n: 'Amara Dlamini' }, { id: 2, n: 'Liam van Wyk' }, { id: 3, n: 'Naledi Mokoena' }, { id: 4, n: 'Ethan Adams' },
    { id: 5, n: 'Zanele Khumalo' }, { id: 6, n: 'Ruan Botha' }, { id: 7, n: 'Thabo Mahlangu' }, { id: 8, n: 'Aisha Patel' }
  ];
  var SUBJECTS = ['Mathematics', 'English Home Language', 'Natural Sciences'];
  var ASSESS = [{ n: 'Test 1', max: 50, w: 20 }, { n: 'Assignment', max: 30, w: 20 }, { n: 'Test 2', max: 50, w: 20 }, { n: 'Exam', max: 100, w: 40 }];

  function genMarks(offset) {
    var m = {};
    SUBJECTS.forEach(function (s, si) {
      m[s] = {};
      LEARNERS.forEach(function (l) {
        m[s][l.id] = ASSESS.map(function (a, ai) {
          if (a.n === 'Exam') return null;
          return Math.round(a.max * (0.42 + 0.5 * rnd(l.id * 7 + si * 13 + ai * 5 + offset)));
        });
      });
    });
    return m;
  }

  var S = {
    role: 'owner', view: 'overview', subject: 'Mathematics', child: 0, locked: false, ussd: null,
    marks: genMarks(1), noahMarks: genMarks(40),
    flags: {}, pending: [],
    schools: [
      { n: 'Sample Primary School', prov: 'Western Cape', learners: 412, staff: 26, ver: '25.4.0', sync: 'Today 06:12', status: 'certified' },
      { n: 'Demo High School', prov: 'Gauteng', learners: 860, staff: 51, ver: '25.4.0', sync: 'Today 05:48', status: 'certified' },
      { n: 'Pilot School Three', prov: 'KwaZulu-Natal', learners: 238, staff: 17, ver: '25.3.1', sync: 'Yesterday 17:30', status: 'testing' }
    ],
    anns: [
      { t: 'Term 2 sports day', b: 'Sports day is on Friday from 09:00 at the main field. Learners come in house colours. Parents are welcome from 10:00.', a: 'school', by: 'Principal', when: 'Tue 09:05' },
      { t: 'Grade 6A: science project due', b: 'The natural sciences project is due on Monday. Please check the rubric in the class notes.', a: '6A', by: 'Ms Peters', when: 'Mon 14:10' },
      { t: 'Moderation meeting', b: 'Staff moderation meeting on Thursday at 14:30 in the staffroom. Bring Term 2 samples.', a: 'staff', by: 'Principal', when: 'Mon 08:30' },
      { t: 'Grade 3B: reading week', b: 'Reading week starts Monday. Learners should bring a favourite book from home.', a: '3B', by: 'Mrs Naidoo', when: 'Fri 12:00' }
    ],
    audit: [
      { t: 'Today 06:12', who: 'Connector, Sample Primary', act: 'Sync completed', d: '412 learners, 26 staff, marks updated' },
      { t: 'Yesterday 16:40', who: 'Ms Peters', act: 'Mark captured', d: 'Mathematics, Test 2, Amara D.: entered' },
      { t: 'Yesterday 09:05', who: 'Principal', act: 'Announcement sent', d: 'Term 2 sports day, whole school' },
      { t: 'Mon 14:22', who: 'Platform Owner', act: 'School added', d: 'Pilot School Three' }
    ]
  };
  var AUD = { school: { l: 'Whole school', n: 398 }, '6A': { l: 'Grade 6A parents', n: 31 }, '3B': { l: 'Grade 3B parents', n: 29 }, staff: { l: 'Staff only', n: 26 } };
  var KIDS = [{ n: 'Amara Dlamini', g: 'Grade 6A', cls: '6A' }, { n: 'Noah Dlamini', g: 'Grade 3B', cls: '3B' }];

  var ROLES = {
    owner: { label: 'Platform Owner', who: 'Sifiso M.', sub: 'All schools', nav: [['overview', 'Overview', 'grid'], ['schools', 'Schools', 'school'], ['connector', 'SA-SAMS connector', 'link'], ['impact', 'Pilot impact', 'chart'], ['audit', 'Audit trail', 'shield']] },
    principal: { label: 'Principal', who: 'Principal', sub: 'Sample Primary School', nav: [['overview', 'Overview', 'grid'], ['marks', 'Marks and term lock', 'lock'], ['announce', 'Announcements', 'megaphone'], ['people', 'People and roles', 'users']] },
    teacher: { label: 'Teacher', who: 'Ms Peters', sub: 'Grade 6A', nav: [['overview', 'My day', 'grid'], ['markbook', 'Mark book', 'book'], ['announce', 'Announcements', 'megaphone']] },
    parent: { label: 'Parent', who: 'Parent account', sub: 'Sees own children only', nav: [['home', 'Home', 'home'], ['marks', 'Marks', 'book'], ['announce', 'Announcements', 'megaphone'], ['privacy', 'Who can see what', 'shield']] },
    ussd: { label: 'USSD', who: 'Any handset', sub: 'No data needed', nav: [['phone', 'Phone simulator', 'phone']] }
  };

  /* ---------- "how it works when live" copy ---------- */
  var INFO = {
    sync: { ic: 'sync', tag: 'SA-SAMS connector', t: 'How the SA-SAMS sync works when live',
      p: 'The sync is simulated in this preview. Once the connector is installed at a school, this is what happens.',
      steps: ['The school admin installs the connector on the computer that runs SA-SAMS and pairs it with a one-time code.', 'On a schedule, it reads that school’s SA-SAMS export and sends only the fields the platform needs. It only ever connects outward.', 'Everything lands in an intake area first and is checked. Anything unusual is held back and flagged instead of overwriting good data.', 'Learners, classes and marks appear in that school’s own sealed space, and the “last synced” time updates.'],
      box: 'Forge Vertical does not need learner data to build or test this. Only the layout of an export (folder and file names, types and sizes) is needed.' },
    release: { ic: 'shield', tag: 'Release assurance', t: 'Staying safe when SA-SAMS releases a new version',
      p: 'SA-SAMS is updated several times a year, and the same version number has been re-issued with different files before. So releases are tracked by name, size, date and fingerprint, not by version number alone.',
      steps: ['A new or changed release is detected the same day it appears.', 'It is installed in a test environment with a dummy school and compared to the last certified version.', 'If the layout changed, the connector mapping is updated and tested, then checked by a person before it is certified.', 'You are told twice: when a release is detected, and when it is certified.'],
      box: 'Schools keep applying Department patches as normal. The connector keeps running on the last certified version until the new one is certified.' },
    pairing: { ic: 'link', tag: 'Connector', t: 'Pairing a school to the platform',
      p: 'Each school computer is paired to exactly one school.',
      steps: ['The principal signs off in writing, then the connector is installed with a one-time pairing code.', 'A unique key is created for that school. The platform keeps only a fingerprint of it, never the key itself.', 'At install, the school admin accepts the licence, terms of use and privacy notice. Who accepted, when and which version is recorded permanently.', 'If a computer dies, a replacement install revokes the old key. A key can also be revoked at any time.'],
      box: 'Each connector checks in with a school name, versions and a timestamp. It never reports learner, parent or staff information.' },
    access: { ic: 'eye', tag: 'Data access', t: 'Who can see what',
      p: 'Access is the core design, not a setting added at the end.',
      steps: ['A parent sees only their own children: marks, announcements and messages.', 'A teacher sees only the classes they teach.', 'A principal sees their whole school and nothing from any other school.', 'The Platform Owner sees school set-up, billing and usage, not learner content, by default.'],
      box: 'These rules are enforced on the server, not by hiding buttons. Every access is recorded, so a school can answer: who looked at this record, and when?' },
    marks: { ic: 'lock', tag: 'Tamper-evident marks', t: 'How marks are protected',
      p: 'Try it: as Principal, lock the term, then as Teacher try to change a mark.',
      steps: ['Every change by staff is recorded: who, when, the old value and the new value.', 'The principal locks a term when marks are final.', 'After the lock, a change needs a request with a reason, and the principal’s approval. Approved changes are flagged.', 'Learner and parent accounts have no way to change a mark at all. Unusual patterns raise an alert.'],
      box: 'The change history is permanent. Nobody, including staff, can edit it.' },
    notify: { ic: 'megaphone', tag: 'Announcements', t: 'How announcements and notifications work',
      p: 'Messages go only to the audience chosen.',
      steps: ['Principals send to the whole school, teachers to their own classes.', 'Parents get them in the app and by email, each only for their own child’s school and class.', 'Staff-only messages never reach parents.', 'Read receipts, push notifications and SMS are planned for a later stage.'],
      box: 'SMS is the one channel with a per-message cost, so it is opt-in.' },
    ussd: { ic: 'phone', tag: 'USSD', t: 'How USSD works when live',
      p: 'A parent without data or a smartphone dials a short code from any handset.',
      steps: ['The parent dials the school’s code. The gateway passes the request to the platform.', 'The menu reads marks and announcements for that parent’s own children only.', 'The live short code is connected through a licensed gateway provider at go-live. Here it runs on a simulator.', 'Who pays for the session (parent, school, or zero-rated) is a decision made before go-live.'],
      box: 'The sample code on the phone is not a real number.' },
    onboarding: { ic: 'school', tag: 'Schools', t: 'What happens when a school is added',
      p: 'The school is added to this preview list only. When live:',
      steps: ['A sealed space is created for the school. Nothing crosses into any other school.', 'The principal gets an invitation and sets up with two-step verification.', 'Staff and classes are added, or come in through the SA-SAMS sync.', 'The connector is installed and paired, with the principal’s written sign-off recorded.'],
      box: 'Nothing leaves this browser tab in the preview.' },
    people: { ic: 'users', tag: 'People', t: 'Adding staff and parents',
      p: 'In this preview nothing is sent. When live:',
      steps: ['The principal invites a person by email and picks a role.', 'They set a password and two-step verification (required for staff).', 'The role decides exactly what they can open. Teachers are tied to their classes.', 'Parents are linked to their own children, from the school record.'],
      box: 'Every sign-in and change is recorded in the audit trail.' },
    impact: { ic: 'chart', tag: 'Optional extra', t: 'The pilot impact dashboard',
      p: 'This is the optional dashboard that gives funders and schools the numbers.',
      steps: ['It counts logins, announcement reach and USSD sessions per school.', 'It shows each school and all pilot schools together.', 'It exports the figures for funders and investors.'],
      box: 'The figures on this page are sample numbers.' },
    audit: { ic: 'shield', tag: 'Audit', t: 'The audit trail',
      p: 'Every sensitive action leaves a permanent record.',
      steps: ['Logins, views of sensitive records and every change are recorded with who and when.', 'Schools can see their own trail. The Platform Owner sees activity, not learner content.', 'Nobody can edit or delete entries.'],
      box: 'The entries here are sample entries, plus anything you do in this preview.' }
  };

  /* ---------- helpers ---------- */
  function avgOf(arr) {
    var sum = 0, w = 0;
    ASSESS.forEach(function (a, i) { if (arr[i] !== null && arr[i] !== undefined) { sum += arr[i] / a.max * a.w; w += a.w; } });
    return w ? Math.round(sum / w * 100) : null;
  }
  function how(k, label) { return '<button class="how" data-info="' + k + '">' + icon('info', 'sm') + (label || 'How this works when live') + '</button>'; }
  function badge(s) {
    var m = { certified: ['b-ok', 'Certified'], testing: ['b-warn', 'New release being tested'], notpaired: ['b-mute', 'Not paired yet'] }[s];
    return '<span class="badge ' + m[0] + '">' + m[1] + '</span>';
  }
  function logAudit(who, act, d) { S.audit.unshift({ t: stamp(), who: who, act: act, d: d }); }
  function toast(msg) {
    var old = document.getElementById('toast'); if (old) old.remove();
    var t = document.createElement('div'); t.id = 'toast';
    t.setAttribute('role', 'status');
    t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#14284b;color:#fff;padding:11px 18px;border-radius:10px;z-index:80;box-shadow:0 8px 24px rgba(0,0,0,.25);font-size:14px;max-width:90vw';
    t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3200);
  }
  function kidMarks(subj) { return S.child === 0 ? S.marks[subj][1] : S.noahMarks[subj][1]; }

  /* ---------- modal ---------- */
  var lastFocus = null;
  function closeModal() { var r = document.getElementById('modal-root'); r.innerHTML = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function openModal(o) {
    lastFocus = document.activeElement;
    var r = document.getElementById('modal-root');
    r.innerHTML = '<div class="scrim" id="scrim"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt">' +
      '<div class="mh"><div class="ic">' + icon(o.ic || 'info') + '</div><h2 id="mt">' + o.title + '</h2><button class="xbtn" id="mx" aria-label="Close">' + icon('close') + '</button></div>' +
      '<div class="mb">' + o.body + '</div>' +
      '<div class="mf">' + (o.foot || '<button class="btn pri" id="mok">Got it</button>') + '</div></div></div>';
    document.getElementById('mx').onclick = closeModal;
    document.getElementById('scrim').addEventListener('mousedown', function (e) { if (e.target.id === 'scrim') closeModal(); });
    var ok = document.getElementById('mok'); if (ok) { ok.onclick = closeModal; ok.focus(); } else { var f = r.querySelector('input,select,textarea'); if (f) f.focus(); }
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.getElementById('scrim')) closeModal(); });
  function openInfo(k) {
    var x = INFO[k]; if (!x) return;
    openModal({ ic: x.ic, title: esc(x.t),
      body: '<p class="tagline">' + esc(x.tag) + '</p><p style="margin:0 0 6px">' + esc(x.p) + '</p><ol>' + x.steps.map(function (s) { return '<li><span>' + esc(s) + '</span></li>'; }).join('') + '</ol><div class="box">' + esc(x.box) + '</div>' });
  }

  /* ---------- views ---------- */
  function stat(ic, n, l) { return '<div class="card stat"><div class="ic">' + icon(ic) + '</div><div class="n">' + n + '</div><div class="l">' + l + '</div></div>'; }
  function bars(data, labels) {
    var mx = Math.max.apply(null, data);
    return '<div class="bars" role="img" aria-label="Sample chart">' + data.map(function (v, i) { return '<div class="b"><em>' + v + '</em><i style="height:' + Math.round(v / mx * 100) + '%"></i><span>' + labels[i] + '</span></div>'; }).join('') + '</div>';
  }
  function annList(items, showAud) {
    if (!items.length) return '<p class="m" style="color:var(--muted)">Nothing yet.</p>';
    return '<ul class="list">' + items.map(function (a) {
      return '<li><div class="ic">' + icon('megaphone') + '</div><div><div class="t">' + esc(a.t) + '</div><div class="m">' + esc(a.b) + '</div><div class="m">' + esc(a.by) + ' · ' + esc(a.when) + (showAud ? ' · ' + esc(AUD[a.a].l) : '') + '</div></div></li>';
    }).join('') + '</ul>';
  }
  function composeBtn(opts) { return '<button class="btn pri" data-act="compose" data-aud="' + opts + '">' + icon('plus', 'sm') + 'New announcement</button>'; }

  var V = {};
  V.owner = {
    overview: function () {
      var L = S.schools.reduce(function (a, s) { return a + s.learners; }, 0);
      return '<h1>Platform overview</h1><p class="lead">Every school on the platform, in one place. All figures on screen are sample data.</p>' +
        '<div class="grid g4">' + stat('school', S.schools.length, 'Schools on the platform') + stat('users', L.toLocaleString('en-ZA'), 'Learners across all schools') + stat('megaphone', 38, 'Announcements this month') + stat('phone', 642, 'USSD sessions this month') + '</div>' +
        '<div class="grid g2" style="margin-top:16px"><div class="card"><div class="head"><h2>Parent logins, last 7 days</h2>' + how('impact', 'About impact tracking') + '</div>' + bars([212, 248, 301, 276, 334, 120, 95], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) + '</div>' +
        '<div class="card"><div class="head"><h2>Recent activity</h2><a class="btn ghost" href="#/owner/audit">Audit trail</a></div><ul class="list">' + S.audit.slice(0, 4).map(function (a) { return '<li><div class="ic">' + icon('clock') + '</div><div><div class="t">' + esc(a.act) + '</div><div class="m">' + esc(a.who) + ' · ' + esc(a.t) + '</div></div></li>'; }).join('') + '</ul></div></div>';
    },
    schools: function () {
      return '<div class="head" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px"><div><h1>Schools</h1><p class="lead" style="margin:0">Each school is its own sealed space.</p></div><button class="btn pri" data-act="addschool">' + icon('plus', 'sm') + 'Add a school</button></div>' +
        '<div class="card tw" style="margin-top:16px"><table><thead><tr><th>School</th><th>Province</th><th>Learners</th><th>Staff</th><th>SA-SAMS</th><th>Status</th></tr></thead><tbody>' +
        S.schools.map(function (s) { return '<tr><td><b>' + esc(s.n) + '</b></td><td>' + esc(s.prov) + '</td><td>' + s.learners + '</td><td>' + s.staff + '</td><td>' + esc(s.ver) + '</td><td>' + badge(s.status) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    },
    connector: function () {
      return '<h1>SA-SAMS connector</h1><p class="lead">Which schools are paired, when each last synced, and whether the release it runs has been certified.</p>' +
        '<div class="grid g2"><div class="card tw"><div class="head"><h2>Schools</h2>' + how('pairing', 'Pairing') + how('sync', 'Sync') + '</div><table><thead><tr><th>School</th><th>Last synced</th><th>SA-SAMS</th><th>Status</th></tr></thead><tbody>' +
        S.schools.map(function (s) { return '<tr><td>' + esc(s.n) + '</td><td>' + esc(s.sync || 'Never') + '</td><td>' + esc(s.ver) + '</td><td>' + badge(s.status) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
        '<div class="card"><div class="head"><h2>Release assurance</h2>' + how('release', 'How it works') + '</div><ul class="list">' +
        '<li><div class="ic">' + icon('eye') + '</div><div><div class="t">Release detected</div><div class="m">A re-issued file under the same version number is caught by name, size, date and fingerprint.</div></div></li>' +
        '<li><div class="ic">' + icon('sync') + '</div><div><div class="t">Tested in a sandbox</div><div class="m">Installed with a dummy school and compared to the last certified version.</div></div></li>' +
        '<li><div class="ic">' + icon('check') + '</div><div><div class="t">Certified, then you are told</div><div class="m">Schools keep running on the last certified version until then.</div></div></li></ul></div></div>';
    },
    impact: function () {
      var rows = [['Sample Primary School', 612, 1480, 214], ['Demo High School', 941, 2210, 301], ['Pilot School Three', 380, 760, 127]];
      return '<div class="head" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px"><div><h1>Pilot impact</h1><p class="lead" style="margin:0">The numbers you take to schools and funders. Sample figures.</p></div>' + how('impact', 'About this dashboard') + '</div>' +
        '<div class="grid g3" style="margin-top:16px">' + stat('users', '1,933', 'Parent logins this month') + stat('megaphone', '4,450', 'Announcements delivered') + stat('phone', '642', 'USSD sessions') + '</div>' +
        '<div class="card tw" style="margin-top:16px"><table><thead><tr><th>School</th><th>Logins</th><th>Announcements delivered</th><th>USSD sessions</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td></tr>'; }).join('') + '</tbody></table></div>';
    },
    audit: function () {
      return '<div class="head" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px"><div><h1>Audit trail</h1><p class="lead" style="margin:0">Who did what, and when. Try the other roles and come back.</p></div>' + how('audit', 'About the audit trail') + '</div>' +
        '<div class="card tw" style="margin-top:16px"><table><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Detail</th></tr></thead><tbody>' + S.audit.map(function (a) { return '<tr><td>' + esc(a.t) + '</td><td>' + esc(a.who) + '</td><td><b>' + esc(a.act) + '</b></td><td>' + esc(a.d) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    }
  };
  V.principal = {
    overview: function () {
      return '<h1>Sample Primary School</h1><p class="lead">Your whole school, today. Sample data.</p>' +
        '<div class="grid g4">' + stat('users', 412, 'Learners') + stat('user', 26, 'Staff') + stat('lock', S.locked ? 'Locked' : 'Open', 'Term 2 marks') + stat('clock', S.pending.length, 'Changes waiting for approval') + '</div>' +
        '<div class="grid g2" style="margin-top:16px"><div class="card"><div class="head"><h2>SA-SAMS sync</h2>' + how('sync') + '</div><p style="margin:0 0 8px"><span class="badge b-ok">' + icon('check', 'sm') + 'Certified version</span></p><p style="margin:0 0 12px;color:var(--muted)">Last synced today at 06:12. 412 learners and 26 staff up to date.</p><button class="btn" data-act="syncnow">' + icon('sync', 'sm') + 'Sync now</button></div>' +
        '<div class="card"><div class="head"><h2>Latest announcements</h2><a class="btn ghost" href="#/principal/announce">All</a></div>' + annList(S.anns.slice(0, 2), true) + '</div></div>';
    },
    marks: function () {
      return '<div class="head" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px"><div><h1>Marks and term lock</h1><p class="lead" style="margin:0">Lock the term when marks are final. After that, every change needs your approval.</p></div>' + how('marks', 'How marks are protected') + '</div>' +
        '<div class="grid g2" style="margin-top:16px"><div class="card"><div class="head"><h2>Term 2 marks</h2></div><p style="margin:0 0 12px">Status: ' + (S.locked ? '<span class="badge b-warn">' + icon('lock', 'sm') + 'Locked</span>' : '<span class="badge b-ok">Open for teachers</span>') + '</p><button class="btn pri" data-act="togglelock">' + icon('lock', 'sm') + (S.locked ? 'Unlock term' : 'Lock term') + '</button><p class="lead" style="margin:12px 0 0;font-size:13.5px">Try it: lock the term, switch to Teacher, then change a mark in the mark book.</p></div>' +
        '<div class="card"><div class="head"><h2>Changes waiting for approval</h2></div>' + (S.pending.length ? '<ul class="list">' + S.pending.map(function (p, i) { return '<li><div class="ic">' + icon('edit') + '</div><div style="flex:1"><div class="t">' + esc(p.subj) + ', ' + esc(p.assess) + ', ' + esc(p.learner) + '</div><div class="m">' + p.old + ' to ' + p.nw + ' · ' + esc(p.by) + '</div><div class="m">Reason: ' + esc(p.reason) + '</div><div style="margin-top:8px;display:flex;gap:8px"><button class="btn pri" data-act="approve" data-i="' + i + '">Approve</button><button class="btn danger" data-act="decline" data-i="' + i + '">Decline</button></div></div></li>'; }).join('') + '</ul>' : '<p style="color:var(--muted);margin:0">Nothing waiting.</p>') + '</div></div>';
    },
    announce: function () {
      return '<div class="head" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px"><div><h1>Announcements</h1><p class="lead" style="margin:0">To the whole school, a class, or staff only.</p></div><div style="display:flex;gap:8px;align-items:center">' + how('notify', 'How it works') + composeBtn('school,staff,6A,3B') + '</div></div><div class="card" style="margin-top:16px">' + annList(S.anns, true) + '</div>';
    },
    people: function () {
      var rows = [['Principal', 'Principal', 'Whole school'], ['Ms Peters', 'Teacher', 'Grade 6A'], ['Mrs Naidoo', 'Teacher', 'Grade 3B'], ['Mr Jacobs', 'Teacher', 'Grade 7A, 7B'], ['School office', 'Receptionist', 'Contact details only']];
      return '<div class="head" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px"><div><h1>People and roles</h1><p class="lead" style="margin:0">The role decides exactly what each person can open.</p></div><div style="display:flex;gap:8px">' + how('people') + '<button class="btn pri" data-act="adduser">' + icon('plus', 'sm') + 'Invite someone</button></div></div>' +
        '<div class="card tw" style="margin-top:16px"><table><thead><tr><th>Name</th><th>Role</th><th>Can open</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><td><b>' + r[0] + '</b></td><td><span class="badge b-info">' + r[1] + '</span></td><td>' + r[2] + '</td></tr>'; }).join('') + '</tbody></table></div>' +
        '<p class="lead" style="margin-top:12px;font-size:13.5px">The first release has four roles: Platform Owner, Principal, Teacher and Parent. More roles come in a later stage.</p>';
    }
  };
  function markbook() {
    var tabs = SUBJECTS.map(function (s) { return '<button data-act="subj" data-s="' + esc(s) + '" class="' + (s === S.subject ? 'on' : '') + '">' + esc(s) + '</button>'; }).join('');
    var head = ASSESS.map(function (a) { return '<th>' + a.n + '<br><span style="text-transform:none;letter-spacing:0;font-weight:400">out of ' + a.max + ' (' + a.w + '%)</span></th>'; }).join('');
    var rows = LEARNERS.map(function (l) {
      var arr = S.marks[S.subject][l.id];
      var ins = ASSESS.map(function (a, i) {
        var v = arr[i] === null ? '' : arr[i];
        var ch = S.flags[S.subject + '|' + l.id + '|' + i] ? ' changed' : '';
        return '<td><input class="markin' + ch + '" type="number" min="0" max="' + a.max + '" value="' + v + '" data-l="' + l.id + '" data-a="' + i + '" aria-label="' + esc(l.n) + ' ' + a.n + '"></td>';
      }).join('');
      var av = avgOf(arr);
      return '<tr><td>' + esc(l.n) + '</td>' + ins + '<td class="avg" id="avg-' + l.id + '">' + (av === null ? '-' : av + '%') + '</td></tr>';
    }).join('');
    return '<div class="head" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px"><div><h1>Mark book, Grade 6A</h1><p class="lead" style="margin:0">Term 2. Averages calculate as you type.</p></div>' + how('marks', 'How marks are protected') + '</div>' +
      (S.locked ? '<div class="note amber" style="margin-top:14px">' + icon('lock', 'sm') + ' <b>Term 2 is locked by the principal.</b> Changes now need a reason and the principal’s approval.</div>' : '<div class="note" style="margin-top:14px">Term 2 is open. Every change you make is recorded (who, when, old value, new value).</div>') +
      '<div class="tabs">' + tabs + '</div><div class="card tw"><table><thead><tr><th>Learner</th>' + head + '<th>Term average</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }
  V.teacher = {
    overview: function () {
      return '<h1>My day, Ms Peters</h1><p class="lead">Grade 6A, Sample Primary School. Sample data.</p>' +
        '<div class="grid g3">' + stat('users', 8, 'Learners in my class (sample)') + stat('book', 3, 'Subjects') + stat('lock', S.locked ? 'Locked' : 'Open', 'Term 2 marks') + '</div>' +
        '<div class="grid g2" style="margin-top:16px"><div class="card"><div class="head"><h2>Mark book</h2></div><p style="margin:0 0 12px;color:var(--muted)">Capture marks by assessment. Term and year averages work themselves out.</p><a class="btn pri" href="#/teacher/markbook">Open mark book</a></div>' +
        '<div class="card"><div class="head"><h2>For my class</h2><a class="btn ghost" href="#/teacher/announce">All</a></div>' + annList(S.anns.filter(function (a) { return a.a === '6A' || a.a === 'school'; }).slice(0, 2), true) + '</div></div>';
    },
    markbook: markbook,
    announce: function () {
      return '<div class="head" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px"><div><h1>Announcements</h1><p class="lead" style="margin:0">You can send to your own class. The principal sends school-wide.</p></div><div style="display:flex;gap:8px;align-items:center">' + how('notify') + composeBtn('6A') + '</div></div><div class="card" style="margin-top:16px">' + annList(S.anns.filter(function (a) { return a.a === '6A' || a.a === 'school'; }), true) + '</div>';
    }
  };
  function parentSwitch() {
    return '<div class="tabs" role="tablist" aria-label="Choose child">' + KIDS.map(function (k, i) { return '<button data-act="child" data-i="' + i + '" class="' + (i === S.child ? 'on' : '') + '">' + esc(k.n) + ' · ' + k.g + '</button>'; }).join('') + '</div>';
  }
  function parentAnns() { var k = KIDS[S.child]; return S.anns.filter(function (a) { return a.a === 'school' || a.a === k.cls; }); }
  function marksCards() {
    return SUBJECTS.map(function (s) {
      var arr = kidMarks(s), av = avgOf(arr);
      return '<div class="card flat"><div class="head" style="margin-bottom:8px"><h3 style="margin:0">' + esc(s) + '</h3><b style="font-size:20px">' + (av === null ? '-' : av + '%') + '</b></div><div class="meter"><i style="width:' + (av || 0) + '%"></i></div>' +
        '<table style="margin-top:10px;font-size:13px"><tbody>' + ASSESS.map(function (a, i) { return '<tr><td style="padding:6px 0">' + a.n + '</td><td style="padding:6px 0;text-align:right">' + (arr[i] === null ? 'Not yet written' : arr[i] + ' / ' + a.max) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    }).join('');
  }
  V.parent = {
    home: function () {
      var k = KIDS[S.child];
      return '<h1>Hello. Here is ' + esc(k.n.split(' ')[0]) + '’s term so far</h1><p class="lead">You see your own children only. Sample data.</p>' + parentSwitch() +
        '<div class="grid g2"><div class="card"><div class="head"><h2>Marks, Term 2</h2><a class="btn ghost" href="#/parent/marks">All</a></div><div class="grid" style="gap:12px">' + marksCards() + '</div></div>' +
        '<div class="card"><div class="head"><h2>Notifications</h2>' + how('notify', 'How it works') + '</div>' + annList(parentAnns().slice(0, 3), false) + '</div></div>';
    },
    marks: function () { return '<h1>Marks, ' + esc(KIDS[S.child].n) + '</h1><p class="lead">Term averages work themselves out from each assessment.</p>' + parentSwitch() + '<div class="grid g3">' + marksCards() + '</div>'; },
    announce: function () { return '<h1>Announcements</h1><p class="lead">From the school and from ' + esc(KIDS[S.child].n.split(' ')[0]) + '’s class.</p>' + parentSwitch() + '<div class="card">' + annList(parentAnns(), false) + '</div>'; },
    privacy: function () {
      var hidden = S.anns.length - parentAnns().length;
      return '<div class="head" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px"><div><h1>Who can see what</h1><p class="lead" style="margin:0">The same rules apply to everyone on the platform.</p></div>' + how('access', 'How access works') + '</div>' +
        '<div class="grid g2" style="margin-top:16px"><div class="card"><h2>You can see</h2><ul class="list"><li><div class="ic">' + icon('check') + '</div><div>Your own children’s marks</div></li><li><div class="ic">' + icon('check') + '</div><div>School announcements and your children’s class announcements</div></li><li><div class="ic">' + icon('check') + '</div><div>Messages addressed to you</div></li></ul></div>' +
        '<div class="card"><h2>You cannot see</h2><ul class="list"><li><div class="ic">' + icon('lock') + '</div><div>Other learners or other classes</div></li><li><div class="ic">' + icon('lock') + '</div><div>Staff-only notes and messages (' + hidden + ' announcement' + (hidden === 1 ? '' : 's') + ' in this preview are hidden from you)</div></li><li><div class="ic">' + icon('lock') + '</div><div>Anything from another school</div></li></ul></div></div>' +
        '<div class="note" style="margin-top:16px">You cannot change a mark. Every change by staff is recorded permanently, and every access is logged.</div>';
    }
  };

  /* ---------- USSD ---------- */
  var U = { state: 'idle', screen: 'Dial the sample code to begin.', input: '', child: 0 };
  function ussdMain() { return 'In-Touch Schools\nHi, parent\n1. Marks\n2. Announcements\n3. Change child (' + KIDS[U.child].n.split(' ')[0] + ')\n0. Exit'; }
  function ussdAnns() { var k = KIDS[U.child]; return S.anns.filter(function (a) { return a.a === 'school' || a.a === k.cls; }); }
  function ussdSend() {
    var v = U.input.trim(); U.input = '';
    if (U.state === 'idle') return;
    var subj = ['Mathematics', 'English Home Language', 'Natural Sciences'];
    if (U.state === 'main') {
      if (v === '1') { U.state = 'marks'; U.screen = 'Marks: ' + KIDS[U.child].n.split(' ')[0] + '\n1. Maths\n2. English\n3. Nat Sci\n0. Back'; }
      else if (v === '2') { U.state = 'ann'; var a = ussdAnns(); U.screen = 'Announcements\n' + a.map(function (x, i) { return (i + 1) + '. ' + x.t.slice(0, 22); }).join('\n') + '\n0. Back'; }
      else if (v === '3') { U.child = U.child === 0 ? 1 : 0; U.screen = ussdMain(); }
      else if (v === '0') { U.state = 'idle'; U.screen = 'Session ended.'; }
      else U.screen = 'Invalid choice.\n\n' + ussdMain();
    } else if (U.state === 'marks') {
      var i = parseInt(v, 10);
      if (v === '0') { U.state = 'main'; U.screen = ussdMain(); }
      else if (i >= 1 && i <= 3) {
        var s = subj[i - 1], arr = U.child === 0 ? S.marks[s][1] : S.noahMarks[s][1], av = avgOf(arr);
        U.state = 'mark'; U.screen = s.split(' ')[0] + ' Term 2\n' + ASSESS.map(function (a, k) { return a.n + ': ' + (arr[k] === null ? '-' : arr[k] + '/' + a.max); }).join('\n') + '\nAverage: ' + (av === null ? '-' : av + '%') + '\n0. Back';
      } else U.screen = 'Invalid choice.\n\nMarks\n1. Maths\n2. English\n3. Nat Sci\n0. Back';
    } else if (U.state === 'mark') {
      U.state = 'marks'; U.screen = 'Marks: ' + KIDS[U.child].n.split(' ')[0] + '\n1. Maths\n2. English\n3. Nat Sci\n0. Back';
    } else if (U.state === 'ann') {
      var an = ussdAnns(), n = parseInt(v, 10);
      if (v === '0') { U.state = 'main'; U.screen = ussdMain(); }
      else if (n >= 1 && n <= an.length) { U.state = 'annd'; U.screen = an[n - 1].t + '\n' + an[n - 1].b.slice(0, 110) + (an[n - 1].b.length > 110 ? '...' : '') + '\n\n0. Back'; }
      else U.screen = 'Invalid choice.';
    } else if (U.state === 'annd') {
      U.state = 'ann'; var a2 = ussdAnns(); U.screen = 'Announcements\n' + a2.map(function (x, i2) { return (i2 + 1) + '. ' + x.t.slice(0, 22); }).join('\n') + '\n0. Back';
    }
  }
  V.ussd = {
    phone: function () {
      var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'Send'];
      return '<h1>USSD phone simulator</h1><p class="lead">What a parent sees on any handset, with no data or smartphone needed. This runs on sample data.</p>' +
        '<div class="phonewrap"><div class="phone"><div class="spk"></div><div class="dial"><button class="btn pri" data-act="dial">Dial *134*123#</button></div><div class="scr" id="uscr" aria-live="polite">' + esc(U.screen) + '</div>' +
        '<div class="inp"><span>&gt;</span><input type="text" id="uin" inputmode="numeric" maxlength="3" aria-label="Your reply" value="' + esc(U.input) + '"></div>' +
        '<div class="keys">' + keys.map(function (k) { return '<button data-key="' + k + '" class="' + (k === 'Send' ? 'go' : '') + '">' + k + '</button>'; }).join('') + '</div></div>' +
        '<div class="card"><div class="head"><h2>What this does when live</h2>' + how('ussd', 'Full explanation') + '</div><ul class="list">' +
        '<li><div class="ic">' + icon('book') + '</div><div><div class="t">Marks</div><div class="m">Subject marks and the term average for the parent’s own child.</div></div></li>' +
        '<li><div class="ic">' + icon('megaphone') + '</div><div><div class="t">Announcements</div><div class="m">School and class announcements, shortened to fit a USSD screen.</div></div></li>' +
        '<li><div class="ic">' + icon('users') + '</div><div><div class="t">Change child</div><div class="m">Parents with more than one child switch between them.</div></div></li>' +
        '<li><div class="ic">' + icon('shield') + '</div><div><div class="t">Own children only</div><div class="m">The menu only reads records linked to that parent’s number.</div></div></li></ul>' +
        '<div class="note amber" style="margin:14px 0 0">The code *134*123# is a sample, not a real number.</div></div></div>';
    }
  };

  /* ---------- render ---------- */
  function render() {
    var R = ROLES[S.role];
    var seg = Object.keys(ROLES).map(function (k) { return '<button data-role="' + k + '" class="' + (k === S.role ? 'on' : '') + '">' + ROLES[k].label + '</button>'; }).join('');
    var nav = R.nav.map(function (n) { return '<a href="#/' + S.role + '/' + n[0] + '" class="' + (n[0] === S.view ? 'on' : '') + '"' + (n[0] === S.view ? ' aria-current="page"' : '') + '>' + icon(n[2]) + n[1] + '</a>'; }).join('');
    var body = (V[S.role][S.view] || V[S.role][R.nav[0][0]])();
    document.getElementById('app').innerHTML =
      '<aside class="side"><div class="brand">' + icon('logo', 'lg') + '<div><b>IN-TOUCH SCHOOLS</b><span>Connect. Learn. Manage.</span></div></div><nav class="nav" aria-label="Sections">' + nav + '</nav>' +
      '<div class="foot">Preview with sample data only. No real learners, parents or schools appear here.</div></aside>' +
      '<header class="top"><div class="who"><div class="av">' + esc(R.who.charAt(0)) + '</div><div><b>' + esc(R.who) + '</b><small>' + esc(R.sub) + '</small></div></div>' +
      '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span class="pill">' + icon('eye', 'sm') + 'Preview, sample data</span><div class="seg" role="group" aria-label="View as">' + seg + '</div></div></header>' +
      '<main id="main" tabindex="-1">' + body + '</main>' +
      '<footer class="footer">Interactive preview prepared by Forge Vertical for Limitless Minds. This is not the live system. Nothing you enter here is saved or sent.</footer>';
  }
  function route() {
    var h = (location.hash || '').replace(/^#\/?/, '').split('/');
    var role = ROLES[h[0]] ? h[0] : 'owner';
    var views = ROLES[role].nav.map(function (n) { return n[0]; });
    S.role = role; S.view = views.indexOf(h[1]) > -1 ? h[1] : views[0];
    render(); window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  /* ---------- actions ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-role],[data-info],[data-act],[data-key]'); if (!t) return;
    if (t.dataset.role) { location.hash = '#/' + t.dataset.role; return; }
    if (t.dataset.info) { openInfo(t.dataset.info); return; }
    if (t.dataset.key) {
      var k = t.dataset.key, inp = document.getElementById('uin');
      if (k === 'C') U.input = ''; else if (k === 'Send') { if (inp) U.input = inp.value; ussdSend(); } else U.input = (U.input + k).slice(0, 3);
      render(); return;
    }
    var a = t.dataset.act;
    if (a === 'dial') { U.state = 'main'; U.child = 0; U.input = ''; U.screen = ussdMain(); render(); }
    else if (a === 'subj') { S.subject = t.dataset.s; render(); }
    else if (a === 'child') { S.child = parseInt(t.dataset.i, 10); render(); }
    else if (a === 'togglelock') { S.locked = !S.locked; logAudit('Principal', S.locked ? 'Term 2 locked' : 'Term 2 unlocked', 'Marks for Term 2'); render(); toast(S.locked ? 'Term 2 locked. Teachers now need approval to change marks.' : 'Term 2 unlocked.'); }
    else if (a === 'syncnow') { openInfo('sync'); }
    else if (a === 'approve' || a === 'decline') {
      var i = parseInt(t.dataset.i, 10), p = S.pending[i]; if (!p) return;
      if (a === 'approve') { S.marks[p.subj][p.lid][p.ai] = p.nw; S.flags[p.subj + '|' + p.lid + '|' + p.ai] = true; logAudit('Principal', 'Change approved after lock', p.subj + ', ' + p.assess + ', ' + p.learner + ': ' + p.old + ' to ' + p.nw); toast('Approved and flagged as changed after lock.'); }
      else { logAudit('Principal', 'Change declined', p.subj + ', ' + p.assess + ', ' + p.learner); toast('Declined. The original mark stands.'); }
      S.pending.splice(i, 1); render();
    }
    else if (a === 'compose') { compose(t.dataset.aud.split(',')); }
    else if (a === 'addschool') { addSchool(); }
    else if (a === 'adduser') {
      openModal({ ic: 'users', title: 'Invite someone', body: '<label class="f" for="un">Name</label><input type="text" id="un"><label class="f" for="ue">Email</label><input type="email" id="ue"><label class="f" for="ur">Role</label><select id="ur"><option>Teacher</option><option>Receptionist</option><option>Principal</option></select>', foot: '<button class="btn" id="mc">Cancel</button><button class="btn pri" id="ms">Send invitation</button>' });
      document.getElementById('mc').onclick = closeModal; document.getElementById('ms').onclick = function () { closeModal(); openInfo('people'); };
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.id === 'uin') { U.input = e.target.value; ussdSend(); render(); var n = document.getElementById('uin'); if (n) n.focus(); } });

  function compose(auds) {
    openModal({ ic: 'megaphone', title: 'New announcement',
      body: '<label class="f" for="at">Title</label><input type="text" id="at"><label class="f" for="aa">Send to</label><select id="aa">' + auds.map(function (k) { return '<option value="' + k + '">' + AUD[k].l + ' (' + AUD[k].n + ')</option>'; }).join('') + '</select><label class="f" for="ab">Message</label><textarea id="ab"></textarea>',
      foot: '<button class="btn" id="mc">Cancel</button><button class="btn pri" id="ms">Send</button>' });
    document.getElementById('mc').onclick = closeModal;
    document.getElementById('ms').onclick = function () {
      var t = document.getElementById('at').value.trim(), b = document.getElementById('ab').value.trim(), a = document.getElementById('aa').value;
      if (!t || !b) { toast('Add a title and a message first.'); return; }
      var by = S.role === 'teacher' ? 'Ms Peters' : 'Principal';
      S.anns.unshift({ t: t, b: b, a: a, by: by, when: stamp() });
      logAudit(by, 'Announcement sent', t + ', ' + AUD[a].l);
      closeModal(); render();
      toast('Sent to ' + AUD[a].l + '. When live: in-app and by email, to ' + AUD[a].n + ' people.');
    };
  }
  function addSchool() {
    openModal({ ic: 'school', title: 'Add a school',
      body: '<label class="f" for="sn">School name</label><input type="text" id="sn"><label class="f" for="sp">Province</label><select id="sp"><option>Western Cape</option><option>Gauteng</option><option>KwaZulu-Natal</option><option>Eastern Cape</option><option>Limpopo</option><option>Mpumalanga</option><option>North West</option><option>Free State</option><option>Northern Cape</option></select><label class="f" for="se">Principal email</label><input type="email" id="se">',
      foot: '<button class="btn" id="mc">Cancel</button><button class="btn pri" id="ms">Add school</button>' });
    document.getElementById('mc').onclick = closeModal;
    document.getElementById('ms').onclick = function () {
      var n = document.getElementById('sn').value.trim(); if (!n) { toast('Add the school name first.'); return; }
      S.schools.push({ n: n, prov: document.getElementById('sp').value, learners: 0, staff: 0, ver: '-', sync: '', status: 'notpaired' });
      logAudit('Platform Owner', 'School added', n); render(); openInfo('onboarding');
    };
  }
  document.addEventListener('change', function (e) {
    var el = e.target; if (!el.classList || !el.classList.contains('markin')) return;
    var lid = parseInt(el.dataset.l, 10), ai = parseInt(el.dataset.a, 10), a = ASSESS[ai];
    var l = LEARNERS.filter(function (x) { return x.id === lid; })[0];
    var old = S.marks[S.subject][lid][ai];
    var nw = el.value === '' ? null : Math.max(0, Math.min(a.max, parseInt(el.value, 10)));
    if (nw === old || (nw !== null && isNaN(nw))) { el.value = old === null ? '' : old; return; }
    if (S.locked && old !== null) {
      el.value = old;
      openModal({ ic: 'lock', title: 'This term is locked',
        body: '<p style="margin:0 0 6px">Term 2 marks are locked by the principal. To change <b>' + esc(l.n) + '</b>’s ' + esc(a.n) + ' from <b>' + old + '</b> to <b>' + nw + '</b>, send a request with a reason.</p><label class="f" for="rr">Reason</label><textarea id="rr"></textarea>',
        foot: '<button class="btn" id="mc">Cancel</button><button class="btn pri" id="ms">Send request</button>' });
      document.getElementById('mc').onclick = closeModal;
      document.getElementById('ms').onclick = function () {
        var r = document.getElementById('rr').value.trim(); if (!r) { toast('A reason is required.'); return; }
        S.pending.push({ subj: S.subject, assess: a.n, learner: l.n, lid: lid, ai: ai, old: old, nw: nw, by: 'Ms Peters', reason: r });
        logAudit('Ms Peters', 'Change requested after lock', S.subject + ', ' + a.n + ', ' + l.n + ': ' + old + ' to ' + nw);
        closeModal(); toast('Request sent to the principal. Switch to Principal to approve it.');
      };
      return;
    }
    S.marks[S.subject][lid][ai] = nw;
    logAudit('Ms Peters', 'Mark captured', S.subject + ', ' + a.n + ', ' + l.n + ': ' + (old === null ? 'entered ' : old + ' to ') + (nw === null ? 'cleared' : nw));
    var av = avgOf(S.marks[S.subject][lid]); var c = document.getElementById('avg-' + lid); if (c) c.textContent = av === null ? '-' : av + '%';
  });

  /* ---------- start ---------- */
  mountSprite();
  route();
  openModal({ ic: 'info', title: 'Welcome to the In-Touch Schools preview',
    body: '<p style="margin:0 0 8px">This is a clickable preview of the platform with <b>sample data only</b>. No real learners, parents or schools appear, and nothing you do here is saved or sent.</p><ol><li><span>Use the buttons at the top right to view it as the Platform Owner, a Principal, a Teacher, a Parent, or on a USSD phone.</span></li><li><span>Look for “How this works when live”: each one explains what happens behind the scenes once the connections are in place.</span></li><li><span>Try the marks: lock a term as Principal, then change a mark as Teacher.</span></li></ol>' });
})();

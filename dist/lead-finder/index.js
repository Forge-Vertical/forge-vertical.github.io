/**
 * Forge Vertical — Lead Finder (GCP Cloud Function, Node 22, gen2)
 * ---------------------------------------------------------------
 * Enhanced with deep website scraping for missing phone numbers and emails.
 */

const functions = require('@google-cloud/functions-framework');

const ALLOWED_ORIGIN = '*';
const UA = 'ForgeVerticalLeadFinder/1.0 (+https://www.forgevertical.com)';

// Strips junk emails
const JUNK_EMAIL = /(sentry|wixpress|no-?reply|noreply|donotreply|@example\.|@domain\.|@sentry|\.png$\vert{}\.jpg$|\.jpeg$\vert{}\.gif$|\.webp$\vert{}\.svg$|your-?email|youremail|email@example|godaddy|cloudflare|w3\.org|schema\.org|@2x)/i;

function setCors(res) {
  res.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

// Scrape both emails and phone numbers from the website HTML
async function scrapeWebsiteData(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': UA } });
    clearTimeout(t);
    if (!r.ok) return { emails: '', phone: '' };
    
    const html = await r.text();
    
    // 1. Extract emails
    const emails = (html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [])
      .map(e => e.toLowerCase())
      .filter(e => !JUNK_EMAIL.test(e))
      .filter((e, i, a) => a.indexOf(e) === i)
      .slice(0, 3)
      .join('; ');

    // 2. Extract phone numbers (from tel: links or common phone formats)
    const telMatches = [...html.matchAll(/href="tel:([^"]+)"/gi)].map(m => m[1].trim());
    const textPhones = html.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/g) || [];
    
    // Filter and clean phone candidates
    const validPhones = [...telMatches, ...textPhones]
      .map(p => p.replace(/[^\d+()\s-]/g, '').trim())
      .filter(p => p.length >= 7 && p.length <= 20)
      .filter((p, i, a) => a.indexOf(p) === i);

    const phone = validPhones[0] || '';

    return { emails, phone };
  } catch (e) { 
    return { emails: '', phone: '' }; 
  }
}

// --- Mode A: Google Places (New), caller's key ---
async function viaPlaces(query, key, depth, opts) {
  const fieldMask = 'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.googleMapsUri,nextPageToken';
  let leads = [], pageToken = null;
  for (let i = 0; i < Math.min(Math.ceil(depth / 20), 3); i++) {
    const b = { textQuery: query, pageSize: 20 };
    if (opts.minRating) b.minRating = parseFloat(opts.minRating);
    if (opts.openNow) b.openNow = true;
    if (opts.regionCode) b.regionCode = String(opts.regionCode).toLowerCase();
    if (pageToken) b.pageToken = pageToken;
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': fieldMask },
      body: JSON.stringify(b),
    });
    if (!r.ok) { const t = await r.text(); throw new Error('Places ' + r.status + ': ' + t.slice(0, 160)); }
    const d = await r.json();
    (d.places || []).forEach(p => leads.push({
      name: (p.displayName && p.displayName.text) || '',
      phone: p.nationalPhoneNumber || p.internationalPhoneNumber || '',
      website: p.websiteUri || '',
      rating: p.rating ? `${p.rating} (${p.userRatingCount || 0})` : '',
      address: p.formattedAddress || '',
      maps: p.googleMapsUri || '',
      emails: '', source: 'google',
    }));
    pageToken = d.nextPageToken;
    if (!pageToken) break;
  }
  return leads.slice(0, depth);
}

// --- Mode B: OpenStreetMap (Overpass + Nominatim), free, no key ---
async function viaOSM(niche, location, depth) {
  const term = niche.toLowerCase().trim();
  const safeTerm = term.replace(/[^a-z0-9 ]/g, ''); 
  
  const g = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(location), { headers: { 'User-Agent': UA } });
  if (!g.ok) throw new Error('Geocoding failed (' + g.status + ')');
  const gj = await g.json();
  if (!gj.length) throw new Error('Location not found');
  
  const bb = gj[0].boundingbox; // [south, north, west, east]
  const [s, n, w, e] = bb;
  const cats = ['shop', 'craft', 'amenity', 'office', 'tourism', 'healthcare', 'leisure'];
  
  const nameFilter = safeTerm ? `[name~"${safeTerm}",i]` : '[name]';
  const ql = `[out:json][timeout:25];nwr[~"^(${cats.join('|')})$"~"."]${nameFilter}(${s},${w},${n},${e});out center tags 200;`;
  
  let o = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
    body: 'data=' + encodeURIComponent(ql),
  });
  
  if (!o.ok && o.status === 504) {
    o = await fetch('https://lz4.overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
      body: 'data=' + encodeURIComponent(ql),
    });
  }
  
  if (!o.ok) throw new Error(`OpenStreetMap server is busy (Overpass ${o.status}). Try a specific suburb.`);
  
  const oj = await o.json();
  const stem = safeTerm.replace(/(ers|ing|er|s)$/, '');
  const out = [];
  
  for (const el of (oj.elements || [])) {
    const tg = el.tags || {};
    const name = tg.name || '';
    const hay = (name + ' ' + cats.map(c => tg[c] || '').join(' ')).toLowerCase();
    
    if (safeTerm && !(hay.includes(safeTerm) || (stem.length >= 3 && hay.includes(stem)))) continue;
    
    const line1 = [tg['addr:housenumber'], tg['addr:street']].filter(Boolean).join(' ');
    const line2 = [tg['addr:suburb'] || tg['addr:neighbourhood'], tg['addr:city'] || tg['addr:town'], tg['addr:postcode']].filter(Boolean).join(', ');
    const address = [line1, line2].filter(Boolean).join(', ') || (tg['addr:full'] || '');
    const lat = el.lat || (el.center && el.center.lat);
    const lon = el.lon || (el.center && el.center.lon);
    
    out.push({
      name,
      phone: tg.phone || tg['contact:phone'] || tg['contact:mobile'] || '',
      website: tg.website || tg['contact:website'] || '',
      rating: '',
      address,
      maps: (lat && lon) ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}` : '',
      emails: tg.email || tg['contact:email'] || '',
      source: 'osm',
    });
    if (out.length >= depth) break;
  }
  return out;
}

functions.http('leadFinder', async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  const body = req.body || {};
  let niche = (body.niche || '').trim();
  let location = (body.location || '').trim();
  let query = (body.query || '').trim();
  if ((!niche || !location) && query.includes(' in ')) {
    const p = query.split(' in ');
    niche = niche || p[0].trim();
    location = location || p.slice(1).join(' in ').trim();
  }
  if (!query) query = (niche && location) ? `${niche} in ${location}` : (niche || location);
  const depth = Math.min(parseInt(body.depth, 10) || 20, 60);
  const key = (body.key || '').trim() || process.env.PLACES_KEY;

  if (!query) { res.status(400).json({ error: 'Provide a niche and location' }); return; }

  try {
    let leads, source;
    if (key) {
      leads = await viaPlaces(query, key, depth, body);
      source = 'google';
    } else {
      if (!niche || !location) { res.status(400).json({ error: 'For keyless search, send niche and location separately' }); return; }
      leads = await viaOSM(niche, location, depth);
      source = 'osm';
    }
    
    let scraped = 0;
    // Scrape websites to fill missing emails AND missing phone numbers
    const targets = leads.filter(l => l.website && (!l.emails || !l.phone)).slice(0, 30);
    await Promise.all(targets.map(async (l) => { 
      const scrapedData = await scrapeWebsiteData(l.website);
      let updated = false;
      if (!l.emails && scrapedData.emails) { l.emails = scrapedData.emails; updated = true; }
      if (!l.phone && scrapedData.phone) { l.phone = scrapedData.phone; updated = true; }
      if (updated) scraped++;
    }));

    res.status(200).json({ source, count: leads.length, scraped, leads });
  } catch (err) {
    res.status(502).json({ error: err.message || 'search failed' });
  }
});
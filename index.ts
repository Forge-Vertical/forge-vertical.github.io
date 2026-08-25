import * as functions from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// ─────────────────────────────────────────────────────────────────
// ZOHO TOKEN — shared refresh
// ─────────────────────────────────────────────────────────────────
async function getZohoToken(): Promise<string> {
    const { default: fetch } = await import('node-fetch');
    const res = await fetch(
        `https://accounts.zoho.com/oauth/v2/token` +
        `?refresh_token=${process.env.ZOHO_REFRESH_TOKEN}` +
        `&client_id=${process.env.ZOHO_CLIENT_ID}` +
        `&client_secret=${process.env.ZOHO_CLIENT_SECRET}` +
        `&grant_type=refresh_token`,
        { method: 'POST' }
    );
    const data: any = await res.json();
    if (!data.access_token) throw new Error('Token refresh failed: ' + JSON.stringify(data));
    return data.access_token;
}

// ─────────────────────────────────────────────────────────────────
// ZOHO CRM — create lead
// ─────────────────────────────────────────────────────────────────
async function createCRMLead(lead: any, token: string) {
    const { default: fetch } = await import('node-fetch');
    const res = await fetch('https://www.zohoapis.com/crm/v3/Leads', {
        method: 'POST',
        headers: { 'Authorization': `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            data: [{
                Last_Name:   lead.name,
                Email:       lead.email,
                Phone:       lead.phone || '',
                Company:     lead.company || lead.name,
                Description: [
                    `Service: ${lead.service || ''}`,
                    `Source: ${lead.source || ''}`,
                    `Platform: ${lead.platform || 'unknown'}`,
                    `Pages: ${lead.pageCount || 'unknown'}`,
                    `Known issues: ${lead.knownBugs || 'none'}`,
                    `Scanned URL: ${lead.scannedUrl || ''}`,
                    ``,
                    lead.message || '',
                ].join('\n'),
                Lead_Source: 'Website',
            }],
            trigger: ['workflow']
        }),
    });
    const data: any = await res.json();
    if (data.data?.[0]?.code === 'SUCCESS') return data.data[0].details.id;
    throw new Error('CRM lead failed: ' + JSON.stringify(data));
}

// ─────────────────────────────────────────────────────────────────
// ZOHO INVOICE — create estimate (draft quote)
// Requires scope: ZohoInvoice.estimates.CREATE,ZohoInvoice.settings.READ
// ─────────────────────────────────────────────────────────────────
async function createInvoiceEstimate(lead: any, token: string) {
    const { default: fetch } = await import('node-fetch');

    // Get org ID
    const orgRes = await fetch('https://invoice.zoho.com/api/v3/organizations', {
        headers: { 'Authorization': `Zoho-oauthtoken ${token}` }
    });
    const orgData: any = await orgRes.json();
    const orgId = orgData.organizations?.[0]?.organization_id;
    if (!orgId) throw new Error(`No Zoho Invoice org. Response: ${JSON.stringify(orgData)}`);

    // Build line items from audit results
    const lineItems: any[] = [{
        name: 'Forge Audit — Full site audit',
        description: `GEO/AI indexing + SEO + Security · PDF report + Loom walkthrough\nSite: ${lead.scannedUrl || ''} · Platform: ${lead.platform || 'unknown'} · Pages: ${lead.pageCount || 'unknown'}`,
        rate: 2500,
        quantity: 1,
    }];

    if (Array.isArray(lead.auditResults)) {
        lead.auditResults
            .filter((i: any) => !i.pass && i.price > 0)
            .forEach((i: any) => lineItems.push({
                name: `Fix — ${i.name}`,
                description: i.why ? i.why.split('.')[0] + '.' : '',
                rate: i.price,
                quantity: 1,
            }));
    }

    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const estNum = `FV-${Date.now().toString().slice(-6)}`;

    const body = {
        customer_name:    lead.name,
        customer_email:   lead.email,
        estimate_number:  estNum,
        reference_number: lead.scannedUrl || '',
        expiry_date:      expiry,
        line_items:       lineItems,
        discount:         10,
        discount_type:    'entity_level',
        notes:            `Forge Vertical audit for ${lead.scannedUrl || 'your website'}.\nContact: jarrit@forgevertical.com · +27 65 741 7593\nValid 30 days. 10% bundle discount applied.`,
        terms:            'Prices in ZAR. 50% deposit on confirmation, 50% on completion.',
    };

    const estRes = await fetch(
        `https://invoice.zoho.com/api/v3/estimates?organization_id=${orgId}`,
        {
            method: 'POST',
            headers: { 'Authorization': `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }
    );

    const estData: any = await estRes.json();
    if (estData.estimate?.estimate_id) return estData.estimate;
    throw new Error(`Invoice estimate failed: ${JSON.stringify(estData)}`);
}

// ─────────────────────────────────────────────────────────────────
// submitLead — POST
// Called from onboard.html and audit tool
// ─────────────────────────────────────────────────────────────────
export const submitLead = functions.onRequest(
    { secrets: ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN'] },
    async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

    try {
        const b = req.body;
        if (!b.name || !b.email) { res.status(400).json({ error: 'Name and email required' }); return; }

        const lead = {
            name:         b.name.trim(),
            email:        b.email.trim().toLowerCase(),
            phone:        b.phone?.trim()      || '',
            company:      b.company?.trim()    || '',
            message:      b.message?.trim()    || '',
            service:      b.service?.trim()    || '',
            platform:     b.platform?.trim()   || '',
            pageCount:    b.pageCount?.trim()  || '',
            knownBugs:    b.knownBugs?.trim()  || '',
            scannedUrl:   b.scannedUrl?.trim() || '',
            auditResults: b.auditResults       || null,
            source:       b.source?.trim()     || 'forgevertical.com',
            timestamp:    admin.firestore.FieldValue.serverTimestamp(),
            status:       'new',
            zoho_crm_id:  null as string | null,
            zoho_est_id:  null as string | null,
            zoho_est_num: null as string | null,
        };

        // Firestore first — lead never lost
        const docRef = await db.collection('leads').add(lead);
        console.log(`[Lead] Firestore: ${docRef.id}`);

        // Zoho — one token refresh for both CRM and Invoice
        try {
            const token = await getZohoToken();

            // CRM lead
            const crmId = await createCRMLead(lead, token);
            await docRef.update({ zoho_crm_id: crmId, status: 'crm_synced' });
            console.log(`[Lead] CRM: ${crmId}`);

            // Invoice estimate — only when audit results present
            if (Array.isArray(lead.auditResults) && lead.auditResults.length > 0) {
                try {
                    const est = await createInvoiceEstimate(lead, token);
                    await docRef.update({
                        zoho_est_id:  est.estimate_id,
                        zoho_est_num: est.estimate_number,
                        status: 'estimate_created'
                    });
                    console.log(`[Lead] Invoice estimate: ${est.estimate_number}`);
                } catch (estErr: any) {
                    // Log full error so we can diagnose scope issues
                    console.error('[Lead] Invoice estimate failed:', estErr.message);
                    await docRef.update({ zoho_est_error: estErr.message });
                }
            }

        } catch (zohoErr: any) {
            await docRef.update({ status: 'zoho_failed', zoho_error: zohoErr.message });
            console.error('[Lead] Zoho failed — lead safe in Firestore:', zohoErr.message);
        }

        res.status(200).json({ success: true, message: 'Thank you — we will be in touch within 24 hours.' });

    } catch (err: any) {
        console.error('[submitLead]', err);
        res.status(500).json({ error: 'Something went wrong. Please try WhatsApp.' });
    }
});

// ─────────────────────────────────────────────────────────────────
// deepScan — POST { url: string }
// Server-side fetch of a URL — returns real headers and HTML signals
// No CORS issues since this runs on the server
// ─────────────────────────────────────────────────────────────────
export const deepScan = functions.onRequest(
    { secrets: [] },
    async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

    const { url } = req.body;
    if (!url || !url.startsWith('http')) {
        res.status(400).json({ error: 'Valid URL required' });
        return;
    }

    try {
        const { default: fetch } = await import('node-fetch');
        const results: any = {};

        // Fetch main page with a browser-like UA
        let html = '';
        let headers: any = {};
        try {
            const pageRes = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ForgeVerticalAudit/1.0)' },
                redirect: 'follow',
                timeout: 10000,
            } as any);

            html = await pageRes.text();

            // Read headers
            pageRes.headers.forEach((value: string, key: string) => {
                headers[key.toLowerCase()] = value;
            });
        } catch(e: any) {
            res.status(200).json({ error: 'Could not fetch URL: ' + e.message, results: {} });
            return;
        }

        // ── Security headers ──────────────────────────────────────
        results.hsts = {
            pass: !!headers['strict-transport-security'],
            value: headers['strict-transport-security'] || null,
        };
        results.csp = {
            pass: !!headers['content-security-policy'],
            value: headers['content-security-policy']?.slice(0, 120) || null,
        };
        results.xframe = {
            pass: !!(headers['x-frame-options'] || headers['content-security-policy']?.includes('frame-ancestors')),
            value: headers['x-frame-options'] || null,
        };
        results.server_leak = {
            pass: !headers['server'] || headers['server'].toLowerCase() === 'cloudflare',
            value: headers['server'] || 'not present',
        };
        results.cloudflare = {
            pass: !!(headers['cf-ray'] || headers['server']?.toLowerCase().includes('cloudflare') || headers['cf-cache-status']),
            cf_ray: headers['cf-ray'] || null,
            server: headers['server'] || null,
        };

        // ── HTML meta checks ──────────────────────────────────────
        results.title = {
            pass: /<title[^>]*>[^<]+<\/title>/i.test(html),
            value: html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim().slice(0, 80) || null,
        };
        results.meta_desc = {
            pass: /meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i.test(html) ||
                  /meta[^>]+content=["'][^"']+["'][^>]+name=["']description["']/i.test(html),
        };
        results.canonical = {
            pass: /rel=["']canonical["']/i.test(html),
            value: html.match(/rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] || null,
        };
        results.viewport = {
            pass: /name=["']viewport["']/i.test(html),
        };
        results.og_title = {
            pass: /property=["']og:title["']/i.test(html) || /name=["']og:title["']/i.test(html),
        };
        results.og_desc = {
            pass: /property=["']og:description["']/i.test(html),
        };
        results.og_image = {
            pass: /property=["']og:image["']/i.test(html),
        };
        results.schema = {
            pass: html.includes('application/ld+json') || html.includes('schema.org'),
            type: html.match(/"@type"\s*:\s*"([^"]+)"/)?.[1] || null,
        };
        results.favicon = {
            pass: /rel=["']icon["']/i.test(html) || /rel=["']shortcut icon["']/i.test(html),
        };

        res.status(200).json({ results, url });

    } catch (err: any) {
        console.error('[deepScan]', err);
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// getLeads — GET ?secret=ADMIN_SECRET
// ─────────────────────────────────────────────────────────────────
export const getLeads = functions.onRequest(
    { secrets: ['ADMIN_SECRET', 'ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN'] },
    async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (req.query.secret !== process.env.ADMIN_SECRET) { res.status(401).json({ error: 'Unauthorised' }); return; }
    try {
        const snap = await db.collection('leads').orderBy('timestamp', 'desc').limit(100).get();
        res.status(200).json({ leads: snap.docs.map(d => ({ id: d.id, ...d.data() })), total: snap.size });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

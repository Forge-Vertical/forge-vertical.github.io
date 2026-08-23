import * as functions from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

async function getZohoAccessToken(): Promise<string> {
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

async function createZohoCRMLead(lead: any, token: string) {
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
                Description: `Service: ${lead.service}\nPlatform: ${lead.platform || 'unknown'}\nPages: ${lead.pageCount || 'unknown'}\nKnown issues: ${lead.knownBugs || 'none'}\n\n${lead.message}`,
                Lead_Source: 'Website — Audit Tool',
            }],
            trigger: ['workflow']
        }),
    });
    const data: any = await res.json();
    if (data.data?.[0]?.code === 'SUCCESS') return data.data[0].details.id;
    throw new Error('CRM lead failed: ' + JSON.stringify(data));
}

async function createZohoInvoiceEstimate(lead: any, token: string) {
    const { default: fetch } = await import('node-fetch');

    // Get org ID
    const orgRes = await fetch('https://invoice.zoho.com/api/v3/organizations', {
        headers: { 'Authorization': `Zoho-oauthtoken ${token}` }
    });
    const orgData: any = await orgRes.json();
    const orgId = orgData.organizations?.[0]?.organization_id;
    if (!orgId) throw new Error('No Zoho Invoice org found');

    // Build line items
    const lineItems: any[] = [{
        name: 'Forge Audit — Full site audit',
        description: `GEO/AI indexing + SEO + Security + Technical · PDF report + Loom walkthrough\nSite: ${lead.scannedUrl || ''} · Platform: ${lead.platform || 'unknown'} · Pages: ${lead.pageCount || 'unknown'}`,
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

    const estRes = await fetch(`https://invoice.zoho.com/api/v3/estimates?organization_id=${orgId}`, {
        method: 'POST',
        headers: { 'Authorization': `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            customer_name: lead.name,
            customer_email: lead.email,
            estimate_number: `FV-${Date.now().toString().slice(-6)}`,
            reference_number: lead.scannedUrl || '',
            expiry_date: expiry,
            line_items: lineItems,
            discount: 10,
            discount_type: 'entity_level',
            notes: `Forge Vertical audit for ${lead.scannedUrl || 'your website'}. WhatsApp +27 65 741 7593 or email jarrit@forgevertical.com to proceed. Valid 30 days.`,
            terms: 'Prices in ZAR. 50% deposit, 50% on completion. 10% bundle discount applied.',
        }),
    });

    const estData: any = await estRes.json();
    if (estData.estimate?.estimate_id) return estData.estimate;
    throw new Error('Invoice estimate failed: ' + JSON.stringify(estData));
}

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
        };

        // Always save to Firestore first
        const docRef = await db.collection('leads').add(lead);
        console.log(`[Lead] Firestore: ${docRef.id}`);

        // Zoho — one token for both CRM and Invoice
        try {
            const token = await getZohoAccessToken();

            // CRM
            const crmId = await createZohoCRMLead(lead, token);
            await docRef.update({ zoho_crm_id: crmId, status: 'crm_synced' });
            console.log(`[Lead] CRM: ${crmId}`);

            // Invoice estimate — only when audit results are present
            if (Array.isArray(lead.auditResults) && lead.auditResults.length > 0) {
                try {
                    const est = await createZohoInvoiceEstimate(lead, token);
                    await docRef.update({ zoho_est_id: est.estimate_id, zoho_est_number: est.estimate_number, status: 'estimate_created' });
                    console.log(`[Lead] Invoice estimate: ${est.estimate_number}`);
                } catch (estErr: any) {
                    console.error('[Lead] Invoice estimate failed (non-fatal):', estErr.message);
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

export const getLeads = functions.onRequest(
    { secrets: ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN'] },
    async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (req.query.secret !== process.env.ADMIN_SECRET) { res.status(401).json({ error: 'Unauthorised' }); return; }
    try {
        const snap = await db.collection('leads').orderBy('timestamp', 'desc').limit(100).get();
        res.status(200).json({ leads: snap.docs.map(d => ({ id: d.id, ...d.data() })), total: snap.size });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

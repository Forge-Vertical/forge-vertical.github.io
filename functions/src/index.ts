import * as functions from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

async function getZohoAccessToken(): Promise<string> {
    const { default: fetch } = await import('node-fetch');
    const clientId     = process.env.ZOHO_CLIENT_ID!;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET!;
    const refreshToken = process.env.ZOHO_REFRESH_TOKEN!;

    const res = await fetch(
        `https://accounts.zoho.com/oauth/v2/token` +
        `?refresh_token=${refreshToken}` +
        `&client_id=${clientId}` +
        `&client_secret=${clientSecret}` +
        `&grant_type=refresh_token`,
        { method: 'POST' }
    );
    const data: any = await res.json();
    if (!data.access_token) throw new Error('Zoho token failed: ' + JSON.stringify(data));
    return data.access_token;
}

async function createZohoLead(lead: any, token: string) {
    const { default: fetch } = await import('node-fetch');
    const res = await fetch('https://www.zohoapis.com/crm/v3/Leads', {
        method: 'POST',
        headers: {
            'Authorization': `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            data: [{
                Last_Name:   lead.name,
                Email:       lead.email,
                Phone:       lead.phone || '',
                Company:     lead.company || lead.name,
                Description: `Service: ${lead.service}\nBudget: ${lead.budget}\nTimeline: ${lead.timeline}\n\n${lead.message}`,
                Lead_Source: 'Website',
            }],
            trigger: ['workflow']
        }),
    });
    const data: any = await res.json();
    if (data.data?.[0]?.code === 'SUCCESS') return data.data[0].details.id;
    throw new Error('Zoho failed: ' + JSON.stringify(data));
}

export const submitLead = functions.onRequest(
    { secrets: ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN'] },
    async (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
        if (req.method !== 'POST')    { res.status(405).json({ error: 'Method not allowed' }); return; }

        try {
            const body = req.body;
            if (!body.name || !body.email) {
                res.status(400).json({ error: 'Name and email required' });
                return;
            }

            const lead = {
                name:      body.name.trim(),
                email:     body.email.trim().toLowerCase(),
                phone:     body.phone?.trim()    || '',
                company:   body.company?.trim()  || '',
                message:   body.message?.trim()  || '',
                service:   body.service?.trim()  || '',
                budget:    body.budget?.trim()    || '',
                timeline:  body.timeline?.trim()  || '',
                source:    body.source?.trim()    || 'forgevertical.com',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                status:    'new',
                zoho_id:   null,
            };

            // Save to Firestore first — lead is never lost
            const docRef = await db.collection('leads').add(lead);
            console.log('Firestore lead saved:', docRef.id);

            // Sync to Zoho
            try {
                const token  = await getZohoAccessToken();
                const zohoId = await createZohoLead(lead, token);
                await docRef.update({ zoho_id: zohoId, status: 'synced' });
                console.log('Zoho lead created:', zohoId);
            } catch (e: any) {
                await docRef.update({ status: 'zoho_failed', error: e.message });
                console.error('Zoho sync failed:', e.message);
            }

            res.status(200).json({ success: true, message: 'Thank you — we will be in touch within 24 hours.' });

        } catch (err: any) {
            console.error('submitLead error:', err);
            res.status(500).json({ error: 'Something went wrong. Please try WhatsApp.' });
        }
    }
);

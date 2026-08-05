/**
 * Forge Vertical — SiteBuild Studio API Route
 * 
 * Add this route to your Hono server (server.ts / index.ts)
 * 
 * POST /api/generate-site
 * Body: JSON matching the data shape in generate-site.ts
 * Returns: { html: string } on success, { error: string } on failure
 */

import { generateSite } from './generate-site';

// Add this inside your Hono app setup:
app.post('/api/generate-site', async (c) => {
    try {
        const data = await c.req.json();

        // Basic validation
        if (!data.name || !data.industry) {
            return c.json({ error: 'Business name and industry are required' }, 400);
        }

        // Sanitise pages array
        if (!Array.isArray(data.pages) || data.pages.length === 0) {
            data.pages = ['Home', 'Services', 'Contact'];
        }

        const html = await generateSite(data);

        return c.json({ html, status: 'Generated' });

    } catch (error: any) {
        console.error('API ERROR:', error);
        return c.json({ error: error.message || 'Generation failed' }, 500);
    }
});

/**
 * PayFast IPN notification handler
 * Fires when payment is confirmed
 * 
 * POST /api/payfast-notify
 */
app.post('/api/payfast-notify', async (c) => {
    try {
        const body = await c.req.parseBody();
        const paymentStatus = body['payment_status'];
        const paymentId = body['m_payment_id'];

        // Log the payment
        console.log(`PayFast IPN: ${paymentId} — ${paymentStatus}`);

        // On COMPLETE — you can log to Firestore, send confirmation email, etc.
        if (paymentStatus === 'COMPLETE') {
            // TODO: Log to Firestore
            // TODO: Send confirmation email via SendGrid/Resend
            console.log(`Payment complete: ${paymentId}`);
        }

        return c.text('OK', 200);
    } catch (e) {
        return c.text('Error', 500);
    }
});

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import 'dotenv/config';
import { ingestSite } from './ingestor';
import { refactorToTailwind } from './forge';
import { generateSite } from './generate-site';

const app = new Hono();

const enginePath   = './forge-engine';
const projectsRoot = './vertical-projects';

// Initialise folders
[enginePath, projectsRoot].forEach(p => {
    if (!existsSync(p)) mkdirSync(p, { recursive: true });
});

// ─────────────────────────────────────────────────────────────────
// SOVEREIGN FILE SERVER
// ─────────────────────────────────────────────────────────────────
app.get('*', (c) => {
    const url  = new URL(c.req.url);
    let   path = url.pathname === '/' ? './index.html' : `.${url.pathname}`;

    // Auth check on forge-engine assets
    if (path.includes('forge-engine')) {
        const auth = c.req.query('auth');
        if (auth !== 'success' && auth !== 'VFKNMJUBYQQG6')
            return c.redirect('/build?error=unauthorized');
    }

    if (existsSync(path)) {
        const content = readFileSync(path);
        const ext     = path.split('.').pop()?.toLowerCase();
        const mimeMap: Record<string, string> = {
            'html': 'text/html',
            'css':  'text/css',
            'js':   'application/javascript',
            'ts':   'text/plain',
            'mp4':  'video/mp4',
            'png':  'image/png',
            'jpg':  'image/jpeg',
            'jpeg': 'image/jpeg',
            'webp': 'image/webp',
            'svg':  'image/svg+xml',
            'ico':  'image/x-icon',
            'txt':  'text/plain',
            'json': 'application/json',
            'xml':  'application/xml',
        };
        return c.body(content, 200, {
            'Content-Type': mimeMap[ext || 'html'] || 'text/plain'
        });
    }
    return c.text('404: Asset Missing', 404);
});

// ─────────────────────────────────────────────────────────────────
// EXISTING: Site refactor (ingest URL → restyle with Gemini)
// POST /api/forge
// Body: { url: string }
// ─────────────────────────────────────────────────────────────────
app.post('/api/forge', async (c) => {
    try {
        const { url } = await c.req.json();
        const siteData      = await ingestSite(url);
        const refactoredHtml = await refactorToTailwind(siteData.html);
        writeFileSync(`${enginePath}/index.html`, refactoredHtml);
        return c.json({
            status:      'Forged',
            downloadUrl: '/forge-engine/index.html?auth=VFKNMJUBYQQG6'
        });
    } catch (error: any) {
        return c.json({ status: 'Error', message: error.message }, 500);
    }
});

// ─────────────────────────────────────────────────────────────────
// NEW: SiteBuild Studio — generate from scratch
// POST /api/generate-site
// Body: business data JSON from sitebuild-intake.html
// ─────────────────────────────────────────────────────────────────
app.post('/api/generate-site', async (c) => {
    try {
        const data = await c.req.json();

        // Basic validation
        if (!data.name || !data.industry) {
            return c.json(
                { status: 'Error', error: 'Business name and industry are required' },
                400
            );
        }

        // Sanitise pages array
        if (!Array.isArray(data.pages) || data.pages.length === 0) {
            data.pages = ['Home', 'Services', 'Contact'];
        }

        const html = await generateSite(data);

        // Optionally write to vertical-projects for local testing
        if (data.project_id) {
            const projectDir = `${projectsRoot}/${data.project_id}`;
            if (!existsSync(projectDir)) mkdirSync(projectDir, { recursive: true });
            writeFileSync(`${projectDir}/index.html`, html);
            writeFileSync(`${projectDir}/build-status.json`, JSON.stringify({
                status:     'complete',
                built_at:   new Date().toISOString(),
                project_id: data.project_id
            }));
        }

        return c.json({ status: 'Generated', html });

    } catch (error: any) {
        console.error('GENERATE-SITE ERROR:', error);
        return c.json({ status: 'Error', error: error.message }, 500);
    }
});

// ─────────────────────────────────────────────────────────────────
// NEW: PayFast IPN notification
// POST /api/payfast-notify
// Called by PayFast server when payment is confirmed
// ─────────────────────────────────────────────────────────────────
app.post('/api/payfast-notify', async (c) => {
    try {
        const body          = await c.req.parseBody();
        const paymentStatus = body['payment_status'] as string;
        const paymentId     = body['m_payment_id']   as string;
        const customData    = body['custom_str1']     as string;

        console.log(`[PayFast IPN] ${paymentId} — ${paymentStatus}`);

        if (paymentStatus === 'COMPLETE') {
            console.log(`[PayFast] Payment complete: ${paymentId}`);

            // Parse the business data payload stored in custom_str1
            try {
                const data = JSON.parse(customData || '{}');
                if (data.project_id && data.name) {
                    // Generate the site server-side on payment confirmation
                    // This is the fallback in case the browser-side trigger failed
                    const projectDir = `${projectsRoot}/${data.project_id}`;
                    if (!existsSync(projectDir)) mkdirSync(projectDir, { recursive: true });

                    // Only generate if not already done
                    if (!existsSync(`${projectDir}/index.html`)) {
                        const html = await generateSite(data);
                        writeFileSync(`${projectDir}/index.html`, html);
                        writeFileSync(`${projectDir}/build-status.json`, JSON.stringify({
                            status:     'complete',
                            built_at:   new Date().toISOString(),
                            project_id: data.project_id
                        }));
                        console.log(`[PayFast] Site generated for ${data.project_id}`);
                    }
                }
            } catch (parseErr) {
                console.error('[PayFast] Could not parse custom_str1:', parseErr);
            }
        }

        // PayFast requires a 200 OK response — always return it
        return c.text('OK', 200);

    } catch (error: any) {
        console.error('[PayFast IPN Error]:', error);
        // Still return 200 so PayFast does not keep retrying
        return c.text('OK', 200);
    }
});

// ─────────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────────
const port = Number(process.env.PORT) || 7777;
console.log(`FORGE OPERATIONAL ON PORT ${port}`);
console.log(`Routes active:`);
console.log(`  GET  *                    — static file server`);
console.log(`  POST /api/forge           — site refactor (ingest URL)`);
console.log(`  POST /api/generate-site   — SiteBuild Studio (from scratch)`);
console.log(`  POST /api/payfast-notify  — PayFast IPN handler`);

serve({ fetch: app.fetch, port });

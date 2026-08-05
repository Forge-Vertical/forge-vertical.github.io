import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { cors } from 'hono/cors';
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

// CORS — allow the GitHub Pages frontend to call this server
app.use('*', cors({
    origin: [
        'https://forge-vertical.github.io',
        'https://www.forgevertical.com',
        'http://localhost:7777',
        'http://localhost:3000',
    ],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
}));

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
        const siteData       = await ingestSite(url);
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
// NEW: SiteBuild Studio — trigger build
// POST /api/trigger-build
// Body: business data JSON from sitebuild-intake.html
//
// This endpoint:
// 1. Validates the payload
// 2. Uses YOUR_FORGE_WRITE_TOKEN (from .env / GitHub secret) to write
//    build-request.json to the repo — NEVER exposing the token to the browser
// 3. Returns the project_id so the browser can poll for completion
// ─────────────────────────────────────────────────────────────────
app.post('/api/trigger-build', async (c) => {
    try {
        const data = await c.req.json();

        // Basic validation
        if (!data.name || !data.industry) {
            return c.json({ error: 'Business name and industry are required' }, 400);
        }

        // Sanitise pages
        if (!Array.isArray(data.pages) || data.pages.length === 0) {
            data.pages = ['Home', 'Services', 'Contact'];
        }

        // Generate a project ID if not provided
        if (!data.project_id) {
            data.project_id = 'FV-' + Date.now();
        }

        const FORGE_REPO        = 'Forge-Vertical/forge-vertical.github.io';
        const FORGE_WRITE_TOKEN = process.env.YOUR_FORGE_WRITE_TOKEN;

        if (!FORGE_WRITE_TOKEN) {
            console.error('YOUR_FORGE_WRITE_TOKEN not set in environment');
            return c.json({ error: 'Server configuration error — token not set' }, 500);
        }

        // Write build-request.json to vertical-projects/{project_id}/
        // This push triggers FORGE_SITEBUILD.yml via paths filter
        const filePath = `vertical-projects/${data.project_id}/build-request.json`;
        const content  = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

        const ghRes = await fetch(
            `https://api.github.com/repos/${FORGE_REPO}/contents/${filePath}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${FORGE_WRITE_TOKEN}`,
                    'Content-Type':  'application/json',
                    'User-Agent':    'ForgeVertical-SiteBuild/1.0',
                },
                body: JSON.stringify({
                    message: `forge: build request ${data.project_id}`,
                    content,
                })
            }
        );

        if (!ghRes.ok) {
            const err = await ghRes.json() as any;
            throw new Error(`GitHub API error: ${err.message || ghRes.status}`);
        }

        console.log(`[SiteBuild] Build request submitted: ${data.project_id}`);

        // Return project_id — browser will poll the public GitHub Pages URL
        // for build-status.json (no token needed, it's a public file)
        return c.json({
            status:     'Submitted',
            project_id: data.project_id,
            poll_url:   `https://forge-vertical.github.io/vertical-projects/${data.project_id}/build-status.json`,
            result_url: `https://forge-vertical.github.io/vertical-projects/${data.project_id}/index.html`,
        });

    } catch (error: any) {
        console.error('[SiteBuild Error]:', error);
        return c.json({ error: error.message }, 500);
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

            try {
                const data = JSON.parse(customData || '{}');
                if (data.project_id && data.name) {
                    // Trigger build via GitHub API using server-side token
                    const FORGE_REPO        = 'Forge-Vertical/forge-vertical.github.io';
                    const FORGE_WRITE_TOKEN = process.env.YOUR_FORGE_WRITE_TOKEN;

                    if (FORGE_WRITE_TOKEN) {
                        const filePath = `vertical-projects/${data.project_id}/build-request.json`;
                        const content  = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

                        await fetch(
                            `https://api.github.com/repos/${FORGE_REPO}/contents/${filePath}`,
                            {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `token ${FORGE_WRITE_TOKEN}`,
                                    'Content-Type':  'application/json',
                                    'User-Agent':    'ForgeVertical-SiteBuild/1.0',
                                },
                                body: JSON.stringify({
                                    message: `forge: build request ${data.project_id} (PayFast confirmed)`,
                                    content,
                                })
                            }
                        );
                        console.log(`[PayFast] Build triggered for ${data.project_id}`);
                    }
                }
            } catch (parseErr) {
                console.error('[PayFast] Could not parse custom_str1:', parseErr);
            }
        }

        // PayFast requires 200 OK — always return it
        return c.text('OK', 200);

    } catch (error: any) {
        console.error('[PayFast IPN Error]:', error);
        return c.text('OK', 200);
    }
});

// ─────────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────────
const port = Number(process.env.PORT) || 7777;
console.log(`\nFORGE OPERATIONAL ON PORT ${port}`);
console.log(`Routes active:`);
console.log(`  GET  *                     — static file server`);
console.log(`  POST /api/forge            — site refactor (ingest URL)`);
console.log(`  POST /api/trigger-build    — SiteBuild Studio trigger`);
console.log(`  POST /api/payfast-notify   — PayFast IPN handler\n`);

serve({ fetch: app.fetch, port });

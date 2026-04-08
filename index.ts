import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import mime from 'mime-types'; 
import 'dotenv/config';

import { ingestSite } from './ingestor';
import { refactorToTailwind } from './forge';

const app = new Hono();
const enginePath = './forge-engine';
const projectsRoot = './vertical-projects';

// Initialize Infrastructure
[enginePath, projectsRoot].forEach(path => {
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
});

/**
 * MANUAL INDUSTRIAL FILE SERVER
 * Serves index.html, CSS, and MP4 videos directly from the cloud.
 */
app.get('*', (c) => {
    const url = new URL(c.req.url);
    let path = url.pathname === '/' ? './index.html' : `.${url.pathname}`;
    
    // Auth for the Engine Preview
    if (path.includes('forge-engine')) {
        const auth = c.req.query('auth');
        if (auth !== 'success' && auth !== 'VFKNMJUBYQQG6') {
            return c.redirect('/build?error=unauthorized');
        }
    }

    if (existsSync(path)) {
        const content = readFileSync(path);
        const contentType = mime.lookup(path) || 'application/octet-stream';
        return c.body(content, 200, { 'Content-Type': contentType });
    }
    
    return c.text("404: Forge Asset Missing", 404);
});

/**
 * API: FORGE SIGNAL
 */
app.post('/api/forge', async (c) => {
    try {
        const { url } = await c.req.json();
        const siteData = await ingestSite(url);
        const refactoredHtml = await refactorToTailwind(siteData.html);
        writeFileSync(`${enginePath}/index.html`, refactoredHtml);
        return c.json({ status: 'Forged', downloadUrl: '/forge-engine/index.html?auth=VFKNMJUBYQQG6' });
    } catch (error: any) {
        return c.json({ status: 'Error', message: error.message }, 500);
    }
});

const port = Number(process.env.PORT) || 7777;
console.log(`ULTRALIGHT ENGINE LIVE: Port ${port}`);
serve({ fetch: app.fetch, port });

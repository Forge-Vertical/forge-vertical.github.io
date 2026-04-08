import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import 'dotenv/config';

import { ingestSite } from './ingestor';
import { refactorToTailwind } from './forge';

const app = new Hono();
const enginePath = './forge-engine';
const projectsRoot = './vertical-projects';

// Initialize Folders
[enginePath, projectsRoot].forEach(path => {
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
});

/**
 * SOVEREIGN FILE SERVER (No external libraries required)
 */
app.get('*', (c) => {
    const url = new URL(c.req.url);
    let path = url.pathname === '/' ? './index.html' : `.${url.pathname}`;
    
    // Auth Check
    if (path.includes('forge-engine')) {
        const auth = c.req.query('auth');
        if (auth !== 'success' && auth !== 'VFKNMJUBYQQG6') return c.redirect('/build?error=unauthorized');
    }

    if (existsSync(path)) {
        const content = readFileSync(path);
        const ext = path.split('.').pop()?.toLowerCase();
        
        // Manual Map (Out-of-the-box support for your specific assets)
        const mimeMap: Record<string, string> = {
            'html': 'text/html',
            'css': 'text/css',
            'js': 'application/javascript',
            'mp4': 'video/mp4',
            'png': 'image/png',
            'jpg': 'image/jpeg'
        };

        return c.body(content, 200, { 'Content-Type': mimeMap[ext || 'html'] || 'text/plain' });
    }
    return c.text("404: Asset Missing", 404);
});

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
console.log(`FORGE OPERATIONAL ON PORT ${port}`);
serve({ fetch: app.fetch, port });

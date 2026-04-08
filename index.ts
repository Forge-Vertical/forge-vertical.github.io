import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/static';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import 'dotenv/config';

import { ingestSite } from './ingestor';
import { refactorToTailwind } from './forge';

const app = new Hono();
const enginePath = './forge-engine';

if (!existsSync(enginePath)) {
    mkdirSync(enginePath);
}

// GATEKEEPER: Paywall Protection
app.get('/forge-engine/index.html', (c) => {
  const auth = c.req.query('auth');
  if (auth === 'success' || auth === 'VFKNMJUBYQQG6') {
    try {
        const html = readFileSync('./forge-engine/index.html', 'utf-8');
        return c.html(html);
    } catch (e) {
        return c.text("Forge Error: Terminal UI missing.");
    }
  } else {
    return c.redirect('/build?error=unauthorized');
  }
});

app.use('/assets/*', serveStatic({ root: './' }));
app.use('/forge-engine/assets/*', serveStatic({ root: './' }));

app.get('/', (c) => c.html(readFileSync('./index.html', 'utf-8')));
app.get('/build', (c) => c.html(readFileSync('./build.html', 'utf-8')));

// THE INITIAL FORGE API
app.post('/api/forge', async (c) => {
  try {
    const { url } = await c.req.json();
    const siteData = await ingestSite(url);
    const refactoredHtml = await refactorToTailwind(siteData.html);
    writeFileSync(`${enginePath}/index.html`, refactoredHtml);

    return c.json({ 
      status: 'Forged', 
      downloadUrl: '/forge-engine/index.html?auth=VFKNMJUBYQQG6'
    });
  } catch (error) {
    return c.json({ status: 'Error' }, 500);
  }
});

// THE REFACTOR API (For "Ask Gemini" custom changes)
app.post('/api/refactor', async (c) => {
  try {
    const { prompt } = await c.req.json();
    const currentHtml = readFileSync(`${enginePath}/index.html`, 'utf-8');
    
    // We send the current code + the new instruction to Gemini
    const updatedHtml = await refactorToTailwind(`CURRENT CODE: ${currentHtml}\n\nUSER REQUEST: ${prompt}`);
    writeFileSync(`${enginePath}/index.html`, updatedHtml);

    return c.json({ status: 'Updated' });
  } catch (error) {
    return c.json({ status: 'Error' }, 500);
  }
});

const port = Number(process.env.PORT) || 7777;
serve({ fetch: app.fetch, port });
console.log(`FORGE OPERATIONAL AT http://localhost:${port}`);

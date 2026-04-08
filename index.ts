import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/static';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import 'dotenv/config';

// Import our Logic Gates
import { ingestSite } from './ingestor';
import { refactorToTailwind } from './forge';

const app = new Hono();

// Ensure critical directories exist
const enginePath = './forge-engine';
if (!existsSync(enginePath)) {
    mkdirSync(enginePath);
}

// Serve static assets (MP4s, icons, etc.)
app.use('/assets/*', serveStatic({ root: './' }));
app.use('/forge-engine/*', serveStatic({ root: './' }));

// 1. Serve the Sovereign UI (Main Dashboard)
app.get('/', (c) => {
  try {
    const html = readFileSync('./index.html', 'utf-8');
    return c.html(html);
  } catch (e) {
    return c.text("Infrastructure Error: index.html missing from root.");
  }
});

// 2. Serve the Build UI (The $50 SaaS Terminal)
app.get('/build', (c) => {
    try {
      const html = readFileSync('./build.html', 'utf-8');
      return c.html(html);
    } catch (e) {
      return c.text("Infrastructure Error: build.html missing from root.");
    }
});

// 3. THE FORGE API: Ingest -> Refactor -> Deploy
app.post('/api/forge', async (c) => {
  try {
    const { url, host, pass } = await c.req.json();
    
    console.log(`[SIGNAL RECEIVED]: Processing ${url}`);
    if (host) console.log(`[DEPLOYMENT TARGET]: Prepared for ${host}`);

    // GATE 1: Ingest via Playwright
    const siteData = await ingestSite(url);
    console.log(`[INGESTION COMPLETE]: Source identified as "${siteData.title}"`);

    // GATE 2: Refactor via Gemini 2.5 Flash
    console.log(`[FORGE START]: Refactoring architecture to Industrial Tailwind...`);
    const refactoredHtml = await refactorToTailwind(siteData.html);

    // GATE 3: Write to the Sovereign Engine Folder
    const outputPath = `${enginePath}/index.html`;
    writeFileSync(outputPath, refactoredHtml);
    
    // NOTE: Here is where your FTP deployment logic would trigger 
    // using the 'host' and 'pass' variables provided by the UI.
    console.log(`[DEPLOYMENT READY]: Sovereign code written to ${outputPath}`);

    return c.json({ 
      status: 'Forged', 
      project: siteData.title,
      downloadUrl: '/forge-engine/index.html'
    });

  } catch (error) {
    console.error(`[FORGE FAILURE]:`, error);
    return c.json({ 
        status: 'Error', 
        message: 'Infrastructure collapse during refactor. Verify Gemini API Key.' 
    }, 500);
  }
});

const port = Number(process.env.PORT) || 7777;

console.log(`
   FORGE VERTICAL | PRINCIPAL ARCHITECTURE
   ---------------------------------------
   UI Terminal : http://localhost:${port}
   SaaS Build  : http://localhost:${port}/build
   Engine Path : ${enginePath}
   Status      : SYSTEM OPERATIONAL
`);

serve({ fetch: app.fetch, port });

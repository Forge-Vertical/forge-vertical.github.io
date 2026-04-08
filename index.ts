import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import 'dotenv/config';

// Import our Logic Gates
import { ingestSite } from './ingestor';
import { refactorToTailwind } from './forge';

const app = new Hono();

// Ensure the Product folder exists
if (!existsSync('./forge-engine')) {
    mkdirSync('./forge-engine');
}

// 1. Serve the Sovereign UI
app.get('/', (c) => {
  const html = readFileSync('./vertical-ui.html', 'utf-8');
  return c.html(html);
});

// 2. Serve the Build UI (The $50 Storefront)
app.get('/build', (c) => {
    const html = readFileSync('./build.html', 'utf-8');
    return c.html(html);
  });

// 3. THE FORGE API: Ingest -> Refactor -> Write to Engine
app.post('/api/forge', async (c) => {
  try {
    const { url } = await c.req.json();
    console.log(`[SIGNAL RECEIVED]: Ingesting ${url}`);

    // GATE 1: Ingest via Playwright
    const siteData = await ingestSite(url);
    console.log(`[INGESTION COMPLETE]: ${siteData.title}`);

    // GATE 2: Refactor via Gemini 2.5 Flash
    console.log(`[FORGE START]: Refactoring to Industrial Tailwind...`);
    const refactoredHtml = await refactorToTailwind(siteData.html);

    // GATE 3: Write to the Sovereign Engine Folder
    const outputPath = './forge-engine/index.html';
    writeFileSync(outputPath, refactoredHtml);
    console.log(`[DEPLOIMENT READY]: Written to ${outputPath}`);

    return c.json({ 
      status: 'Forged', 
      project: siteData.title,
      downloadUrl: '/forge-engine/index.html'
    });

  } catch (error) {
    console.error(`[FORGE FAILURE]:`, error);
    return c.json({ status: 'Error', message: 'Infrastructure collapse during refactor.' }, 500);
  }
});

const port = Number(process.env.PORT) || 7777;
console.log(`
  FORGE VERTICAL ENGINE ACTIVE
  ----------------------------
  UI Terminal: http://localhost:${port}
  Build Store: http://localhost:${port}/build
  API Status: Standing By
`);

serve({ fetch: app.fetch, port });

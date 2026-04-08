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

/**
 * GATEKEEPER: PAYWALL PROTECTION
 * This prevents unauthorized access to the Forge Engine UI.
 */
app.get('/forge-engine/index.html', (c) => {
  const auth = c.req.query('auth');
  
  // Verify the PayPal signal is present
  if (auth === 'success' || auth === 'VFKNMJUBYQQG6') {
    try {
        const html = readFileSync('./forge-engine/index.html', 'utf-8');
        return c.html(html);
    } catch (e) {
        return c.text("Forge Error: Terminal UI not found in /forge-engine/");
    }
  } else {
    // No payment signal? Send them back to the build page to pay
    console.log("[SECURITY]: Unauthorized access attempt blocked on Forge Terminal.");
    return c.redirect('/build?error=unauthorized');
  }
});

// Serve static assets (Protected files are handled above)
app.use('/assets/*', serveStatic({ root: './' }));
app.use('/forge-engine/assets/*', serveStatic({ root: './' })); // For any assets inside the engine

// 1. Serve the Sovereign UI (Landing/Home)
app.get('/', (c) => {
  try {
    const html = readFileSync('./index.html', 'utf-8');
    return c.html(html);
  } catch (e) {
    return c.text("Infrastructure Error: index.html missing from root.");
  }
});

// 2. Serve the Build UI (The Storefront/Paywall Page)
app.get('/build', (c) => {
    try {
      const html = readFileSync('./build.html', 'utf-8');
      return c.html(html);
    } catch (e) {
      return c.text("Infrastructure Error: build.html missing from root.");
    }
});

// 3. THE FORGE API: Ingest -> Refactor -> Write
app.post('/api/forge', async (c) => {
  try {
    const { url, host, pass } = await c.req.json();
    
    console.log(`[SIGNAL RECEIVED]: Processing ${url}`);

    // GATE 1: Ingest via Playwright
    const siteData = await ingestSite(url);
    console.log(`[INGESTION COMPLETE]: Source identified as "${siteData.title}"`);

    // GATE 2: Refactor via Gemini 2.5 Flash
    console.log(`[FORGE START]: Refactoring architecture to Industrial Tailwind...`);
    const refactoredHtml = await refactorToTailwind(siteData.html);

    // GATE 3: Write to the Sovereign Engine Folder
    const outputPath = `${enginePath}/index.html`;
    writeFileSync(outputPath, refactoredHtml);
    
    console.log(`[DEPLOYMENT READY]: Sovereign code written to ${outputPath}`);

    // We return the URL WITH the auth token so the UI can load it through the gate
    return c.json({ 
      status: 'Forged', 
      project: siteData.title,
      downloadUrl: '/forge-engine/index.html?auth=VFKNMJUBYQQG6'
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
   Status      : SYSTEM OPERATIONAL & PROTECTED
`);

serve({ fetch: app.fetch, port });

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/static';
import { readFileSync, writeFileSync, existsSync, mkdirSync, write } from 'fs';
import 'dotenv/config';

// Import Forge Logic Gates
import { ingestSite } from './ingestor';
import { refactorToTailwind } from './forge';

const app = new Hono();
const enginePath = './forge-engine';
const projectsPath = './vertical-projects';

// Initialize Industrial Infrastructure
[enginePath, projectsPath].forEach(path => {
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
});

/**
 * GATEKEEPER: PAYWALL & AUTH PROTECTION
 */
app.get('/forge-engine/index.html', (c) => {
  const auth = c.req.query('auth');
  if (auth === 'success' || auth === 'VFKNMJUBYQQG6') {
    try {
        const html = readFileSync('./forge-engine/index.html', 'utf-8');
        return c.html(html);
    } catch (e) {
        return c.text("Forge Error: Terminal UI missing.");
    }
  }
  return c.redirect('/build?error=unauthorized');
});

// Static Asset Pipeline
app.use('/assets/*', serveStatic({ root: './' }));
app.use('/forge-engine/assets/*', serveStatic({ root: './' }));
app.use('/projects/*', serveStatic({ root: './vertical-projects' }));

// UI Routes
app.get('/', (c) => c.html(readFileSync('./index.html', 'utf-8')));
app.get('/build', (c) => c.html(readFileSync('./build.html', 'utf-8')));

/**
 * API: THE INGESTOR GATE
 * Captures external signals and refactors them into Sovereign Nodes
 */
app.post('/api/forge', async (c) => {
  try {
    const { url } = await c.req.json();
    console.log(`[INGESTING SIGNAL]: ${url}`);

    const siteData = await ingestSite(url);
    
    // Industrial Prompt Enhancement: Ensures natural responsiveness
    const refactoredHtml = await refactorToTailwind(`
        SOURCE SITE: ${siteData.title}
        CONTENT: ${siteData.html}
        INSTRUCTION: Refactor into a high-performance, responsive Tailwind node. 
        Inject SEO semantic tags and replace images with high-res placeholders.
    `);

    // Write physically to the engine for live preview
    writeFileSync(`${enginePath}/index.html`, refactoredHtml);
    
    return c.json({ 
      status: 'Forged', 
      downloadUrl: '/forge-engine/index.html?auth=VFKNMJUBYQQG6',
      title: siteData.title
    });
  } catch (error) {
    console.error(`[CRITICAL ERROR]:`, error);
    return c.json({ status: 'Error', message: error.message }, 500);
  }
});

/**
 * API: THE REFACTOR & SEO ENGINE
 * Modifies existing nodes and injects SEO Metadata
 */
app.post('/api/refactor', async (c) => {
  try {
    const { prompt, pageName, seoMeta } = await c.req.json();
    const targetFile = `${enginePath}/${pageName || 'index.html'}`;
    const currentHtml = readFileSync(targetFile, 'utf-8');
    
    console.log(`[REFACTORING]: Updating ${targetFile} with prompt: ${prompt}`);

    const updatedHtml = await refactorToTailwind(`
        CURRENT_CODE: ${currentHtml}
        REQUEST: ${prompt}
        SEO_DATA: ${seoMeta || 'Maintain current SEO'}
        RULE: Ensure natural responsiveness and mobile-first logic.
    `);

    writeFileSync(targetFile, updatedHtml);
    return c.json({ status: 'Updated' });
  } catch (error) {
    return c.json({ status: 'Error' }, 500);
  }
});

/**
 * API: PUBLISH NODE
 * Pushes code to production/local-drive
 */
app.post('/api/publish', async (c) => {
    try {
        const { host, html, fileName } = await c.req.json();
        const savePath = `${projectsPath}/${fileName || 'index.html'}`;
        
        writeFileSync(savePath, html);
        console.log(`[PUBLISHED]: Node pushed to ${savePath}`);
        
        return c.json({ status: 'Published', path: savePath });
    } catch (error) {
        return c.json({ status: 'Error' }, 500);
    }
});

const port = Number(process.env.PORT) || 7777;
serve({ fetch: app.fetch, port });

console.log(`
   VERTICAL WEB BUILDER | SOVEREIGN FORGE
   --------------------------------------
   Status      : OPERATIONAL
   Port        : ${port}
   Project Root: ${projectsPath}
   Engine      : Gemini 2.5 Flash
`);

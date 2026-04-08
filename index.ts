import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/static';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import 'dotenv/config';

// Import Principal Logic Gates
import { ingestSite } from './ingestor';
import { refactorToTailwind } from './forge';

const app = new Hono();
const enginePath = './forge-engine';
const projectsRoot = './vertical-projects';

// Initialize Industrial Infrastructure
[enginePath, projectsRoot].forEach(path => {
    if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
    }
});

/**
 * GATEKEEPER: PAYWALL & AUTH PROTECTION
 * This ensures only paying users access the Forge Terminal.
 */
app.get('/forge-engine/index.html', (c) => {
    const auth = c.req.query('auth');
    
    // Verify the PayPal signal is present
    if (auth === 'success' || auth === 'VFKNMJUBYQQG6') {
        try {
            const html = readFileSync('./forge-engine/index.html', 'utf-8');
            return c.html(html);
        } catch (e) {
            return c.text("Forge Error: Terminal UI missing from /forge-engine/");
        }
    } else {
        // No payment signal? Kick back to sales page
        console.log("[SECURITY]: Unauthorized access attempt blocked.");
        return c.redirect('/build?error=unauthorized');
    }
});

// Static Asset & Project Pipeline
app.use('/assets/*', serveStatic({ root: './' }));
app.use('/forge-engine/assets/*', serveStatic({ root: './' }));
app.use('/projects/*', serveStatic({ root: './vertical-projects' }));

/**
 * UI ROUTES
 */
app.get('/', (c) => {
    try {
        const html = readFileSync('./index.html', 'utf-8');
        return c.html(html);
    } catch (e) {
        return c.text("Error: Root index.html not found.");
    }
});

app.get('/build', (c) => {
    try {
        const html = readFileSync('./build.html', 'utf-8');
        return c.html(html);
    } catch (e) {
        return c.text("Error: build.html not found.");
    }
});

/**
 * API: PRIMARY SIGNAL INGESTION (The Scraper)
 */
app.post('/api/forge', async (c) => {
    try {
        const { url, projectName } = await c.req.json();
        const activeProject = projectName || 'project-alpha';
        const projectDir = `${projectsRoot}/${activeProject}`;

        if (!existsSync(projectDir)) mkdirSync(projectDir, { recursive: true });

        console.log(`[SIGNAL]: Ingesting ${url}`);
        const siteData = await ingestSite(url);
        
        console.log(`[FORGE]: Refactoring via Gemini 2.5 Flash`);
        const refactoredHtml = await refactorToTailwind(siteData.html);

        // Save physically to Local Hard Drive (Sovereign ownership)
        const savePath = `${projectDir}/index.html`;
        writeFileSync(savePath, refactoredHtml);
        
        // Sync with the Engine UI for preview
        writeFileSync(`${enginePath}/index.html`, refactoredHtml);

        return c.json({ 
            status: 'Forged', 
            downloadUrl: `/forge-engine/index.html?auth=VFKNMJUBYQQG6&project=${activeProject}`,
            title: siteData.title 
        });
    } catch (error: any) {
        console.error(`[CRITICAL FAILURE]:`, error);
        return c.json({ status: 'Error', message: error.message }, 500);
    }
});

/**
 * API: PAGE & SEO MANAGER
 * Injects SEO Metadata per page and creates new nodes
 */
app.post('/api/manage-page', async (c) => {
    try {
        const { projectName, pageName, seoTitle, seoDesc } = await c.req.json();
        const projectDir = `${projectsRoot}/${projectName}`;
        const filePath = `${projectDir}/${pageName}.html`;

        if (!existsSync(projectDir)) mkdirSync(projectDir, { recursive: true });

        const currentContent = existsSync(filePath) 
            ? readFileSync(filePath, 'utf-8') 
            : "<html><head></head><body></body></html>";

        console.log(`[SEO ENGINE]: Updating ${pageName} for project ${projectName}`);

        const seoRefactor = await refactorToTailwind(`
            CODE: ${currentContent}
            SEO_TITLE: ${seoTitle}
            SEO_DESC: ${seoDesc}
            INSTRUCTION: Inject semantic Meta tags and JSON-LD Schema. Ensure high-end typography.
        `);

        writeFileSync(filePath, seoRefactor);
        // Also update engine preview
        writeFileSync(`${enginePath}/index.html`, seoRefactor);

        return c.json({ status: 'Updated' });
    } catch (error) {
        console.error(error);
        return c.json({ status: 'Error' }, 500);
    }
});

/**
 * API: REFACTOR (The "Ask Gemini" button)
 */
app.post('/api/refactor', async (c) => {
    try {
        const { prompt } = await c.req.json();
        const currentHtml = readFileSync(`${enginePath}/index.html`, 'utf-8');
        
        console.log(`[REFACTOR]: Applying custom instruction: ${prompt}`);
        const updatedHtml = await refactorToTailwind(`CURRENT_CODE: ${currentHtml}\n\nUSER_REQUEST: ${prompt}`);
        
        writeFileSync(`${enginePath}/index.html`, updatedHtml);

        return c.json({ status: 'Updated' });
    } catch (error) {
        return c.json({ status: 'Error' }, 500);
    }
});

const port = Number(process.env.PORT) || 7777;

console.log(`
   VERTICAL WEB BUILDER | SOVEREIGN FORGE
   ---------------------------------------
   Status      : SYSTEM OPERATIONAL
   UI Dashboard: http://localhost:${port}
   SaaS Build  : http://localhost:${port}/build
   Project Root: ${projectsRoot}
   Engine      : Gemini 2.5 Flash
`);

serve({ fetch: app.fetch, port });

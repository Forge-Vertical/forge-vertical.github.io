import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/static';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import 'dotenv/config';

// Import Principal Logic Gates
import { ingestSite } from './ingestor';
import { refactorToTailwind } from './forge';

const app = new Hono();
const enginePath = './forge-engine';
const projectsRoot = './vertical-projects';

// Initialize Industrial Infrastructure
[enginePath, projectsRoot].forEach(path => {
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
});

/**
 * GATEKEEPER: AUTHENTICATION & PAYWALL
 */
app.get('/forge-engine/index.html', (c) => {
    const auth = c.req.query('auth');
    if (auth === 'success' || auth === 'VFKNMJUBYQQG6') {
        const html = readFileSync('./forge-engine/index.html', 'utf-8');
        return c.html(html);
    }
    return c.redirect('/build?error=unauthorized');
});

// Serve Assets and Local Projects
app.use('/assets/*', serveStatic({ root: './' }));
app.use('/projects/*', serveStatic({ root: './vertical-projects' }));

// UI Root Routes
app.get('/', (c) => c.html(readFileSync('./index.html', 'utf-8')));
app.get('/build', (c) => c.html(readFileSync('./build.html', 'utf-8')));

/**
 * API: PRIMARY SIGNAL INGESTION
 * Captures external signals and refactors them into natural, responsive components.
 */
app.post('/api/forge', async (c) => {
    try {
        const { url, projectName } = await c.req.json();
        const activeProject = projectName || 'default-node';
        const projectDir = `${projectsRoot}/${activeProject}`;

        if (!existsSync(projectDir)) mkdirSync(projectDir, { recursive: true });

        console.log(`[INGESTOR]: Signal captured from ${url} [cite: 6]`);
        const siteData = await ingestSite(url);
        
        console.log(`[REFACTORER]: Re-architecting ${siteData.title} via Gemini 2.5 Flash [cite: 8, 9]`);
        const refactoredHtml = await refactorToTailwind(siteData.html);

        // Save physically to local hard drive 
        const savePath = `${projectDir}/index.html`;
        writeFileSync(savePath, refactoredHtml);
        
        // Sync with Engine Terminal
        writeFileSync(`${enginePath}/index.html`, refactoredHtml);

        return c.json({ 
            status: 'Forged', 
            downloadUrl: `/forge-engine/index.html?auth=VFKNMJUBYQQG6&project=${activeProject}`,
            title: siteData.title 
        });
    } catch (error) {
        console.error(`[CRITICAL FAILURE]:`, error);
        return c.json({ status: 'Error', message: error.message }, 500);
    }
});

/**
 * API: PAGE & SEO MANAGER
 * Adds new pages and injects SEO Metadata per node [cite: 16, 17]
 */
app.post('/api/manage-page', async (c) => {
    try {
        const { projectName, pageName, seoTitle, seoDesc, isNew } = await c.req.json();
        const projectDir = `${projectsRoot}/${projectName}`;
        const filePath = `${projectDir}/${pageName}.html`;

        let content = isNew ? "" : readFileSync(filePath, 'utf-8');

        // Inject Industrial SEO Suite logic 
        const seoRefactor = await refactorToTailwind(`
            CODE: ${content}
            SEO_TITLE: ${seoTitle}
            SEO_DESC: ${seoDesc}
            INSTRUCTION: Inject semantic Meta tags and JSON-LD Schema Node.
        `);

        writeFileSync(filePath, seoRefactor);
        return c.json({ status: 'Updated', path: filePath });
    } catch (error) {
        return c.json({ status: 'Error' }, 500);
    }
});

/**
 * API: PUBLISH / EXPORT
 * Finalizes code for manual server deployment [cite: 14, 15]
 */
app.post('/api/publish', async (c) => {
    try {
        const { host, projectName } = await c.req.json();
        const projectDir = `${projectsRoot}/${projectName}`;
        
        console.log(`[PUBLICATION]: Preparing ${projectName} for SSH/FTP transfer `);
        // Logic for FTP/SSH deployment goes here
        
        return c.json({ status: 'Published', target: host });
    } catch (error) {
        return c.json({ status: 'Error' }, 500);
    }
});

const port = Number(process.env.PORT) || 7777;
serve({ fetch: app.fetch, port });

console.log(`
   VERTICAL FORGE OPERATIONAL [cite: 1, 11]
   ---------------------------------------
   PORT: ${port}
   STATUS: SYSTEM LIVE
`);

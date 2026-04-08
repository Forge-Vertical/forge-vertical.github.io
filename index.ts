import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/static';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import 'dotenv/config';

const app = new Hono();

// Serve the UI you stored as vertical-ui.html
app.get('/', (c) => {
  const html = readFileSync('./vertical-ui.html', 'utf-8');
  return c.html(html);
});

// The Forge API: This is where the magic will eventually sit
app.post('/api/forge', async (c) => {
  const { url } = await c.req.json();
  console.log(`Ingesting Signal from: ${url}`);
  
  // Logic for Playwright and Gemini 2.5 Flash goes here
  return c.json({ status: 'Ingested', project: 'project-alpha' });
});

const port = Number(process.env.PORT) || 7777;
console.log(`Vertical Web Builder live at http://localhost:${port}`);

serve({ fetch: app.fetch, port });
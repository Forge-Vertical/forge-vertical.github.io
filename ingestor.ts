import { chromium } from 'playwright';

export async function ingestSite(url: string) {
  console.log(`[INGESTOR]: Opening High-Bandwidth Signal for ${url}...`);
  
  // Launch with specific arguments to bypass bot detection that Mobirise-like sites often have
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-setuid-sandbox', '--no-sandbox'] 
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ForgeVertical/1.0 Sovereign-Architect'
  });

  const page = await context.newPage();

  try {
    // 1. Smart Navigation: We wait for 'domcontentloaded' first to avoid hanging on slow tracking pixels
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

    // 2. Interaction: Scroll slightly to trigger lazy-loaded blocks/images (common in modern templates)
    await page.mouse.wheel(0, 1000);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const data = await page.evaluate(() => {
      // 3. TARGETED STRIPPING: We keep classes but remove the "weight"
      const junk = document.querySelectorAll('script, iframe, noscript, svg, path, link[rel="prefetch"]');
      junk.forEach(el => el.remove());

      // 4. BLOCK IDENTIFICATION: Map out the "Mobirise" style blocks
      const sections = Array.from(document.querySelectorAll('section, header, footer, main, .container, [class*="block"]'));
      
      return {
        html: document.body.innerHTML,
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || "",
        // We capture the "Block Hierarchy" to help Gemini build a component list
        nodes: sections.map(s => ({
          tag: s.tagName,
          id: s.id,
          classes: s.className
        })).slice(0, 15) // Limit to top 15 nodes for token safety
      };
    });

    console.log(`[INGESTOR SUCCESS]: Hierarchy captured for "${data.title}"`);
    await browser.close();
    return data;

  } catch (error) {
    await browser.close();
    console.error(`[INGESTOR CRITICAL]: Signal Failure at ${url} - ${error.message}`);
    throw new Error(`Pipeline Blocked: ${error.message}`);
  }
}

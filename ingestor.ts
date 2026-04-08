import { chromium } from 'playwright';

export async function ingestSite(url: string) {
  console.log(`[INGESTOR]: Launching Headless Browser for ${url}...`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ForgeVertical/1.0'
  });

  const page = await context.newPage();

  try {
    // Navigate and wait for the network to settle
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const data = await page.evaluate(() => {
      // Clean the DOM before sending to AI to save tokens
      const scripts = document.querySelectorAll('script, style, iframe, noscript');
      scripts.forEach(s => s.remove());

      return {
        html: document.body.innerHTML,
        title: document.title,
      };
    });

    await browser.close();
    return data;
  } catch (error) {
    await browser.close();
    console.error(`[INGESTOR ERROR]: Failed to reach ${url}`);
    throw error;
  }
}

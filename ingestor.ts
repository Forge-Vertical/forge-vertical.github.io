import { chromium } from 'playwright';

export async function ingestSite(url: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  // Extract raw HTML and computed styles
  const data = await page.evaluate(() => {
    return {
      html: document.body.innerHTML,
      title: document.title,
      fonts: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => (l as HTMLLinkElement).href)
    };
  });

  await browser.close();
  return data;
}
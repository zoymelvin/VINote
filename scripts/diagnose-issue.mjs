import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  
  page.on("console", (msg) => console.log("CONSOLE:", msg.text()));
  page.on("pageerror", (err) => console.log("PAGEERROR:", err.message));

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const toastErrors = await page.evaluate(() => {
    const selectors = [
      '[data-nextjs-toast-errors]',
      '[data-nextjs-toast]',
      '.nextjs-toast',
      '[class*="toast-error"]',
      '[class*="error-overlay"]',
      'nextjs-portal'
    ];
    const results = {};
    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      if (els.length > 0) {
        results[sel] = els.length;
      }
    }
    return results;
  });
  console.log("Toast/error selectors:", toastErrors);

  const nextData = await page.evaluate(() => {
    return (window.__NEXT_DATA || {}).props?.pageProps || {};
  });
  console.log("Next data keys:", Object.keys(nextData));

  await browser.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

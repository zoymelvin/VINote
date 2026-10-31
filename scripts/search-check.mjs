import { chromium } from "playwright";

async function waitForServer(url, maxMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Server not ready");
}

async function run() {
  await waitForServer("http://localhost:3000/");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  await page.goto("http://localhost:3000/catatan/baru", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const titleInput = page.locator('input[placeholder*="Judul"]').first();
  await titleInput.fill("zebra123 unique note");
  await page.waitForTimeout(200);

  const editor = page.locator('.tiptap').first();
  await editor.click();
  await page.keyboard.type("This is a unique test note with zebra123 keyword.");
  await page.waitForTimeout(800);

  const url = page.url();
  console.log("note url:", url);

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  await page.keyboard.press("Control+k");
  await page.waitForTimeout(300);

  const searchInput = page.locator('input[placeholder*="Cari"]').first();
  await searchInput.fill("zebra123");
  await page.waitForTimeout(400);

  const results = await page.locator('button:has-text("zebra123")').count();
  console.log(`search results for zebra123: ${results}`);

  if (results > 0) {
    await page.locator('button:has-text("zebra123")').first().click();
    await page.waitForTimeout(500);
    console.log(`navigated to: ${page.url()}`);
  }

  await browser.close();
  console.log("search-check done");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

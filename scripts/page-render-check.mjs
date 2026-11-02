import { chromium } from "playwright";

const routes = [
  "/", "/riwayat", "/koleksi", "/koleksi/test", "/catatan/test",
  "/arsip", "/sampah", "/pengaturan", "/pengaturan/diagnostik",
];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 412, height: 860 },
];

let fail = 0;

const browser = await chromium.launch();
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push("console.error: " + msg.text());
  });

  for (const route of routes) {
    try {
      await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
    } catch (e) {
      errors.push(`goto ${route}: ${e.message}`);
    }
  }

  if (errors.length > 0) {
    fail++;
    console.log(`\nFAIL ${vp.name}:`);
    errors.forEach((e) => console.log("  " + e));
  } else {
    console.log(`OK ${vp.name}: all ${routes.length} routes rendered without errors`);
  }
  await page.close();
}
await browser.close();
console.log(`\nTotal failed viewports: ${fail}`);
process.exit(fail > 0 ? 1 : 0);
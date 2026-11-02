import { chromium } from "playwright";
import fs from "node:fs";

const routes = ["/", "/riwayat", "/koleksi", "/koleksi/test", "/arsip", "/sampah", "/pengaturan", "/pengaturan/diagnostik", "/catatan/test"];
const viewports = [
  { width: 1440, height: 900, name: "1440x900" },
  { width: 1280, height: 800, name: "1280x800" },
  { width: 768, height: 1024, name: "768x1024" },
];
const themes = ["light", "dark"];

const out = "/tmp/vinote-current";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
for (const vp of viewports) {
  for (const theme of themes) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    for (const route of routes) {
      try {
        await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(500);
        const file = `${out}/${route.replace(/\//g, "_") || "home"}-${theme}-${vp.name}.png`;
        await page.screenshot({ path: file, fullPage: true });
        console.log(`screenshot: ${file}`);
      } catch (e) {
        console.log(`failed ${route} ${theme} ${vp.name}: ${e.message}`);
      }
    }
    await page.close();
  }
}
await browser.close();
console.log("DONE");
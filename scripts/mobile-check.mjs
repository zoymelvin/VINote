import { chromium } from "playwright";
import fs from "node:fs";

const routes = ["/", "/riwayat", "/koleksi", "/koleksi/test", "/arsip", "/sampah", "/pengaturan", "/pengaturan/diagnostik", "/catatan/test"];
const viewports = [
  { width: 419, height: 860, name: "419x860" },
  { width: 390, height: 844, name: "390x844" },
  { width: 375, height: 667, name: "375x667" },
  { width: 428, height: 926, name: "428x926" },
];

const out = "/tmp/vinote-mobile-after";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
let failed = 0;
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  for (const route of routes) {
    await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    const result = await page.evaluate((route) => {
      const issues = [];
      const html = document.documentElement;
      const main = document.querySelector("main");
      const header = document.querySelector("header");
      const bottomBar = document.querySelector("nav.md\\:hidden");
      const fab = document.querySelector("button.md\\:hidden");
      const firstInput = document.querySelector("input");
      const smallestText = Array.from(document.querySelectorAll("*")).map(el => parseFloat(getComputedStyle(el).fontSize)).filter(s => s > 0).sort((a,b) => a-b)[0];

      if (main) {
        const rect = main.getBoundingClientRect();
        if (rect.left > 1) issues.push(`main.left=${rect.left}`);
        if (html.scrollWidth > html.clientWidth) issues.push(`scrollWidth=${html.scrollWidth} > clientWidth=${html.clientWidth}`);
      }

      if (header) {
        const hRect = header.getBoundingClientRect();
        if (hRect.width < window.innerWidth - 2) issues.push(`header.width=${hRect.width} < viewport=${window.innerWidth}`);
        const ctrlK = header.textContent?.includes("Ctrl");
        if (ctrlK) issues.push("header contains Ctrl K");
        const catatanBaru = header.textContent?.includes("Catatan baru");
        if (catatanBaru) issues.push("header contains Catatan baru");
      }

      if (firstInput && firstInput.offsetParent !== null) {
        const fs = parseFloat(getComputedStyle(firstInput).fontSize);
        if (fs < 16) issues.push(`input font=${fs}px < 16px`);
      }

      if (smallestText < 11) issues.push(`smallestText=${smallestText}px < 11px`);

      return { route, viewport: `${window.innerWidth}x${window.innerHeight}`, issues };
    }, route);

    if (result.issues.length > 0) {
      failed++;
      console.log(`FAIL ${vp.name} ${route}: ${result.issues.join(", ")}`);
    } else {
      console.log(`OK ${vp.name} ${route}`);
    }

    const file = `${out}/${route.replace(/\//g, "_") || "home"}-${vp.name}.png`;
    await page.screenshot({ path: file, fullPage: true });
  }
  await page.close();
}
await browser.close();
console.log(`\nFAILED: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
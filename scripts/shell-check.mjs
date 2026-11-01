import { chromium } from "playwright";

const routes = ["/", "/riwayat", "/koleksi", "/koleksi/test", "/arsip", "/sampah", "/pengaturan", "/pengaturan/diagnostik", "/catatan/test"];
const viewports = [
  { width: 419, height: 860, name: "419x860" },
  { width: 390, height: 844, name: "390x844" },
  { width: 375, height: 667, name: "375x667" },
  { width: 428, height: 926, name: "428x926" },
];

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
      const html = document.documentElement;
      const body = document.body;
      const main = document.querySelector("main");
      const aside = document.querySelector("aside");
      const header = document.querySelector("header");
      const firstContent = main ? main.querySelector("*") : null;

      const checks = {
        route,
        viewport: { w: window.innerWidth, h: window.innerHeight },
        scrollWidth: html.scrollWidth,
        clientWidth: html.clientWidth,
        mainLeft: main ? main.getBoundingClientRect().left : null,
        mainRight: main ? main.getBoundingClientRect().right : null,
        firstContentLeft: firstContent ? firstContent.getBoundingClientRect().left : null,
        asideLeft: aside ? aside.getBoundingClientRect().left : null,
        asideWidth: aside ? aside.getBoundingClientRect().width : null,
        headerFullWidth: header ? header.getBoundingClientRect().width >= window.innerWidth - 2 : false,
        rightOverflow: html.scrollWidth > html.clientWidth,
      };
      return checks;
    }, route);

    const issues = [];
    if (result.mainLeft > 1) issues.push(`main.left=${result.mainLeft} (>1)`);
    if (result.firstContentLeft > 17) issues.push(`firstContent.left=${result.firstContentLeft} (>17)`);
    if (result.rightOverflow) issues.push(`scrollWidth=${result.scrollWidth} > clientWidth=${result.clientWidth}`);
    if (!result.headerFullWidth) issues.push(`header not full width`);

    if (issues.length > 0) {
      failed++;
      console.log(`FAIL ${vp.name} ${route}: ${issues.join(", ")}`);
    } else {
      console.log(`OK ${vp.name} ${route}`);
    }
  }
  await page.close();
}
await browser.close();
console.log(`\nFAILED: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
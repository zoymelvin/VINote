import { chromium } from "playwright";
import fs from "node:fs";

const routes = ["/", "/riwayat", "/folder", "/pengaturan"];
const viewports = [
  { width: 390, height: 844, name: "390x844" },
  { width: 1440, height: 900, name: "1440x900" },
];
const themes = ["light", "dark"];

fs.mkdirSync("/tmp/vinote-ui", { recursive: true });

function rgbContrast(fg, bg) {
  function chan(c) {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }
  function lum(rgb) {
    return 0.2126 * chan(rgb[0]) + 0.7152 * chan(rgb[1]) + 0.0722 * chan(rgb[2]);
  }
  function toRgb(str) {
    const m = str.match(/\d+/g);
    return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
  }
  const l1 = lum(toRgb(fg));
  const l2 = lum(toRgb(bg));
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const browser = await chromium.launch();
for (const vp of viewports) {
  for (const theme of themes) {
    for (const route of routes) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);

      const metrics = await page.evaluate(() => {
        const visible = (el) => {
          if (!el) return false;
          const r = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return style.display !== "none" && style.visibility !== "hidden" && r.width > 0 && r.height > 0;
        };
        const navs = Array.from(document.querySelectorAll("aside, nav"));
        const visibleNavs = navs.filter((n) => (n.tagName === "ASIDE" || getComputedStyle(n).position === "fixed") && visible(n));
        const bottomNav = visibleNavs.find((n) => getComputedStyle(n).position === "fixed") || null;
        const bottomBar = bottomNav ? (bottomNav.querySelector(".safe-bottom") || bottomNav) : null;
        const main = document.querySelector("main");
        const content = main && main.firstElementChild ? main.firstElementChild : main;
        const buttons = Array.from(document.querySelectorAll("button, [role='button']")).filter(visible);
        const smallButtons = buttons
          .map((b) => {
            const r = b.getBoundingClientRect();
            return { w: Math.round(r.width), h: Math.round(r.height), label: (b.getAttribute("aria-label") || b.textContent || "").trim().slice(0, 30) };
          })
          .filter((b) => b.w < 44 || b.h < 44);
        const mainPaddingLeft = content ? (parseFloat(getComputedStyle(content).paddingLeft) || 0) : 0;
        const card = document.querySelector('[style*="var(--note"]');
        let cardContrast = null;
        if (card) {
          const cs = getComputedStyle(card);
          cardContrast = { fg: cs.color, bg: cs.backgroundColor };
        }
        return {
          visibleNavCount: visibleNavs.length,
          mainPaddingLeft,
          smallButtons,
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          bottomPadding: bottomBar ? (parseFloat(getComputedStyle(bottomBar).paddingBottom) || 0) : null,
          cardContrast,
        };
      });

      const routeSlug = route === "/" ? "home" : route.replace(/\//g, "");
      const file = `/tmp/vinote-ui/${routeSlug}-${theme}-${vp.name}.png`;
      await page.screenshot({ path: file, fullPage: true });

      console.log(`\n=== ${route} | ${theme} | ${vp.name} ===`);
      console.log(`visible nav systems: ${metrics.visibleNavCount} (expect 1)`);
      console.log(`main padding-left: ${metrics.mainPaddingLeft}px (expect >=16 on mobile)`);
      console.log(`horizontal scroll: ${metrics.scrollWidth} <= ${metrics.innerWidth} -> ${metrics.scrollWidth <= metrics.innerWidth}`);
      if (metrics.bottomPadding !== null) console.log(`bottom nav padding-bottom: ${metrics.bottomPadding}px (expect >=12)`);
      console.log(`undersized buttons: ${metrics.smallButtons.length}`);
      metrics.smallButtons.slice(0, 10).forEach((b) => console.log(`   ${b.w}x${b.h} ${b.label}`));
      if (metrics.cardContrast) {
        const ratio = rgbContrast(metrics.cardContrast.fg, metrics.cardContrast.bg);
        console.log(`card contrast: ${ratio.toFixed(2)} (${metrics.cardContrast.fg} on ${metrics.cardContrast.bg})`);
      }
      console.log(`screenshot: ${file}`);

      await page.close();
    }
  }
}
await browser.close();
console.log("\nDONE");
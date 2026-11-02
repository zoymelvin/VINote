import { chromium } from "playwright";

const routes = [
  { path: "/", name: "home" },
  { path: "/riwayat", name: "riwayat" },
  { path: "/koleksi", name: "koleksi" },
  { path: "/arsip", name: "arsip" },
  { path: "/pengaturan", name: "pengaturan" },
  { path: "/catatan/test", name: "catatan" },
];

const viewports = [
  { width: 413, height: 860, name: "413x860" },
  { width: 390, height: 844, name: "390x844" },
];

const browser = await chromium.launch();

for (const vp of viewports) {
  const page = await browser.newPage({ 
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.width === 390,
    hasTouch: vp.width === 390,
    deviceScaleFactor: vp.width === 390 ? 3 : 1,
  });
  
  for (const route of routes) {
    await page.goto(`http://localhost:3000${route.path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const result = await page.evaluate((routePath) => {
      const out = {
        route: routePath,
        viewport: { w: window.innerWidth, h: window.innerHeight },
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        headers: [],
        toolbars: [],
        mobileHeader: null,
        searchIcon: null,
        bottomBar: null,
      };

      // Find all header-like elements
      const headerSelectors = [
        'header',
        '[data-component="mobile-header"]',
        'div.sticky.top-0',
        'div.fixed.top-0',
      ];
      
      const seen = new Set();
      for (const sel of headerSelectors) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          if (seen.has(el)) continue;
          seen.add(el);
          const cs = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            out.headers.push({
              tag: el.tagName.toLowerCase(),
              cls: (el.className?.toString?.() || "").slice(0, 120),
              display: cs.display,
              position: cs.position,
              top: cs.top,
              height: rect.height,
              width: rect.width,
              left: rect.left,
              right: rect.right,
              text: el.textContent?.slice(0, 100) || "",
            });
          }
        }
      }

      // Toolbar elements
      const toolbarSelectors = [
        '[data-component="mobile-editor-toolbar"]',
        'div.flex.flex-wrap.items-center.gap-1',
        'div.rounded-2xl.bg-\\[var\\(--card\\)\\]',
      ];
      for (const sel of toolbarSelectors) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          if (seen.has(el)) continue;
          seen.add(el);
          const cs = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            out.toolbars.push({
              tag: el.tagName.toLowerCase(),
              cls: (el.className?.toString?.() || "").slice(0, 120),
              display: cs.display,
              position: cs.position,
              height: rect.height,
              width: rect.width,
              left: rect.left,
              right: rect.right,
              text: el.textContent?.slice(0, 100) || "",
            });
          }
        }
      }

      // Mobile header component
      const mh = document.querySelector('[data-component="mobile-header"]');
      if (mh) {
        const cs = getComputedStyle(mh);
        const rect = mh.getBoundingClientRect();
        out.mobileHeader = {
          cls: (mh.className?.toString?.() || "").slice(0, 120),
          display: cs.display,
          position: cs.position,
          height: rect.height,
          width: rect.width,
          left: rect.left,
          right: rect.right,
        };
      }

      // Search icon
      const searchBtn = document.querySelector('button[aria-label="Cari"]');
      if (searchBtn) {
        const cs = getComputedStyle(searchBtn);
        const rect = searchBtn.getBoundingClientRect();
        out.searchIcon = {
          cls: (searchBtn.className?.toString?.() || "").slice(0, 120),
          display: cs.display,
          width: rect.width,
          height: rect.height,
          left: rect.left,
          right: rect.right,
        };
      }

      // Bottom bar
      const bb = document.querySelector('nav.md\\:hidden, nav[style*="bottom"]');
      if (bb) {
        const cs = getComputedStyle(bb);
        const rect = bb.getBoundingClientRect();
        out.bottomBar = {
          cls: (bb.className?.toString?.() || "").slice(0, 120),
          display: cs.display,
          position: cs.position,
          bottom: cs.bottom,
          left: cs.left,
          right: cs.right,
          height: rect.height,
          width: rect.width,
          children: Array.from(bb.children).map(c => ({
            tag: c.tagName.toLowerCase(),
            cls: (c.className?.toString?.() || "").slice(0, 80),
            text: c.textContent?.slice(0, 30) || "",
            width: c.getBoundingClientRect().width,
          })),
        };
      }

      return out;
    }, route.path);

    console.log(`\n=== ${route.name} @ ${vp.name} ===`);
    console.log(`scrollWidth: ${result.scrollWidth}, clientWidth: ${result.clientWidth}, overflow: ${result.scrollWidth > result.clientWidth}`);
    console.log("Headers:", JSON.stringify(result.headers, null, 2));
    console.log("Toolbars:", JSON.stringify(result.toolbars, null, 2));
    console.log("MobileHeader:", JSON.stringify(result.mobileHeader, null, 2));
    console.log("SearchIcon:", JSON.stringify(result.searchIcon, null, 2));
    console.log("BottomBar:", JSON.stringify(result.bottomBar, null, 2));

    // Test search click
    if (route.path === "/") {
      const searchBtn = page.locator('button[aria-label="Cari"]').first();
      if (await searchBtn.count() > 0) {
        await searchBtn.click();
        await page.waitForTimeout(500);
        const overlay = await page.locator('[role="dialog"], [role="search"], .fixed.inset-0').first();
        const overlayVisible = await overlay.isVisible().catch(() => false);
        console.log("Search overlay visible after click:", overlayVisible);
      }
    }
  }
  await page.close();
}

await browser.close();
console.log("\nDONE");
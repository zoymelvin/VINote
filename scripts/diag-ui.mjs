import { chromium } from "playwright";
import fs from "node:fs";

const out = "/tmp/vinote-diag";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

async function dump(label, fn) {
  console.log(`\n=== ${label} ===`);
  const value = await fn();
  console.log(JSON.stringify(value, null, 2));
  return value;
}

await page.goto("http://localhost:3000/koleksi", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

const cards = await page.locator("article, [class*='rounded']").count();
const points = [];
for (let x = 0.1; x <= 0.9; x += 0.4) {
  for (let y = 0.1; y <= 0.9; y += 0.4) {
    const art = page.locator("article").first();
    const box = await art.boundingBox({ timeout: 5000 }).catch(() => null);
    if (!box) continue;
    if (!box) continue;
    const px = box.x + box.width * x;
    const py = box.y + box.height * y;
    const info = await page.evaluate(({ px, py }) => {
      const el = document.elementFromPoint(px, py);
      const chain = [];
      let cur = el;
      while (cur && cur !== document.body) {
        chain.push({
          tag: cur.tagName.toLowerCase(),
          className: cur.className?.toString?.().slice(0, 120) || "",
          position: getComputedStyle(cur).position,
          zIndex: getComputedStyle(cur).zIndex,
          pointerEvents: getComputedStyle(cur).pointerEvents,
          href: cur.getAttribute?.("href") || null,
        });
        cur = cur.parentElement;
      }
      return { point: [px, py], target: el?.tagName, chain };
    }, { px, py });
    points.push(info);
  }
}
await dump("collection-card-elementFromPoint", async () => points);

const history = await page.evaluate(async () => {
  const db = await new Promise((resolve, reject) => {
    const req = indexedDB.open("vinote");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  const tx = db.transaction("notes", "readonly");
  const store = tx.objectStore("notes");
  const all = await new Promise((resolve, reject) => {
    const r = store.getAll();
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  return (all || []).filter((n) => n.isArchived).map((n) => ({ id: n.id, title: n.title, isArchived: n.isArchived, deletedAt: n.deletedAt }));
});
await dump("archived-notes-in-dexie", async () => history);

const profileStores = await page.evaluate(async () => {
  const db = await new Promise((resolve, reject) => {
    const req = indexedDB.open("vinote");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return Array.from(db.objectStoreNames);
});
await dump("dexie-stores", async () => profileStores);

await page.goto("http://localhost:3000/catatan/baru", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const footer = await page.locator("text=/kata|karakter/").first().textContent().catch(() => null);
await dump("editor-footer", async () => ({ footer }));

const consoleMessages = [];
page.on("console", (msg) => consoleMessages.push({ type: msg.type(), text: msg.text() }));
await page.waitForTimeout(500);
await dump("console", async () => consoleMessages);

await page.screenshot({ path: `${out}/diag.png`, fullPage: true });
await browser.close();
console.log(`\nScreenshot: ${out}/diag.png`);

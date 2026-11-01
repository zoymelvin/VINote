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

async function dumpIndexedDB(page, label) {
  try {
    const data = await page.evaluate(async () => {
      try {
        const db = await new Promise((resolve, reject) => {
          const req = indexedDB.open("vinote");
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
        const result = {};
        for (const storeName of db.objectStoreNames) {
          const tx = db.transaction(storeName, "readonly");
          const store = tx.objectStore(storeName);
          const all = await new Promise((resolve, reject) => {
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
          });
          result[storeName] = all;
        }
        db.close();
        return result;
      } catch (e) {
        return { error: e.message };
      }
    });
    if (data.error) {
      console.log(`\n=== DUMP ${label} === ERROR: ${data.error} ===\n`);
      return null;
    }
    console.log(`\n=== DUMP ${label} ===`);
    for (const [store, rows] of Object.entries(data)) {
      if (store === "notes") {
        for (const r of rows) {
          console.log(`  note: id=${r.id?.slice(0,8)} title="${r.title}" contentText="${(r.contentText || "").slice(0, 50)}" updatedAt=${r.updatedAt} deletedAt=${r.deletedAt}`);
        }
      } else if (store === "outbox") {
        console.log(`  outbox: ${rows.length} items`);
        for (const r of rows) console.log(`    ${r.table} ${r.op} attempts=${r.attempts}`);
      }
    }
    console.log(`=== END DUMP ${label} ===\n`);
    return data;
  } catch (e) {
    console.log(`\n=== DUMP ${label} === FAILED: ${e.message} ===\n`);
    return null;
  }
}

async function runScenario(page, scenarioName) {
  console.log(`\n========== SCENARIO: ${scenarioName} ==========`);

  // Step 1: Create note
  await page.goto("http://localhost:3000/catatan/baru", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const noteUrl = page.url();
  console.log(`Note URL: ${noteUrl}`);

  // Step 2: Type title and content
  const titleInput = page.locator('input[placeholder*="Judul"]').first();
  await titleInput.fill("Judul uji");
  await page.waitForTimeout(200);

  const editor = page.locator('.tiptap, .ProseMirror').first();
  await editor.click();
  await page.keyboard.type("Isi uji 123");
  await page.waitForTimeout(1000); // wait for autosave

  // Check "Tersimpan" indicator
  const savedIndicator = await page.locator('text=Tersimpan').count();
  console.log(`"Tersimpan" visible: ${savedIndicator > 0}`);

  await dumpIndexedDB(page, "after-typing");

  // Step 3: Go back
  await page.goBack();
  await page.waitForTimeout(1000);

  await dumpIndexedDB(page, "after-back");

  // Step 4: Open note from card
  const noteLink = page.locator(`a[href*="${noteUrl.split("/").pop()}"]`).first();
  if (await noteLink.count() > 0) {
    await noteLink.click();
    await page.waitForTimeout(1000);
  } else {
    await page.goto(noteUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
  }

  // Step 5: Check title and content
  const titleValue = await page.locator('input[placeholder*="Judul"]').first().inputValue();
  const editorText = await page.locator('.tiptap, .ProseMirror').first().textContent();
  console.log(`After reopen - Title: "${titleValue}", Content: "${editorText?.trim()}"`);

  const pass1 = titleValue === "Judul uji" && editorText?.trim().includes("Isi uji 123");
  console.log(`SCENARIO ${scenarioName} - Reopen: ${pass1 ? "PASS" : "FAIL"}`);

  // Step 6: Reload
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const titleAfterReload = await page.locator('input[placeholder*="Judul"]').first().inputValue();
  const contentAfterReload = await page.locator('.tiptap, .ProseMirror').first().textContent();
  console.log(`After reload - Title: "${titleAfterReload}", Content: "${contentAfterReload?.trim()}"`);

  const pass2 = titleAfterReload === "Judul uji" && contentAfterReload?.trim().includes("Isi uji 123");
  console.log(`SCENARIO ${scenarioName} - Reload: ${pass2 ? "PASS" : "FAIL"}`);

  await dumpIndexedDB(page, "after-reload");

  return { pass1, pass2 };
}

async function run() {
  await waitForServer("http://localhost:3000/");
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage({ viewport: { width: 390, height: 844 } });

  const results = await runScenario(page, "basic");

  console.log("\n========== SUMMARY ==========");
  console.log(`Basic reopen: ${results.pass1 ? "PASS" : "FAIL"}`);
  console.log(`Basic reload: ${results.pass2 ? "PASS" : "FAIL"}`);

  await browser.close();
  console.log("e2e-persist done");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

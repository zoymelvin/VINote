"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Check, X } from "@phosphor-icons/react";
import { db } from "@/lib/db/db";
import { processOutbox, pullNotes } from "@/lib/sync/engine";

interface DiagResult {
  step: string;
  ok: boolean;
  message: string;
  latency?: number;
}

export default function DiagnostikPage() {
  const [results, setResults] = useState<DiagResult[]>([]);
  const [running, setRunning] = useState(false);
  const [copyText, setCopyText] = useState("");

  async function runDiagnostics() {
    setRunning(true);
    const res: DiagResult[] = [];
    const supabase = createClient();

    // Step 1: Env vars
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    res.push({ step: "Variabel env", ok: hasUrl && hasKey, message: hasUrl && hasKey ? "Terisi" : "Kosong — isi .env.local" });

    // Step 2: Session
    if (supabase) {
      const t0 = Date.now();
      const { data: { session }, error } = await supabase.auth.getSession();
      res.push({ step: "Sesi login", ok: !!session && !error, message: session ? `Login sebagai ${session.user.email}` : "Tidak ada sesi — silakan login", latency: Date.now() - t0 });
    } else {
      res.push({ step: "Sesi login", ok: false, message: "Supabase tidak terkonfigurasi" });
    }

    // Step 3: Tables readable
    if (supabase) {
      const tables = ["notes", "folders", "tags", "note_tags", "note_collections", "attachments", "shares", "templates", "settings", "push_subscriptions", "profiles", "note_revisions"];
      for (const table of tables) {
        const t0 = Date.now();
        const { error } = await supabase.from(table).select("id").limit(1);
        res.push({ step: `Tabel ${table}`, ok: !error, message: error ? error.message : "OK", latency: Date.now() - t0 });
      }
    }

    // Step 4: Write test
    if (supabase) {
      const t0 = Date.now();
      const testId = crypto.randomUUID();
      const { error: insertErr } = await supabase.from("notes").insert({ id: testId, title: "__diag__", type: "text", content: {}, content_text: "" });
      if (insertErr) {
        res.push({ step: "Uji tulis", ok: false, message: insertErr.message, latency: Date.now() - t0 });
      } else {
        const { data, error: readErr } = await supabase.from("notes").select("*").eq("id", testId).single();
        if (readErr) {
          res.push({ step: "Uji tulis", ok: false, message: readErr.message, latency: Date.now() - t0 });
        } else {
          await supabase.from("notes").delete().eq("id", testId);
          res.push({ step: "Uji tulis", ok: true, message: `OK (latensi ${Date.now() - t0}ms)`, latency: Date.now() - t0 });
        }
      }
    }

    // Step 5: Storage
    if (supabase) {
      const { error } = await supabase.storage.listBuckets();
      res.push({ step: "Storage", ok: !error, message: error ? error.message : "Storage tersedia" });
    }

    // Step 6: Local vs server count per entity
    const entities = ["notes", "folders", "note_collections", "profiles", "settings", "note_revisions"];
    for (const entity of entities) {
      const localCount = entity === "notes" ? await db.notes.count() :
        entity === "folders" ? await db.folders.count() :
        entity === "note_collections" ? await db.noteCollections.count() :
        entity === "settings" ? await db.settings.count() :
        entity === "note_revisions" ? await db.revisions.count() : 0;
      let serverCount = 0;
      if (supabase) {
        const { count } = await supabase.from(entity).select("*", { count: "exact", head: true });
        serverCount = count ?? 0;
      }
      res.push({ step: `${entity}: lokal vs server`, ok: true, message: `${localCount} lokal, ${serverCount} server` });
    }

    // Step 7: Outbox status
    const outboxItems = await db.outbox.toArray();
    const failed = outboxItems.filter((i) => i.attempts > 3);
    const byTable = outboxItems.reduce((acc, i) => {
      acc[i.table] = (acc[i.table] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byTableStr = Object.entries(byTable).map(([t, c]) => `${t}:${c}`).join(", ");
    res.push({ step: "Outbox", ok: failed.length === 0, message: failed.length > 0 ? `${failed.length} gagal` : `${outboxItems.length} tertunda (${byTableStr})` });

    setResults(res);
    setCopyText(res.map((r) => `${r.ok ? "✓" : "✗"} ${r.step}: ${r.message}${r.latency ? ` (${r.latency}ms)` : ""}`).join("\n"));
    setRunning(false);
  }

  async function uploadAll() {
    await processOutbox(null, (s) => console.log("Sync status:", s));
    await runDiagnostics();
  }

  async function pullAll() {
    await pullNotes(null, undefined, (s) => console.log("Sync status:", s));
    await runDiagnostics();
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <PageHeader title="Diagnostik Sinkron" description="Periksa koneksi ke server Supabase" />
      <div className="flex gap-2">
        <Button onClick={runDiagnostics} disabled={running}>
          {running ? "Memeriksa..." : "Periksa koneksi server"}
        </Button>
        <Button variant="secondary" onClick={uploadAll}>Unggah semua yang tertunda</Button>
        <Button variant="secondary" onClick={pullAll}>Tarik ulang dari server</Button>
      </div>
      <div className="space-y-2">
        {results.map((r, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl bg-[var(--card)] p-3">
            {r.ok ? <Check size={18} className="text-green-500" /> : <X size={18} className="text-red-500" />}
            <div className="flex-1">
              <div className="font-medium text-sm">{r.step}</div>
              <div className="text-xs text-[var(--text-muted)]">{r.message}</div>
            </div>
            {r.latency && <span className="text-xs text-[var(--text-muted)]">{r.latency}ms</span>}
          </div>
        ))}
      </div>
      {copyText && (
        <div className="space-y-2">
          <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(copyText)}>Salin hasil</Button>
          <pre className="rounded-xl bg-[var(--card-muted)] p-3 text-xs overflow-x-auto">{copyText}</pre>
        </div>
      )}
    </div>
  );
}

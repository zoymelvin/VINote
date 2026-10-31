"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { NoteCard } from "@/components/notes/note-card";
import { CommandPalette } from "@/components/ui/command-palette";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import { getGreeting } from "@/lib/greeting";
import { globalSearch } from "@/lib/search";

export default function Home() {
  const notes = useLiveQuery(() => db.notes.filter((n) => !n.deletedAt && !n.isArchived).toArray(), []);
  const router = useRouter();
  const reduced = useReducedMotion();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [results, setResults] = useState<Awaited<ReturnType<typeof globalSearch>>>([]);

  const list = useMemo(() => notes ?? [], [notes]);
  const pinned = useMemo(() => list.filter((n) => n.isPinned), [list]);
  const recent = useMemo(() => [...list].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 20), [list]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: reduced ? 0 : 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, y: reduced ? 0 : 8 },
    show: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "/" && !paletteOpen && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen]);

  useEffect(() => {
    if (paletteOpen) {
      globalSearch(paletteQuery).then(setResults);
    }
  }, [paletteQuery, paletteOpen]);

  async function quickNote() {
    const n = await import("@/lib/db/repo").then((m) => m.createNote({ type: "text", title: "" }));
    router.push(`/catatan/${n.id}`);
  }

  return (
    <div className="p-4 md:p-8 space-y-8 overflow-x-hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-normal tracking-tight md:text-4xl">{getGreeting()}</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button onClick={quickNote} className="hidden md:flex"><Icon icon={Plus} size={18} /> Baru</Button>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-white">Z</div>
        </div>
      </div>

      <button
        onClick={() => setPaletteOpen(true)}
        className="flex h-12 w-full items-center gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--card)] px-4 text-left text-[var(--text-muted)] transition hover:border-[var(--accent)]"
      >
        <Icon icon={Search} size={20} />
        <span className="flex-1">Cari catatan, koleksi...</span>
        <kbd className="rounded-lg border border-[var(--border)] bg-[var(--card-muted)] px-2 py-1 text-xs text-[var(--text-muted)]">Ctrl K</kbd>
      </button>

      {pinned.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--text-muted)]">Disematkan</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {pinned.map((n) => (
              <div key={n.id} className="w-64 shrink-0">
                <NoteCard note={n} compact />
              </div>
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--text-muted)]">Terakhir diubah</h2>
          <m.div variants={container} initial="hidden" animate="show" className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:break-inside-avoid [&>*]:mb-3">
            {recent.map((n, idx) => (
              <m.div key={n.id} variants={idx < 8 ? item : undefined}>
                <NoteCard note={n} />
              </m.div>
            ))}
          </m.div>
        </section>
      )}

      {list.length === 0 && (
        <EmptyState
          icon={<Plus size={32} className="text-[var(--accent)]" />}
          title="Belum ada catatan"
          description="Tekan tombol Baru untuk mulai menulis."
          action={<Button onClick={quickNote}><Icon icon={Plus} size={18} /> Buat catatan</Button>}
        />
      )}

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        query={paletteQuery}
        onQueryChange={setPaletteQuery}
        results={results}
        onSelect={(id) => {
          setPaletteOpen(false);
          setPaletteQuery("");
          if (id) router.push(`/catatan/${id}`);
        }}
      />
    </div>
  );
}

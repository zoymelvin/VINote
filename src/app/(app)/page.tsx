"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import { createNote, listCollections } from "@/lib/db/repo";
import type { Note } from "@/lib/notes/types";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Plus, NotebookPen, Flame, CheckSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { NoteCard } from "@/components/notes/note-card";
import * as m from "motion/react-m";
import { startOfWeek } from "date-fns";
import { useReducedMotion } from "motion/react";
import { getGreeting } from "@/lib/greeting";

const QUICK_TYPES = [
  { type: "text", label: "Teks", icon: "📝" },
  { type: "checklist", label: "Checklist", icon: "✅" },
  { type: "code", label: "Kode", icon: "💻" },
  { type: "quick", label: "Cepat", icon: "⚡" },
];

export default function Home() {
  const notes = useLiveQuery(() => db.notes.filter((n) => !n.deletedAt && !n.isArchived).toArray(), []);
  const collections = useLiveQuery(() => listCollections(), []);
  const router = useRouter();
  const reduced = useReducedMotion();
  const [query, setQuery] = useState("");

  const list = useMemo(() => notes ?? [], [notes]);
  const total = list.length;
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).getTime();
  const checklistWeek = list.filter((n) => n.type === "checklist" && n.createdAt >= weekStart).length;

  const days = new Set(list.map((n) => new Date(n.updatedAt).toDateString()));
  let streak = 0;
  const d = new Date();
  while (days.has(d.toDateString())) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }

  const pinned = useMemo(() => list.filter((n) => n.isPinned), [list]);
  const recent = useMemo(() => [...list].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 20), [list]);
  const collectionsList = useMemo(() => (collections ?? []).filter((c) => !c.deletedAt).slice(0, 6), [collections]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: reduced ? 0 : 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, y: reduced ? 0 : 8 },
    show: { opacity: 1, y: 0 },
  };

  async function quickNote(type: string) {
    const n = await createNote({ type: type as Note["type"], title: "" });
    router.push(`/catatan/${n.id}`);
  }

  return (
    <div className="p-4 md:p-8 space-y-8 overflow-x-hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold truncate">{getGreeting()}</h1>
          <p className="text-sm text-[var(--text-muted)] truncate">{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button onClick={() => quickNote("text")} className="hidden md:flex"><Icon icon={Plus} size={18} /> Baru</Button>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-white">Z</div>
        </div>
      </div>

      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari catatan, koleksi..."
          className="h-12 w-full rounded-[24px] border border-[var(--border)] bg-[var(--card)] pl-12 pr-4 text-base outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
        <kbd className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-lg border border-[var(--border)] bg-[var(--card-muted)] px-2 py-1 text-xs text-[var(--text-muted)] md:block">Ctrl K</kbd>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {QUICK_TYPES.map((qt) => (
          <button key={qt.type} onClick={() => quickNote(qt.type)} className="flex items-center gap-2 rounded-2xl bg-[var(--card)] px-4 py-2.5 shadow-[var(--shadow-1)] transition hover:-translate-y-[1px] whitespace-nowrap">
            <span>{qt.icon}</span>
            <span className="text-sm font-medium">{qt.label}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <Icon icon={Flame} size={20} className="text-[var(--accent)]" />
            <div>
              <div className="text-2xl font-bold">{streak}</div>
              <div className="text-xs text-[var(--text-muted)]">Streak hari</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Icon icon={NotebookPen} size={20} className="text-[var(--accent)]" />
            <div>
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-xs text-[var(--text-muted)]">Total catatan</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Icon icon={CheckSquare} size={20} className="text-[var(--accent)]" />
            <div>
              <div className="text-2xl font-bold">{checklistWeek}</div>
              <div className="text-xs text-[var(--text-muted)]">Checklist selesai</div>
            </div>
          </div>
        </Card>
      </div>

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

      {collectionsList.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--text-muted)]">Koleksi</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {collectionsList.map((c) => (
              <button key={c.id} onClick={() => router.push(`/koleksi/${c.id}`)} className="flex h-28 w-40 shrink-0 flex-col items-center justify-center gap-2 rounded-[24px] bg-[var(--card)] p-4 shadow-[var(--shadow-1)] transition hover:-translate-y-[2px]">
                <span className="text-3xl">{c.icon || "📁"}</span>
                <span className="text-sm font-medium">{c.name}</span>
              </button>
            ))}
            <button onClick={() => router.push("/koleksi")} className="flex h-28 w-40 shrink-0 flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-dashed border-[var(--border)] bg-[var(--card-muted)]/50 p-4 transition hover:border-[var(--accent)]">
              <Plus size={20} className="text-[var(--accent)]" />
              <span className="text-sm font-medium text-[var(--text-muted)]">Koleksi baru</span>
            </button>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-muted)]">Terakhir diubah</h2>
        {list.length === 0 ? (
          <EmptyState
            icon={<NotebookPen size={32} className="text-[var(--accent)]" />}
            title="Belum ada catatan"
            description="Tekan tombol Baru untuk mulai menulis."
            action={<Button onClick={() => quickNote("text")}><Icon icon={Plus} size={18} /> Buat catatan</Button>}
          />
        ) : (
          <m.div variants={container} initial="hidden" animate="show" className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:break-inside-avoid [&>*]:mb-3">
            {recent.map((n, idx) => (
              <m.div key={n.id} variants={idx < 8 ? item : undefined}>
                <NoteCard note={n} />
              </m.div>
            ))}
          </m.div>
        )}
      </section>
    </div>
  );
}

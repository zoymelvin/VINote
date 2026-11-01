"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { NoteCard } from "@/components/shared/note-card";
import { CommandPalette } from "@/components/ui/command-palette";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import { globalSearch } from "@/lib/search";
import { PencilSimpleLine, MagnifyingGlass, Notebook, Plus } from "@phosphor-icons/react";
import { Avatar } from "@/components/shared/avatar";
import { useProfile } from "@/stores/profile";

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
    router.push(`/catatan/${n.id}?mode=edit`);
  }

  const profile = useProfile();
  const initial = profile.displayName.charAt(0).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8 space-y-8">
      <header className="sticky top-0 z-30 hidden h-16 items-center gap-3 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur px-4 -mx-4 md:flex md:-mx-8 md:px-8">
        <button
          onClick={() => setPaletteOpen(true)}
          className="flex h-11 flex-1 max-w-[640px] items-center gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--card)] px-4 text-left text-[var(--text-muted)] transition hover:border-[var(--accent)]"
        >
          <Icon icon={MagnifyingGlass} size={20} weight="regular" />
          <span className="flex-1 text-sm">Cari catatan...</span>
          <kbd className="rounded-lg border border-[var(--border)] bg-[var(--card-muted)] px-2 py-1 text-xs text-[var(--text-muted)]">Ctrl K</kbd>
        </button>
        <div className="flex-1" />
        <button
          onClick={quickNote}
          className="flex h-11 items-center gap-2 rounded-[14px] px-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_var(--accent)] transition-transform hover:-translate-y-[1px] active:scale-[0.97]"
          style={{
            background: "linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent) 85%, black))",
            boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.25), 0 8px 24px -8px var(--accent)",
          }}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
            <Icon icon={Plus} size={16} weight="bold" />
          </span>
          Catatan baru
        </button>
        <Avatar src={profile.avatarUrl ?? undefined} alt={profile.displayName} initials={initial} size={36} />
      </header>

      {pinned.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Disematkan · {pinned.length}</h2>
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
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Terakhir diubah · {recent.length}</h2>
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
          icon={<Icon icon={Notebook} size={32} weight="duotone" className="text-[var(--accent)]" />}
          title="Belum ada catatan"
          description="Tekan tombol Baru untuk mulai menulis."
          action={<Button onClick={quickNote}><Icon icon={PencilSimpleLine} size={18} weight="regular" /> Buat catatan</Button>}
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

"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Home, History, FolderKanban, Settings, Plus, PanelLeftClose, PanelLeftOpen, FileText, CheckSquare, Code, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastHost } from "@/components/ui/toast";
import { Icon, IconTile } from "@/components/ui/icon";
import { createNote } from "@/lib/db/repo";
import { listCollections } from "@/lib/db/repo";
import type { Note } from "@/lib/notes/types";
import type { Collection } from "@/lib/notes/types";
import * as m from "motion/react-m";
import { useLiveQuery } from "dexie-react-hooks";

const tabs = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/riwayat", label: "Riwayat", icon: History },
  { href: "/koleksi", label: "Koleksi", icon: FolderKanban },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

const noteTypes: { type: Note["type"]; label: string; icon: typeof FileText }[] = [
  { type: "text", label: "Teks", icon: FileText },
  { type: "checklist", label: "Checklist", icon: CheckSquare },
  { type: "code", label: "Kode", icon: Code },
  { type: "quick", label: "Catatan Cepat", icon: Zap },
  { type: "markdown", label: "Markdown", icon: FileText },
  { type: "journal", label: "Jurnal", icon: FileText },
  { type: "voice", label: "Suara", icon: FileText },
  { type: "drawing", label: "Sketsa", icon: FileText },
  { type: "bookmark", label: "Bookmark", icon: FileText },
  { type: "template", label: "Template", icon: FileText },
];

const collectionGradients: Record<string, string> = {
  "📁": "from-gray-400 to-gray-500",
  "💼": "from-blue-400 to-blue-600",
  "🏠": "from-emerald-400 to-emerald-600",
  "💡": "from-amber-400 to-amber-600",
  "🎨": "from-pink-400 to-pink-600",
  "📚": "from-indigo-400 to-indigo-600",
  "🎯": "from-rose-400 to-rose-600",
  "✈️": "from-sky-400 to-sky-600",
  "💪": "from-orange-400 to-orange-600",
  "🧘": "from-teal-400 to-teal-600",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const collections = useLiveQuery(() => listCollections(), []);

  async function newNote(type: (typeof noteTypes)[number]["type"]) {
    const n = await createNote({ type, title: "" });
    setFabOpen(false);
    router.push(`/catatan/${n.id}`);
  }

  const collapsibleCollections = useMemo(() => (collections ?? []).slice(0, 8), [collections]);

  return (
    <div className="flex min-h-[100dvh] bg-[var(--background)]">
      <aside className={cn("hidden md:flex md:flex-col md:sticky md:top-0 md:h-[100dvh] md:border-r md:border-[var(--border)] md:p-4 md:transition-all md:overflow-y-auto", collapsed ? "md:w-20" : "md:w-64")}>
        <div className="mb-4 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)] text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <span className="font-display text-xl font-normal tracking-tight">VINOTE</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Buka sidebar" : "Ciutkan sidebar"}
            className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl hover:bg-[var(--card-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            {collapsed ? <PanelLeftOpen size={20} strokeWidth={1.75} /> : <PanelLeftClose size={20} strokeWidth={1.75} />}
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {tabs.map((t) => {
            const active = path === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-label={t.label}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2 transition",
                  active ? "bg-[var(--card-muted)] font-medium" : "text-[var(--text-muted)] hover:bg-[var(--card-muted)]/60",
                )}
              >
                <Icon icon={t.icon} size={20} />
                {!collapsed && <span>{t.label}</span>}
              </Link>
            );
          })}
        </nav>
        {!collapsed && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between px-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Koleksi</span>
              <button onClick={() => router.push("/koleksi")} className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl hover:bg-[var(--card-muted)]" aria-label="Koleksi baru">
                <Icon icon={Plus} size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-0.5">
              {collapsibleCollections.map((c: Collection) => {
                const active = path === `/koleksi/${c.id}`;
                return (
                  <Link
                    key={c.id}
                    href={`/koleksi/${c.id}`}
                    className={cn("flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm transition", active ? "bg-[var(--card-muted)] font-medium" : "text-[var(--text-muted)] hover:bg-[var(--card-muted)]/60")}
                  >
                    <IconTile icon={FolderKanban} gradient={collectionGradients[c.icon || "📁"] || "from-gray-400 to-gray-500"} />
                    <span className="truncate">{c.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        <div className="mt-auto pt-4">
          <div className="flex items-center gap-3 rounded-2xl bg-[var(--card-muted)] p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-white">Z</div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">zoymelvin</div>
                <div className="truncate text-xs text-[var(--text-muted)]">Tersinkron</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 pb-28 md:pb-6 min-w-0 overflow-y-auto">{children}</main>

      <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-24px)] max-w-md -translate-x-1/2 md:hidden">
        <div className="relative flex items-center justify-around rounded-[28px] border border-white/20 bg-[var(--card)]/75 px-2 py-2 shadow-[var(--shadow-2)] backdrop-blur-xl safe-bottom">
          {tabs.slice(0, 2).map((t) => {
            const active = path === t.href;
            return (
              <Link key={t.href} href={t.href} aria-label={t.label} className="relative flex h-12 w-12 items-center justify-center">
                {active && (
                  <m.div
                    layoutId="bottom-tab-indicator"
                    className="absolute inset-0 rounded-2xl bg-[var(--accent)]/15"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon icon={t.icon} size={24} className={active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />
              </Link>
            );
          })}

          <div className="relative">
            <button
              onClick={() => setFabOpen((v) => !v)}
              aria-label="Tulis catatan baru"
              aria-expanded={fabOpen}
              className="flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[var(--shadow-2)] transition-transform active:scale-95"
              style={{ transform: fabOpen ? "rotate(45deg)" : "rotate(0deg)" }}
            >
              <Plus size={24} strokeWidth={1.75} />
            </button>
            {fabOpen && (
              <div className="absolute bottom-16 left-1/2 z-50 w-52 -translate-x-1/2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-[var(--shadow-2)] backdrop-blur">
                {noteTypes.map((nt) => (
                  <button
                    key={nt.type}
                    onClick={() => newNote(nt.type)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-[var(--card-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    <Icon icon={nt.icon} size={18} className="text-[var(--text-muted)]" />
                    <span>{nt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {tabs.slice(2).map((t) => {
            const active = path === t.href;
            return (
              <Link key={t.href} href={t.href} aria-label={t.label} className="relative flex h-12 w-12 items-center justify-center">
                {active && (
                  <m.div
                    layoutId="bottom-tab-indicator"
                    className="absolute inset-0 rounded-2xl bg-[var(--accent)]/15"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon icon={t.icon} size={24} className={active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />
              </Link>
            );
          })}
        </div>
      </nav>

      <ToastHost />
    </div>
  );
}

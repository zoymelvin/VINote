"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Icon, IconTile } from "@/components/icons";
import { cn } from "@/lib/utils";
import { ToastHost } from "@/components/ui/toast";
import { createNote, listCollections } from "@/lib/db/repo";
import type { Collection, Note } from "@/lib/notes/types";
import * as m from "motion/react-m";
import { useLiveQuery } from "dexie-react-hooks";
import { Avatar } from "@/components/shared/avatar";
import { useProfile } from "@/stores/profile";
import { CollectionIcon } from "@/components/shared/collection-icon";
import { MobileHeader } from "@/components/layout/mobile-header";
import { CollectionPickerProvider, useCollectionPicker } from "@/components/shared/collection-picker-provider";
import { PencilSimpleLine, House, ClockCounterClockwise, Stack, GearSix, Archive, Trash, NotePencil, CheckSquare, CodeBlock, Lightning, MarkdownLogo, BookOpenText, Microphone, Scribble, Bookmark, Layout, Sidebar, SidebarSimple, Plus, Folder, Briefcase, Lightbulb, Palette, Books, Target, AirplaneTilt, Barbell, FlowerLotus } from "@phosphor-icons/react";
import type { IconWeight } from "@phosphor-icons/react";

const tabs = [
  { href: "/", label: "Beranda", icon: House },
  { href: "/riwayat", label: "Riwayat", icon: ClockCounterClockwise },
  { href: "/koleksi", label: "Koleksi", icon: Stack },
  { href: "/arsip", label: "Arsip", icon: Archive },
  { href: "/sampah", label: "Sampah", icon: Trash },
  { href: "/pengaturan", label: "Pengaturan", icon: GearSix },
];

const mobileTabs = [
  { href: "/", label: "Beranda", icon: House },
  { href: "/riwayat", label: "Riwayat", icon: ClockCounterClockwise },
  { href: "/koleksi", label: "Koleksi", icon: Stack },
  { href: "/arsip", label: "Arsip", icon: Archive },
  { href: "/pengaturan", label: "Pengaturan", icon: GearSix },
];

const noteTypes: { type: string; label: string; icon: React.ComponentType<{ size?: number; weight?: IconWeight; className?: string; [key: string]: unknown }> }[] = [
  { type: "text", label: "Teks", icon: NotePencil },
  { type: "checklist", label: "Checklist", icon: CheckSquare },
  { type: "code", label: "Kode", icon: CodeBlock },
  { type: "quick", label: "Catatan Cepat", icon: Lightning },
  { type: "markdown", label: "Markdown", icon: MarkdownLogo },
  { type: "journal", label: "Jurnal", icon: BookOpenText },
  { type: "voice", label: "Suara", icon: Microphone },
  { type: "drawing", label: "Sketsa", icon: Scribble },
  { type: "bookmark", label: "Bookmark", icon: Bookmark },
  { type: "template", label: "Template", icon: Layout },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const collections = useLiveQuery(() => listCollections(), []);
  const profile = useProfile();
  const initial = profile.displayName.charAt(0).toUpperCase();

  async function newNote(type: string) {
    const n = await createNote({ type: type as Note["type"], title: "" });
    setFabOpen(false);
    router.push(`/catatan/${n.id}?mode=edit`);
  }

  const collapsibleCollections = useMemo(() => (collections ?? []).slice(0, 8), [collections]);

  return (
    <CollectionPickerProvider>
    <div className="flex flex-col md:flex-row min-h-[100dvh] bg-[var(--background)]">
      <aside className={cn("hidden md:flex md:flex-col md:sticky md:top-0 md:h-[100dvh] md:border-r md:border-[var(--border)] md:p-4 md:transition-all md:overflow-y-auto", collapsed ? "md:w-20" : "md:w-64")}>
        <div className="mb-4 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)] text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <span className="font-sans text-[15px] font-bold tracking-wide">VINOTE</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Buka sidebar" : "Ciutkan sidebar"}
            className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl hover:bg-[var(--card-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <Icon icon={collapsed ? Sidebar : SidebarSimple} size={20} weight="regular" />
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
                  "flex items-center gap-3 rounded-xl px-3 py-2 transition",
                  active ? "bg-[var(--card-muted)] font-medium" : "text-[var(--text-muted)] hover:bg-[var(--card-muted)]/60",
                )}
              >
                <Icon icon={t.icon} size={20} weight="regular" />
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
                <Icon icon={Plus} size={20} weight="regular" />
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
                    <CollectionIcon icon={c.icon} color={c.color} size={24} />
                    <span className="truncate">{c.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        <div className="mt-auto pt-4">
          <div className="flex items-center gap-3 rounded-2xl bg-[var(--card-muted)] p-3">
            <Avatar src={profile.avatarUrl ?? undefined} alt={profile.displayName} initials={initial} size={36} />
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{profile.displayName}</div>
                <div className="truncate text-xs text-[var(--text-muted)]">Tersinkron</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <MobileHeader />
      <main className="flex-1 pb-[calc(env(safe-area-inset-bottom)+8px+64px+24px+72px)] md:pb-6 min-w-0 overflow-y-auto">{children}</main>

      {path !== "/catatan" && !path.startsWith("/catatan/") && (
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="mx-4 mb-2 flex items-center justify-around rounded-[32px] border border-[var(--border)] bg-[var(--card)]/70 px-2 py-2 backdrop-blur-xl" style={{ boxShadow: "0 10px 30px -10px rgb(0 0 0 / 0.45)", height: "64px" }}>
          {mobileTabs.map((t) => {
            const active = path === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-label={t.label}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1 active:scale-95 transition-transform"
              >
                <Icon icon={t.icon} size={24} weight={active ? "fill" : "regular"} className={active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />
                <span className={cn("text-[11px] leading-none", active ? "font-medium text-[var(--accent)]" : "text-[var(--text-muted)]")}>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      )}

      {path !== "/catatan" && !path.startsWith("/catatan/") && (
        <button
          onClick={() => newNote("text")}
          aria-label="Catatan baru"
          className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg md:hidden"
          style={{
            right: "16px",
            bottom: "calc(env(safe-area-inset-bottom) + 8px + 64px + 16px)",
            background: "linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent) 85%, black))",
          }}
        >
          <Icon icon={PencilSimpleLine} size={24} weight="bold" />
        </button>
      )}
      <ToastHost />
    </div>
    </CollectionPickerProvider>
  );
}

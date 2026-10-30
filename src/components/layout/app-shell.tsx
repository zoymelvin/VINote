"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Home, History, Folder, Settings, Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastHost } from "@/components/ui/toast";
import { Icon } from "@/components/ui/icon";
import { createNote } from "@/lib/db/repo";
import * as m from "motion/react-m";

const tabs = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/riwayat", label: "Riwayat", icon: History },
  { href: "/folder", label: "Folder", icon: Folder },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

const noteTypes: { type: Parameters<typeof createNote>[0]["type"]; label: string }[] = [
  { type: "text", label: "Teks" },
  { type: "checklist", label: "Checklist" },
  { type: "markdown", label: "Markdown" },
  { type: "code", label: "Kode" },
  { type: "quick", label: "Catatan Cepat" },
  { type: "journal", label: "Jurnal" },
  { type: "voice", label: "Suara" },
  { type: "drawing", label: "Sketsa" },
  { type: "bookmark", label: "Bookmark" },
  { type: "template", label: "Template" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  async function newNote(type: (typeof noteTypes)[number]["type"]) {
    const n = await createNote({ type, title: "" });
    setFabOpen(false);
    router.push(`/catatan/${n.id}`);
  }

  return (
    <div className="flex min-h-[100dvh] bg-[var(--background)]">
      <aside className={cn("hidden md:flex md:flex-col md:border-r md:border-[var(--border)] md:p-4 md:transition-all", collapsed ? "md:w-20" : "md:w-64")}>
        <div className="mb-6 flex items-center justify-between">
          {!collapsed && <div className="text-xl font-bold">VINOTE</div>}
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Buka sidebar" : "Ciutkan sidebar"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-[var(--card-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
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
      </aside>

      <main className="flex-1 pb-28 md:pb-6">{children}</main>

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
                    className="flex w-full items-center rounded-xl px-3 py-2 text-sm hover:bg-[var(--card-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    {nt.label}
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
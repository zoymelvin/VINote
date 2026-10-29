"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Folder, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastHost } from "@/components/ui/toast";

const tabs = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/riwayat", label: "Riwayat", icon: History },
  { href: "/folder", label: "Folder", icon: Folder },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="flex min-h-[100dvh] bg-[var(--background)]">
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-[var(--border)] md:p-4">
        <div className="mb-6 text-xl font-bold">VINOTE</div>
        <nav className="flex flex-col gap-1">
          {tabs.map((t) => (
            <Link key={t.href} href={t.href} className={cn("flex items-center gap-3 rounded-2xl px-3 py-2", path === t.href ? "bg-[var(--card-muted)] font-medium" : "text-[var(--muted)]")}>
              <t.icon size={18} /> {t.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 pb-24 md:pb-6">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border)] bg-[var(--card)]/90 backdrop-blur md:hidden safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.slice(0,2).map((t) => (
            <Link key={t.href} href={t.href} className={cn("flex flex-col items-center gap-1 px-3 py-1 text-xs", path === t.href ? "text-[var(--accent)]" : "text-[var(--muted)]")}>
              <t.icon size={20} /> {t.label}
            </Link>
          ))}
          <Link href="/catatan/baru" className="flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[var(--shadow-2)]">
            <Plus />
          </Link>
          {tabs.slice(2).map((t) => (
            <Link key={t.href} href={t.href} className={cn("flex flex-col items-center gap-1 px-3 py-1 text-xs", path === t.href ? "text-[var(--accent)]" : "text-[var(--muted)]")}>
              <t.icon size={20} /> {t.label}
            </Link>
          ))}
        </div>
      </nav>
      <ToastHost />
    </div>
  );
}

"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/shared/avatar";
import { useProfile } from "@/stores/profile";
import { MagnifyingGlass, ArrowLeft } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function MobileHeader({ onSearch }: { onSearch?: () => void }) {
  const path = usePathname();
  const profile = useProfile();
  const initial = profile.displayName.charAt(0).toUpperCase();

  const isHome = path === "/";
  const isDetail = path.startsWith("/koleksi/") || path.startsWith("/catatan/");

  return (
    <header className="sticky top-0 z-30 md:hidden" data-component="mobile-header" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div
        className="flex items-center justify-between px-4"
        style={{
          height: "52px",
          background: "color-mix(in oklch, var(--background) 72%, transparent)",
          backdropFilter: "blur(18px) saturate(160%)",
          WebkitBackdropFilter: "blur(18px) saturate(160%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {isHome ? (
          <>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <span className="text-[17px] font-bold tracking-tight">VINOTE</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onSearch}
                aria-label="Cari"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none"
              >
                <Icon icon={MagnifyingGlass} size={20} weight="regular" />
              </button>
              <Avatar src={profile.avatarUrl ?? undefined} alt={profile.displayName} initials={initial} size={32} />
            </div>
          </>
        ) : (
          <>
            {isDetail && (
              <button
                onClick={() => window.history.back()}
                aria-label="Kembali"
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--card-muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none"
              >
                <Icon icon={ArrowLeft} size={20} weight="regular" />
              </button>
            )}
            <span className="flex-1 text-center text-[17px] font-semibold truncate">
              {path === "/riwayat" ? "Riwayat" : path === "/koleksi" ? "Koleksi" : path === "/arsip" ? "Arsip" : path === "/sampah" ? "Sampah" : path === "/pengaturan" ? "Pengaturan" : ""}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onSearch}
                aria-label="Cari"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none"
              >
                <Icon icon={MagnifyingGlass} size={20} weight="regular" />
              </button>
              <Avatar src={profile.avatarUrl ?? undefined} alt={profile.displayName} initials={initial} size={32} />
            </div>
          </>
        )}
      </div>
    </header>
  );
}

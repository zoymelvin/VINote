"use client";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/shared/avatar";
import { useProfile } from "@/stores/profile";
import { MagnifyingGlass } from "@phosphor-icons/react";

export function HomeMobileHeader({ onSearch }: { onSearch?: () => void }) {
  const path = usePathname();
  const profile = useProfile();
  const initial = profile.displayName.charAt(0).toUpperCase();

  // Only render on home page
  if (path !== "/") return null;

  return (
    <header
      className="md:hidden"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 12px)",
        background: "transparent",
        border: "none",
        boxShadow: "none",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          paddingInline: "16px",
          height: "48px",
          background: "transparent",
          border: "none",
          boxShadow: "none",
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-2xl text-white"
            style={{
              background: "linear-gradient(135deg, var(--accent), color-mix(in oklch, var(--accent) 70%, var(--surface)))",
              boxShadow: "0 4px 12px -2px color-mix(in oklch, var(--accent) 45%, transparent)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span
            className="text-[18px] font-bold tracking-tight"
            style={{
              background: "linear-gradient(90deg, var(--foreground), color-mix(in oklch, var(--foreground) 70%, var(--accent)))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            VINOTE
          </span>
        </div>
        <div className="flex items-center" style={{ gap: "10px" }}>
          <button
            onClick={onSearch}
            aria-label="Cari"
            className="flex items-center justify-center rounded-full"
            style={{
              width: "40px",
              height: "40px",
              background: "color-mix(in oklch, var(--surface) 78%, transparent)",
              border: "1px solid color-mix(in oklch, var(--border) 60%, transparent)",
              outline: "none",
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Icon icon={MagnifyingGlass} size={20} weight="regular" />
          </button>
          <Avatar
            src={profile.avatarUrl ?? undefined}
            alt={profile.displayName}
            initials={initial}
            size={32}
            className="ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]"
          />
        </div>
      </div>
    </header>
  );
}
"use client";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/shared/avatar";
import { useProfile } from "@/stores/profile";
import { MagnifyingGlass } from "@phosphor-icons/react";

export function MobileHeader({ onSearch }: { onSearch?: () => void }) {
  const path = usePathname();
  const profile = useProfile();
  const initial = profile.displayName.charAt(0).toUpperCase();

  // Only render on home page
  if (path !== "/") return null;

  return (
    <header
      className="md:hidden"
      style={{
        paddingTop: "env(safe-area-inset-top)",
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
          height: "52px",
          background: "transparent",
          border: "none",
          boxShadow: "none",
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
          paddingInline: "16px",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <span className="text-[17px] font-bold tracking-tight">VINOTE</span>
        </div>
        <div className="flex items-center" style={{ gap: "12px" }}>
          <button
            onClick={onSearch}
            aria-label="Cari"
            className="flex items-center justify-center rounded-full"
            style={{
              width: "40px",
              height: "40px",
              background: "var(--surface-2)",
              border: "none",
              outline: "none",
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Icon icon={MagnifyingGlass} size={20} weight="regular" />
          </button>
          <Avatar src={profile.avatarUrl ?? undefined} alt={profile.displayName} initials={initial} size={32} />
        </div>
      </div>
    </header>
  );
}
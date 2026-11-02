"use client";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/shared/avatar";
import { useProfile } from "@/stores/profile";
import { MagnifyingGlass } from "@phosphor-icons/react";
import * as React from "react";

export function HomeMobileHeader({ onSearch }: { onSearch?: () => void }) {
  const path = usePathname();
  const profile = useProfile();
  const initial = profile.displayName.charAt(0).toUpperCase();

  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (path !== "/") return null;

  return (
<header
        className="md:hidden"
        suppressHydrationWarning
        style={{
          position: "static",
          paddingTop: "calc(env(safe-area-inset-top) + 12px)",
          paddingBottom: "4px",
          background: "transparent",
          border: "none",
          boxShadow: "none",
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
        }}
    >
<div
        className="flex items-center justify-between"
        suppressHydrationWarning
        style={{
          paddingInline: "16px",
          minHeight: "52px",
          background: "transparent",
          border: "none",
          boxShadow: "none",
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
        }}
      >
        <div className="flex items-center gap-3" style={{ transition: "opacity 0.2s ease" }}>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-2xl text-white"
            style={{
              background: "linear-gradient(135deg, var(--accent), color-mix(in oklch, var(--accent) 65%, var(--surface)))",
              boxShadow: "0 2px 8px -2px color-mix(in oklch, var(--accent) 40%, transparent)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
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
              background: "linear-gradient(90deg, var(--foreground), color-mix(in oklch, var(--foreground) 65%, var(--accent)))",
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
            className="flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              width: "40px",
              height: "40px",
              background: "color-mix(in oklch, var(--surface) 82%, transparent)",
              border: "1px solid color-mix(in oklch, var(--border) 50%, transparent)",
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
            className="transition-transform duration-200"
          />
        </div>
      </div>
    </header>
  );
}
"use client";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { ArrowLeft } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function MobilePageTitle({ title, description, back, onBack, actions }: { title: string; description?: string; back?: boolean; onBack?: () => void; actions?: React.ReactNode }) {
  return (
    <div className="md:hidden" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)", paddingInline: "16px" }}>
      <div className="flex items-center gap-2">
        {back && (
          <Link
            href="/"
            onClick={(e) => { e.preventDefault(); if (onBack) onBack(); }}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--card-muted)]"
          >
            <Icon icon={ArrowLeft} size={20} weight="regular" />
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-[30px] font-bold leading-tight tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-[13px] text-[var(--text-muted)]">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

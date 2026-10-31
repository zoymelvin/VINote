"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function SettingsRow({ icon, label, description, children, className }: { icon?: React.ReactNode; label: string; description?: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 rounded-2xl bg-[var(--card)] p-4", className)}>
      {icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--card-muted)] text-[var(--accent)]">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[var(--foreground)]">{label}</div>
        {description && <div className="text-xs text-[var(--text-muted)]">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

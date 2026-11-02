"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function SettingsRow({ icon, label, description, children, className, layout }: { icon?: React.ReactNode; label: string; description?: string; children?: React.ReactNode; className?: string; layout?: "inline" | "stack" }) {
  const isStack = layout === "stack";
  return (
    <div className={cn("flex rounded-2xl bg-[var(--card)] p-4", isStack && "max-md:flex-col max-md:items-stretch max-md:gap-3", !isStack && "flex items-center gap-4", className)}>
      {icon && (
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--card-muted)] text-[var(--accent)]", isStack && "max-md:mx-auto")}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0 text-center">
        <div className="text-sm font-medium text-[var(--foreground)]">{label}</div>
        {description && <div className="text-xs text-[var(--text-muted)]">{description}</div>}
      </div>
      <div className={cn("shrink-0 w-full", isStack && "max-md:justify-center")}>{children}</div>
    </div>
  );
}

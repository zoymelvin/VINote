"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Toggle({ checked, onCheckedChange, label, description }: { checked: boolean; onCheckedChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium text-[var(--foreground)]">{label}</div>
        {description && <div className="text-xs text-[var(--text-muted)]">{description}</div>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-11 w-12 rounded-full transition",
          checked ? "bg-[var(--accent)]" : "bg-[var(--border)]"
        )}
      >
        <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white transition shadow-sm", checked ? "left-6" : "left-1")} />
      </button>
    </div>
  );
}

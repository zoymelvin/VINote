"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Segmented({ options, value, onChange, className }: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void; className?: string }) {
  return (
    <div className={cn("inline-flex rounded-2xl bg-[var(--card-muted)] p-1", className)}>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "flex h-11 min-h-[44px] items-center rounded-xl px-4 text-sm font-medium transition",
            value === o.id ? "bg-[var(--card)] shadow-[var(--shadow-1)] text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

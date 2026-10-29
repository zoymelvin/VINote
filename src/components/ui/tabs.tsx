"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({ tabs, value, onChange }: { tabs: { id: string; label: string }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="inline-flex rounded-2xl bg-[var(--card-muted)] p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn("rounded-xl px-4 py-2 text-sm transition", value === t.id ? "bg-[var(--card)] shadow-[var(--shadow-1)]" : "text-[var(--muted)]")}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

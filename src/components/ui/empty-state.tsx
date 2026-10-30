import * as React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--surface-2)] to-[var(--card)] shadow-[var(--shadow-1)]">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="max-w-sm text-sm text-[var(--text-muted)]">{description}</p>}
      </div>
      {action}
    </div>
  );
}
"use client";
import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Search } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (query: string) => void;
  results: Array<{ type: string; title: string; description?: string; id?: string }>;
  onSelect: (id?: string) => void;
}

export function CommandPalette({ open, onOpenChange, query, onQueryChange, results, onSelect }: CommandPaletteProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} title="Cari">
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
        <Icon icon={Search} size={20} className="text-[var(--text-muted)]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Cari catatan, koleksi, aksi..."
          className="h-14 w-full bg-transparent text-base outline-none"
        />
      </div>
      <div className="max-h-[60vh] overflow-y-auto p-2">
        {results.map((r, i) => (
          <button
            key={`${r.type}-${r.id ?? i}`}
            onClick={() => onSelect(r.id)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[var(--card-muted)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--card-muted)] text-sm font-medium text-[var(--text-muted)]">
              {r.type === "note" ? "📝" : r.type === "collection" ? "📁" : "⚡"}
            </div>
            <div className="min-w-0">
              <div className="font-medium">{r.title}</div>
              {r.description && <div className="text-xs text-[var(--text-muted)]">{r.description}</div>}
            </div>
          </button>
        ))}
        {results.length === 0 && query.trim() && (
          <div className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">Tidak ada hasil untuk &ldquo;{query}&rdquo;</div>
        )}
      </div>
    </Dialog>
  );
}

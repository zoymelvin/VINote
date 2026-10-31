"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { listHistory, softDeleteNote, duplicateNote } from "@/lib/db/repo";
import { db } from "@/lib/db/db";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Sheet } from "@/components/ui/sheet";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { groupHistoryDate } from "@/lib/utils";
import { useToast } from "@/stores/toast";
import Link from "next/link";
import type { Note } from "@/lib/notes/types";
import { MoreHorizontal, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";

const labels: Record<string, string> = { today: "Hari ini", yesterday: "Kemarin", week: "Minggu ini", older: "Lebih lama" };

export default function RiwayatPage() {
  const history = useLiveQuery(() => listHistory(), []);
  const toast = useToast();
  const [preview, setPreview] = useState<Note | null>(null);
  const [query, setQuery] = useState("");
  const reduced = useReducedMotion();

  const filtered = useMemo(() => {
    let all = history ?? [];
    if (query.trim()) {
      const q = query.toLowerCase();
      all = all.filter((n) => (n.title || "").toLowerCase().includes(q) || (n.contentText || "").toLowerCase().includes(q));
    }
    return all;
  }, [history, query]);

  const groups: Record<string, Note[]> = { today: [], yesterday: [], week: [], older: [] };
  filtered.forEach((n: Note) => {
    groups[groupHistoryDate((n as Note).lastOpenedAt ?? (n as Note).updatedAt)].push(n as Note);
  });

  async function remove(n: { id: string }) {
    await softDeleteNote(n.id);
    toast.push({ message: "Dipindahkan ke Sampah", undo: async () => db.notes.update(n.id, { deletedAt: null }) });
  }

  return (
    <div className="p-4 md:p-8">
      <PageHeader title="Riwayat" description="Catatan yang pernah dibuka" />
      <div className="mb-6 relative">
        <Icon icon={Search} size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari di riwayat..."
          className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] pl-10 pr-4 text-base outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>
      {Object.keys(groups).map((g) => groups[g].length ? (
        <section key={g} className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-muted)] sticky top-0 bg-[var(--background)] py-2">{labels[g]}</h2>
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            {groups[g].map((n, idx) => (
              <m.div
                key={n.id}
                initial={{ opacity: 0, y: reduced ? 0 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={cn("flex items-center gap-3 px-4 py-3", idx > 0 && "border-t border-[var(--border)]")}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--card-muted)] text-lg">
                  {n.type === "checklist" ? "✅" : n.type === "code" ? "💻" : "📝"}
                </div>
                <button className="flex-1 text-left" onClick={() => setPreview(n)}>
                  <div className="font-semibold">{n.title || "Tanpa judul"}</div>
                  <div className="mt-0.5 line-clamp-1 text-xs text-[var(--text-muted)]">{n.contentText?.slice(0, 80)}</div>
                </button>
                <div className="text-xs text-[var(--text-muted)]">{new Date((n.lastOpenedAt ?? n.updatedAt)).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-[var(--card-muted)]"><Icon icon={MoreHorizontal} size={18} /></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setPreview(n)}>Pratinjau</DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/catatan/${n.id}`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicateNote(n.id)}>Duplikat</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => remove(n)} className="text-rose-600">Hapus</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </m.div>
            ))}
          </div>
        </section>
      ) : null)}
      {!history?.length && <EmptyState title="Belum ada riwayat" description="Catatan yang dibuka akan muncul di sini." />}
      {history?.length && !filtered.length && <EmptyState title="Tidak ada hasil" description={`Tidak ada catatan yang cocok dengan "${query}".`} />}
      <Sheet open={!!preview} onClose={() => setPreview(null)} title={preview?.title}>
        <div className="text-sm whitespace-pre-wrap">{preview?.contentText}</div>
      </Sheet>
    </div>
  );
}

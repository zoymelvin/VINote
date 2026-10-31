"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { listHistory, softDeleteNote, duplicateNote } from "@/lib/db/repo";
import { db } from "@/lib/db/db";
import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { groupHistoryDate } from "@/lib/utils";
import { useToast } from "@/stores/toast";
import Link from "next/link";
import type { Note } from "@/lib/notes/types";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { Tabs } from "@/components/ui/tabs";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";

const labels: Record<string, string> = { today: "Hari ini", yesterday: "Kemarin", week: "Minggu ini", older: "Lebih lama" };
const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "opened", label: "Dibuka" },
  { id: "edited", label: "Diedit" },
  { id: "created", label: "Dibuat" },
];

export default function RiwayatPage() {
  const history = useLiveQuery(() => listHistory(), []);
  const toast = useToast();
  const [preview, setPreview] = useState<Note | null>(null);
  const [filter, setFilter] = useState("all");
  const reduced = useReducedMotion();

  let filtered = history ?? [];
  if (filter === "opened") filtered = filtered.filter((n) => n.lastOpenedAt);
  if (filter === "edited") filtered = filtered.filter((n) => n.updatedAt !== n.createdAt);

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
      <div className="mb-6">
        <Tabs tabs={FILTERS} value={filter} onChange={setFilter} />
      </div>
      {Object.keys(groups).map((g) => groups[g].length ? (
        <section key={g} className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-muted)]">{labels[g]}</h2>
          <div className="space-y-2">
            {groups[g].map((n) => (
              <m.div
                key={n.id}
                initial={{ opacity: 0, y: reduced ? 0 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-[24px] bg-[var(--card)] p-4 shadow-[var(--shadow-1)]"
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
      <Sheet open={!!preview} onClose={() => setPreview(null)} title={preview?.title}>
        <div className="text-sm whitespace-pre-wrap">{preview?.contentText}</div>
      </Sheet>
    </div>
  );
}

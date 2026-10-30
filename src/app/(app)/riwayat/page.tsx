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

const labels: Record<string, string> = { today: "Hari ini", yesterday: "Kemarin", week: "Minggu ini", older: "Lebih lama" };

export default function RiwayatPage() {
  const history = useLiveQuery(() => listHistory(), []);
  const toast = useToast();
  const [preview, setPreview] = useState<Note | null>(null);
  const groups: Record<string, Note[]> = { today: [], yesterday: [], week: [], older: [] };
  (history ?? []).forEach((n: Note) => {
    groups[groupHistoryDate((n as Note).lastOpenedAt ?? (n as Note).updatedAt)].push(n as Note);
  });
  async function remove(n: { id: string }) {
    await softDeleteNote(n.id);
    toast.push({ message: "Dipindahkan ke Sampah", undo: async () => db.notes.update(n.id, { deletedAt: null }) });
  }
  return (
    <div className="p-4 md:p-8">
      <PageHeader title="Riwayat" description="Catatan yang pernah dibuka" />
      {Object.keys(groups).map((g) => groups[g].length ? (
        <section key={g} className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-muted)]">{labels[g]}</h2>
          <div className="grid gap-3 sm:grid-cols-2 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
            {groups[g].map((n) => (
              <div key={n.id} className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-1)]">
                <button className="w-full text-left" onClick={() => setPreview(n)}>
                  <div className="font-semibold">{n.title || "Tanpa judul"}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-[var(--text-muted)]">{n.contentText?.slice(0, 80)}</div>
                </button>
                <div className="mt-3 flex gap-2">
                  <Link href={`/catatan/${n.id}`} className="text-xs font-medium text-[var(--accent)]">Edit</Link>
                  <button className="text-xs" onClick={() => duplicateNote(n.id)}>Duplikat</button>
                  <button className="text-xs text-rose-600" onClick={() => remove(n)}>Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null)}
      {!history?.length && <EmptyState title="Belum ada riwayat" description="Catatan yang dibuka akan muncul di sini." />}
      <Sheet open={!!preview} onClose={() => setPreview(null)} title={preview?.title}>
        <div className="text-sm">{preview?.contentText}</div>
      </Sheet>
    </div>
  );
}

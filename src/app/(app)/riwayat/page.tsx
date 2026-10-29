"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { listHistory, softDeleteNote, duplicateNote } from "@/lib/db/repo";
import { db } from "@/lib/db/db";
import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
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
      <h1 className="mb-4 text-2xl font-bold">Riwayat</h1>
      {Object.keys(groups).map((g) => groups[g].length ? (
        <section key={g} className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-[var(--muted)]">{labels[g]}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {groups[g].map((n) => (
              <div key={n.id} className="rounded-2xl bg-[var(--card)] p-4 shadow-[var(--shadow-1)]">
                <button className="w-full text-left" onClick={() => setPreview(n)}>
                  <div className="font-medium">{n.title || "Tanpa judul"}</div>
                  <div className="text-xs text-[var(--muted)]">{n.contentText?.slice(0, 80)}</div>
                </button>
                <div className="mt-2 flex gap-2">
                  <Link href={`/catatan/${n.id}`} className="text-xs text-[var(--accent)]">Edit</Link>
                  <button className="text-xs" onClick={() => duplicateNote(n.id)}>Duplikat</button>
                  <button className="text-xs text-rose-600" onClick={() => remove(n)}>Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null)}
      <Sheet open={!!preview} onClose={() => setPreview(null)} title={preview?.title}>
        <div className="text-sm">{preview?.contentText}</div>
      </Sheet>
    </div>
  );
}

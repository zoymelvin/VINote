"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { listTrash, restoreNote, hardDeleteNote, emptyTrash } from "@/lib/db/repo";
import { Button } from "@/components/ui/button";

export default function SampahPage() {
  const trash = useLiveQuery(() => listTrash(), []);
  return (
    <div className="p-4 md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sampah</h1>
        <Button variant="danger" onClick={() => emptyTrash()}>Kosongkan</Button>
      </div>
      <div className="grid gap-3">
        {(trash ?? []).map((n) => (
          <div key={n.id} className="flex items-center justify-between rounded-2xl bg-[var(--card)] p-4">
            <span>{n.title || "Tanpa judul"}</span>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => restoreNote(n.id)}>Pulihkan</Button>
              <Button size="sm" variant="danger" onClick={() => hardDeleteNote(n.id)}>Hapus</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

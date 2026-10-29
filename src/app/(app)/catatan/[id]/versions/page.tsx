"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { useParams } from "next/navigation";
import { listRevisions, restoreRevision } from "@/lib/db/repo";
import { Button } from "@/components/ui/button";
import type { Revision } from "@/lib/notes/types";
import { useState } from "react";

export default function VersionsPage() {
  const params = useParams();
  const id = String(params.id);
  const revs = useLiveQuery(() => listRevisions(id), [id]);
  const [selected, setSelected] = useState<Revision | null>(null);
  return (
    <div className="p-4 md:p-8 space-y-4">
      <h1 className="text-2xl font-bold">Riwayat versi</h1>
      <div className="space-y-2">
        {(revs ?? []).slice().reverse().map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-2xl bg-[var(--card)] p-3">
            <button className="text-left" onClick={() => setSelected(r)}>{new Date(r.createdAt).toLocaleString()}</button>
            <Button size="sm" onClick={() => restoreRevision(id, r.id)}>Pulihkan</Button>
          </div>
        ))}
      </div>
      {selected && (
        <div className="rounded-2xl bg-[var(--card-muted)] p-4">
          <div className="font-medium">{selected.title}</div>
          <pre className="mt-2 whitespace-pre-wrap text-xs">{JSON.stringify(selected.content, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

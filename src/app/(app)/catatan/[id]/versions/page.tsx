"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { useParams } from "next/navigation";
import { listRevisions, restoreRevision } from "@/lib/db/repo";
import { Button } from "@/components/ui/button";
import type { Revision } from "@/lib/notes/types";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";

export default function VersionsPage() {
  const params = useParams();
  const id = String(params.id);
  const revs = useLiveQuery(() => listRevisions(id), [id]);
  const [selected, setSelected] = useState<Revision | null>(null);
  const reduced = useReducedMotion();

  return (
    <div className="p-4 md:p-8 space-y-4">
      <PageHeader title="Riwayat versi" description="Versi sebelumnya dari catatan ini" />
      {!revs?.length && <EmptyState title="Belum ada versi" description="Versi akan dibuat otomatis saat Anda mengedit." />}
      <div className="space-y-2">
        {(revs ?? []).slice().reverse().map((r) => (
          <m.div
            key={r.id}
            initial={{ opacity: 0, y: reduced ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-2xl bg-[var(--card)] p-4"
          >
            <button className="text-left flex-1" onClick={() => setSelected(r)}>
              <div className="font-medium">{r.title || "Tanpa judul"}</div>
              <div className="text-xs text-[var(--text-muted)]">{new Date(r.createdAt).toLocaleString("id-ID")}</div>
            </button>
            <Button size="sm" onClick={() => restoreRevision(id, r.id)}>Pulihkan</Button>
          </m.div>
        ))}
      </div>
      {selected && (
        <div className="rounded-2xl bg-[var(--card-muted)] p-4">
          <div className="font-medium">{selected.title}</div>
          <pre className="mt-2 whitespace-pre-wrap text-xs max-h-[40vh] overflow-y-auto">{JSON.stringify(selected.content, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

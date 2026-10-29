"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";

export default function KalenderPage() {
  const notes = useLiveQuery(() => db.notes.filter((n) => !n.deletedAt).toArray(), []);
  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-4 text-2xl font-bold">Kalender</h1>
      <div className="text-sm text-[var(--muted)]">{notes?.length ?? 0} catatan</div>
      <ul className="mt-4 space-y-2">
        {(notes ?? []).map((n) => <li key={n.id} className="rounded-2xl bg-[var(--card)] p-3">{n.title || "Tanpa judul"}</li>)}
      </ul>
    </div>
  );
}

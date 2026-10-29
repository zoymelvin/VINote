"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import { createNote } from "@/lib/db/repo";
import { NoteCard } from "@/components/notes/note-card";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const notes = useLiveQuery(() => db.notes.filter((n) => !n.deletedAt && !n.isArchived).toArray(), []);
  const router = useRouter();
  async function quick() {
    const n = await createNote({ type: "quick", title: "Catatan cepat" });
    router.push(`/catatan/${n.id}`);
  }
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">VINOTE</h1>
        <Button onClick={quick}><Plus size={18} /> Baru</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(notes ?? []).map((n) => <NoteCard key={n.id} note={n} />)}
      </div>
      {!notes?.length && <div className="mt-16 text-center text-[var(--muted)]">Belum ada catatan. Tekan + untuk mulai.</div>}
    </div>
  );
}

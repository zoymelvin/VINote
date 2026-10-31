"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { getCollection, updateCollection, softDeleteCollection, getNotesOfCollection, createNote } from "@/lib/db/repo";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteCard } from "@/components/notes/note-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";

export default function KoleksiDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const router = useRouter();
  const reduced = useReducedMotion();
  const collection = useLiveQuery(() => getCollection(id), [id]);
  const notes = useLiveQuery(() => getNotesOfCollection(id), [id]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(collection?.name ?? "");
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!collection) return <div className="p-4">Memuat...</div>;

  async function saveName() {
    await updateCollection(id, { name: name.trim() || "Tanpa judul" });
    setEditing(false);
  }

  async function addNoteHere() {
    const n = await createNote({ type: "text", title: "" });
    router.push(`/catatan/${n.id}`);
  }

  async function removeCollection() {
    await softDeleteCollection(id);
    router.push("/koleksi");
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.back()}><ArrowLeft size={18} /></Button>
        {editing ? (
          <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} onKeyDown={(e) => e.key === "Enter" && saveName()} autoFocus />
        ) : (
          <h1 onClick={() => setEditing(true)} className="cursor-pointer font-display text-2xl font-normal tracking-tight md:text-3xl">{collection.name}</h1>
        )}
      </div>

      {notes && notes.length === 0 ? (
        <EmptyState
          icon={<Plus size={32} className="text-[var(--accent)]" />}
          title="Belum ada catatan"
          description="Tambahkan catatan pertama ke koleksi ini."
          action={<Button onClick={addNoteHere}><Plus size={18} /> Catatan baru</Button>}
        />
      ) : (
        <>
          <div className="mb-4">
            <Button onClick={addNoteHere}><Plus size={18} /> Catatan baru di sini</Button>
          </div>
          <m.div variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : 0.04 } } }} initial="hidden" animate="show" className="columns-1 gap-3 sm:columns-2 lg:columns-3 [&>*]:break-inside-avoid [&>*]:mb-3">
            {(notes ?? []).map((n) => (
              <m.div key={n.id} variants={{ hidden: { opacity: 0, y: reduced ? 0 : 6 }, show: { opacity: 1, y: 0 } }}>
                <NoteCard note={n} />
              </m.div>
            ))}
          </m.div>
        </>
      )}

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Hapus koleksi">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">Pilih cara penghapusan:</p>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" onClick={() => { removeCollection(); }}>Hapus koleksi saja (catatan tetap ada)</Button>
            <Button variant="danger" onClick={removeCollection}>Hapus koleksi beserta catatannya</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

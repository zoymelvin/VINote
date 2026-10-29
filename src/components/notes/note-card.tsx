"use client";
import * as m from "motion/react-m";
import Link from "next/link";
import { db } from "@/lib/db/db";
import { softDeleteNote } from "@/lib/db/repo";
import { useToast } from "@/stores/toast";
import { Pin, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function NoteCard({ note }: { note: { id: string; title?: string; contentText?: string; color: string; isPinned?: boolean } }) {
  const toast = useToast();
  async function remove() {
    await softDeleteNote(note.id);
    toast.push({ message: "Dipindahkan ke Sampah", undo: async () => { await db.notes.update(note.id, { deletedAt: null }); } });
  }
  return (
    <m.div layoutId={`note-${note.id}`} className={cn("card-color-" + note.color, "rounded-[24px] p-4 shadow-[var(--shadow-1)]")} style={{ background: "var(--note)" }}>
      <Link href={`/catatan/${note.id}`} className="block">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-[var(--foreground)]">{note.title || "Tanpa judul"}</h3>
          {note.isPinned && <Pin size={14} />}
        </div>
        <p className="line-clamp-3 text-sm text-[var(--foreground)]/80">{note.contentText || ""}</p>
      </Link>
      <div className="mt-3 flex gap-2">
        <button onClick={remove} className="text-xs text-rose-600" aria-label="Hapus"><Trash2 size={14} /></button>
      </div>
    </m.div>
  );
}

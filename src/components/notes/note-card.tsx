"use client";
import * as m from "motion/react-m";
import Link from "next/link";
import { db } from "@/lib/db/db";
import { softDeleteNote } from "@/lib/db/repo";
import { useToast } from "@/stores/toast";
import { Pin, Trash2 } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NoteCard({ note }: { note: { id: string; title?: string; contentText?: string; color: string; isPinned?: boolean } }) {
  const toast = useToast();
  async function remove() {
    await softDeleteNote(note.id);
    toast.push({ message: "Dipindahkan ke Sampah", undo: async () => { await db.notes.update(note.id, { deletedAt: null }); } });
  }
  const color = note.color;
  return (
    <m.div
      layoutId={`note-${note.id}`}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-[24px] border border-black/5 p-4 shadow-[var(--shadow-1)] transition-transform [@media(hover:hover)]:hover:-translate-y-[2px]",
        "dark:border-white/10",
      )}
      style={{ background: `var(--note-${color}-bg)`, color: `var(--note-${color}-fg)` }}
    >
      <Link href={`/catatan/${note.id}`} className="block">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-semibold">{note.title || "Tanpa judul"}</h3>
          {note.isPinned && <Icon icon={Pin} size={16} />}
        </div>
        <p className="line-clamp-3 text-sm opacity-90">{note.contentText || ""}</p>
      </Link>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs opacity-70">{note.type}</span>
        <IconButton label="Hapus" onClick={remove} className="text-current hover:bg-black/10 dark:hover:bg-white/10">
          <Icon icon={Trash2} size={16} />
        </IconButton>
      </div>
    </m.div>
  );
}

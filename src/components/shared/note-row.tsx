"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db/db";
import { softDeleteNote, togglePinNote, duplicateNote, archiveNote, unarchiveNote } from "@/lib/db/repo";
import { useToast } from "@/stores/toast";
import { Icon } from "@/components/icons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Note } from "@/lib/notes/types";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import { NoteTypeIcon } from "@/components/shared/note-type-icon";

export function NoteRow({ note, onPreview, compact }: { note: Note; onPreview?: () => void; compact?: boolean }) {
  const toast = useToast();
  const router = useRouter();
  const reduced = useReducedMotion();

  async function remove() {
    await softDeleteNote(note.id);
    toast.push({ message: "Dipindahkan ke Sampah", undo: async () => { await db.notes.update(note.id, { deletedAt: null }); } });
  }

  async function onPin() {
    await togglePinNote(note.id);
    toast.push({ message: note.isPinned ? "Dilepas sematan" : "Disematkan" });
  }

  async function onDuplicate() {
    await duplicateNote(note.id);
    toast.push({ message: "Catatan diduplikasi" });
  }

  async function onArchive() {
    if (note.isArchived) {
      await unarchiveNote(note.id);
      toast.push({ message: "Diarsipkan" });
    } else {
      await archiveNote(note.id);
      toast.push({ message: "Diarsipkan" });
    }
  }

  const color = note.color || "polos";
  return (
    <m.div
      initial={{ opacity: 0, y: reduced ? 0 : 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0 }}
      className={cn("flex items-center gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--card)] p-3", compact && "p-2")}
    >
      <NoteTypeIcon type={note.type} size={20} />
      <button className="flex-1 text-left" onClick={() => router.push(`/catatan/${note.id}`)}>
        <div className="font-semibold">{note.title || "Tanpa judul"}</div>
        <div className="mt-0.5 line-clamp-1 text-xs text-[var(--text-muted)]">{note.contentText?.slice(0, 80)}</div>
      </button>
      <div className="text-xs text-[var(--text-muted)]">{new Date((note.lastOpenedAt ?? note.updatedAt)).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl hover:bg-[var(--card-muted)]">
            <Icon icon={require("@phosphor-icons/react").DotsThree} size={18} weight="bold" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onPin}>{note.isPinned ? "Lepas sematan" : "Sematkan"}</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => {}}>Tambahkan ke Koleksi...</DropdownMenuItem>
          <DropdownMenuItem onSelect={onDuplicate}>Duplikat</DropdownMenuItem>
          <DropdownMenuItem onSelect={onArchive}>{note.isArchived ? "Keluarkan dari arsip" : "Arsipkan"}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={remove} className="text-rose-600">Hapus</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </m.div>
  );
}

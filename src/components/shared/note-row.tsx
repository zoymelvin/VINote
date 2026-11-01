"use client";
import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db/db";
import { softDeleteNote, togglePinNote, duplicateNote, archiveNote, unarchiveNote, restoreNote } from "@/lib/db/repo";
import { useToast } from "@/stores/toast";
import { Icon } from "@/components/icons";
import { openCollectionPicker } from "@/components/shared/collection-picker-provider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn, getDisplayTitle } from "@/lib/utils";
import type { Note } from "@/lib/notes/types";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import { NoteTypeIcon } from "@/components/shared/note-type-icon";
import { DotsThree, ArrowCounterClockwise } from "@phosphor-icons/react";

export function NoteRow({ note, onRemove, compact, archived, trashed }: { note: Note; onRemove?: () => void; compact?: boolean; archived?: boolean; trashed?: boolean }) {
  const toast = useToast();
  const router = useRouter();
  const reduced = useReducedMotion();

  async function handleRemove() {
    await softDeleteNote(note.id);
    toast.push({ message: "Dipindahkan ke Sampah", undo: async () => { await db.notes.update(note.id, { deletedAt: null }); } });
    onRemove?.();
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
      toast.push({ message: "Dikeluarkan dari arsip", undo: async () => { await archiveNote(note.id); } });
    } else {
      await archiveNote(note.id);
      toast.push({ message: "Diarsipkan" });
    }
  }

  async function onUnarchive() {
    await unarchiveNote(note.id);
    toast.push({ message: "Dikeluarkan dari arsip", undo: async () => { await archiveNote(note.id); } });
  }

  async function onRestore() {
    await restoreNote(note.id);
    toast.push({ message: "Catatan dipulihkan", undo: async () => { await softDeleteNote(note.id); } });
  }

  const color = note.color || "polos";
  return (
    <>
      <m.div
      initial={{ opacity: 0, y: reduced ? 0 : 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0 }}
      className={cn("group relative flex cursor-pointer items-center gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--card)] p-3", compact && "p-2")}
    >
      <Link href={`/catatan/${note.id}`} className="absolute inset-0 z-0 rounded-[inherit]" aria-label={`Buka catatan: ${getDisplayTitle(note)}`} />
      <div className="relative z-[1] pointer-events-none flex items-center gap-3 flex-1 min-w-0">
        <NoteTypeIcon type={note.type} size={20} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold">{getDisplayTitle(note)}</div>
          <div className="mt-0.5 line-clamp-1 text-xs text-[var(--text-muted)]">{note.contentText?.slice(0, 80)}</div>
        </div>
        <div className="text-xs text-[var(--text-muted)]">{new Date((note.lastOpenedAt ?? note.updatedAt)).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>
      </div>
      <div className="relative z-[2] pointer-events-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl hover:bg-[var(--card-muted)]" onClick={(e) => e.stopPropagation()}>
              <Icon icon={DotsThree} size={18} weight="bold" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {trashed ? (
              <DropdownMenuItem onSelect={onRestore}>
                <Icon icon={ArrowCounterClockwise} size={18} /> Pulihkan
              </DropdownMenuItem>
            ) : archived ? (
              <>
                <DropdownMenuItem onSelect={onUnarchive}>Keluarkan dari arsip</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { openCollectionPicker(note.id); }}>Tambahkan ke Koleksi...</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleRemove} className="text-rose-600">Hapus</DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onSelect={onPin}>{note.isPinned ? "Lepas sematan" : "Sematkan"}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { openCollectionPicker(note.id); }}>Tambahkan ke Koleksi...</DropdownMenuItem>
                <DropdownMenuItem onSelect={onDuplicate}>Duplikat</DropdownMenuItem>
                <DropdownMenuItem onSelect={onArchive}>{note.isArchived ? "Keluarkan dari arsip" : "Arsipkan"}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleRemove} className="text-rose-600">Hapus</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </m.div>
    </>
  );
}

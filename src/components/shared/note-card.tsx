"use client";
import * as React from "react";
import Link from "next/link";
import { db } from "@/lib/db/db";
import { softDeleteNote, togglePinNote, toggleFavoriteNote, duplicateNote, archiveNote, unarchiveNote } from "@/lib/db/repo";
import { useToast } from "@/stores/toast";
import { Icon } from "@/components/icons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import type { Note } from "@/lib/notes/types";
import { useState, useRef } from "react";
import * as m from "motion/react-m";
import { NoteTypeIcon } from "@/components/shared/note-type-icon";
import { DotsThree, PushPin, Bell } from "@phosphor-icons/react";

export function NoteCard({ note, compact }: { note: Note; compact?: boolean }) {
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const touchStartX = useRef(0);

  async function remove() {
    await softDeleteNote(note.id);
    toast.push({ message: "Dipindahkan ke Sampah", undo: async () => { await db.notes.update(note.id, { deletedAt: null }); } });
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd() {
  }

  async function onPin() {
    await togglePinNote(note.id);
    toast.push({ message: note.isPinned ? "Dilepas sematan" : "Disematkan" });
  }

  async function onFavorite() {
    await toggleFavoriteNote(note.id);
    toast.push({ message: note.isFavorite ? "Dihapus dari favorit" : "Ditambahkan ke favorit" });
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
    <ContextMenu>
      <ContextMenuTrigger>
        <m.article
          layoutId={`note-${note.id}`}
          whileTap={{ scale: 0.98 }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={cn(
            "group relative rounded-[16px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-1)] transition-transform [@media(hover:hover)]:hover:-translate-y-[2px]",
            compact && "p-3"
          )}
          style={{ color: `var(--note-${color}-fg)` }}
        >
          <Link href={`/catatan/${note.id}`} className="absolute inset-0 z-0" aria-label={`Buka catatan: ${note.title || "Tanpa judul"}`} />
          <div className="relative z-[1]">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <NoteTypeIcon type={note.type} size={18} />
                <h3 className={cn("font-semibold", compact ? "text-sm" : "text-base")}>{note.title || "Tanpa judul"}</h3>
              </div>
              <div className="flex items-center gap-1">
                 {note.isPinned && <Icon icon={PushPin} size={14} weight="fill" className="text-[var(--accent)]" />}
                 <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                   <DropdownMenuTrigger asChild>
                     <button
                       className={cn(
                         "flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl",
                         "opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
                       )}
                       onClick={(e) => e.stopPropagation()}
                     >
                       <Icon icon={DotsThree} size={18} weight="bold" />
                     </button>
                   </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onCloseAutoFocus={() => {}}>
                    <DropdownMenuItem onSelect={onPin}>{note.isPinned ? "Lepas sematan" : "Sematkan"}</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => {}}>Tambahkan ke Koleksi...</DropdownMenuItem>
                    <DropdownMenuItem onSelect={onDuplicate}>Duplikat</DropdownMenuItem>
                    <DropdownMenuItem onSelect={onArchive}>{note.isArchived ? "Keluarkan dari arsip" : "Arsipkan"}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={remove} className="text-rose-600">Hapus</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <p className={cn("line-clamp-4 text-[var(--text-muted)]", compact ? "text-xs" : "text-sm")}>{note.contentText || ""}</p>
            {note.reminderAt && (
              <div className="mt-2 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <Icon icon={Bell} size={12} weight="regular" />
                <span>{new Date(note.reminderAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            )}
          </div>
        </m.article>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={onPin}>{note.isPinned ? "Lepas sematan" : "Sematkan"}</ContextMenuItem>
        <ContextMenuItem onSelect={() => {}}>Tambahkan ke Koleksi...</ContextMenuItem>
        <ContextMenuItem onSelect={onDuplicate}>Duplikat</ContextMenuItem>
        <ContextMenuItem onSelect={onArchive}>{note.isArchived ? "Keluarkan dari arsip" : "Arsipkan"}</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={remove} className="text-rose-600">Hapus</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

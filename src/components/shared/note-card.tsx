"use client";
import * as React from "react";
import Link from "next/link";
import { db } from "@/lib/db/db";
import { softDeleteNote, togglePinNote, toggleFavoriteNote, duplicateNote, archiveNote, unarchiveNote } from "@/lib/db/repo";
import { useToast } from "@/stores/toast";
import { Icon } from "@/components/icons";
import { openCollectionPicker } from "@/components/shared/collection-picker-provider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { cn, getDisplayTitle } from "@/lib/utils";
import type { Note } from "@/lib/notes/types";
import { useState, useRef } from "react";
import * as m from "motion/react-m";
import { NoteTypeIcon } from "@/components/shared/note-type-icon";
import { DotsThree, PushPin, Copy, Archive, Trash, FolderSimplePlus, Bell } from "@phosphor-icons/react";

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
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <m.article
            layoutId={`note-${note.id}`}
            whileTap={{ scale: 0.985 }}
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-1)] transition-transform [@media(hover:hover)]:hover:-translate-y-[1px]",
              compact && "p-3"
            )}
            style={{ color: `var(--note-${color}-fg)` }}
          >
            <Link href={`/catatan/${note.id}`} className="absolute inset-0 z-0 rounded-[inherit]" aria-label={`Buka catatan: ${getDisplayTitle(note)}`} />
            <div className="pointer-events-none">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-start gap-2 pr-11">
                  <h3 className={cn("line-clamp-2 min-w-0 break-words font-semibold", compact ? "text-sm" : "text-base")}>{getDisplayTitle(note)}</h3>
                </div>
              </div>
              <p className={cn("line-clamp-3 break-words text-[var(--text-muted)]", compact ? "text-xs" : "text-sm")}>{note.contentText || ""}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <NoteTypeIcon type={note.type} size={14} />
                <span>{new Date(note.updatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                {note.isPinned && <Icon icon={PushPin} size={14} weight="fill" className="text-[var(--accent)]" />}
              </div>
            </div>
            <div className="pointer-events-auto absolute right-2 top-2 z-[2]">
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
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem icon={<Icon icon={PushPin} size={18} />} onSelect={onPin}>{note.isPinned ? "Lepas sematan" : "Sematkan"}</DropdownMenuItem>
                      <DropdownMenuItem icon={<Icon icon={FolderSimplePlus} size={18} />} onSelect={() => { setMenuOpen(false); setTimeout(() => openCollectionPicker(note.id), 100); }}>Tambahkan ke Koleksi...</DropdownMenuItem>
                      <DropdownMenuItem icon={<Icon icon={Copy} size={18} />} onSelect={onDuplicate}>Duplikat</DropdownMenuItem>
                      <DropdownMenuItem icon={<Icon icon={Archive} size={18} />} onSelect={onArchive}>{note.isArchived ? "Keluarkan dari arsip" : "Arsipkan"}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem icon={<Icon icon={Trash} size={18} />} onSelect={remove} className="text-rose-600">Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              {note.reminderAt && (
                <div className="mt-2 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Icon icon={Bell} size={12} weight="regular" />
                  <span>{new Date(note.reminderAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              )}
          </m.article>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={onPin}>{note.isPinned ? "Lepas sematan" : "Sematkan"}</ContextMenuItem>
          <ContextMenuItem onSelect={() => { setMenuOpen(false); setTimeout(() => openCollectionPicker(note.id), 100); }}>Tambahkan ke Koleksi...</ContextMenuItem>
          <ContextMenuItem onSelect={onDuplicate}>Duplikat</ContextMenuItem>
          <ContextMenuItem onSelect={onArchive}>{note.isArchived ? "Keluarkan dari arsip" : "Arsipkan"}</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={remove} className="text-rose-600">Hapus</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}

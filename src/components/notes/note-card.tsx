"use client";
import * as m from "motion/react-m";
import Link from "next/link";
import { db } from "@/lib/db/db";
import { softDeleteNote, togglePinNote, toggleFavoriteNote, duplicateNote, archiveNote, unarchiveNote } from "@/lib/db/repo";
import { useToast } from "@/stores/toast";
import { Pin, MoreHorizontal, Clock, FileText, CheckSquare, SquareCode, Zap, BookOpen, Mic, Paintbrush, Bookmark, Copy } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import type { Note } from "@/lib/notes/types";
import { useState, useRef } from "react";

const TYPE_ICON: Record<string, typeof FileText> = {
  text: FileText,
  checklist: CheckSquare,
  markdown: FileText,
  code: SquareCode,
  quick: Zap,
  journal: BookOpen,
  voice: Mic,
  drawing: Paintbrush,
  bookmark: Bookmark,
  template: Copy,
};

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

  const color = note.color;
  const TypeIcon = TYPE_ICON[note.type] || FileText;
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <m.div
          layoutId={`note-${note.id}`}
          whileTap={{ scale: 0.98 }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={cn(
            "group relative rounded-[24px] border border-[var(--border)] p-4 shadow-[var(--shadow-1)] transition-transform [@media(hover:hover)]:hover:-translate-y-[2px]",
            "dark:border-white/10",
            compact && "p-3"
          )}
          style={{ background: `var(--note-${color}-bg)`, color: `var(--note-${color}-fg)` }}
        >
          <Link href={`/catatan/${note.id}`} className="block">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-black/5 dark:bg-white/10">
                  <Icon icon={TypeIcon} size={18} />
                </div>
                <h3 className={cn("font-semibold", compact ? "text-sm" : "text-base")}>{note.title || "Tanpa judul"}</h3>
              </div>
              <div className="flex items-center gap-1">
                {note.isPinned && <Icon icon={Pin} size={14} />}
                <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <button className={cn("flex h-8 w-8 items-center justify-center rounded-xl opacity-0 transition-opacity", "group-hover:opacity-100 focus:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100")} onClick={(e) => e.preventDefault()}>
                      <Icon icon={MoreHorizontal} size={18} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onPin}>{note.isPinned ? "Lepas sematan" : "Sematkan"}</DropdownMenuItem>
                    <DropdownMenuItem onClick={onFavorite}>{note.isFavorite ? "Hapus favorit" : "Favorit"}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {}}>Ubah warna</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>Tambah tag...</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>Atur pengingat...</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDuplicate}>Duplikat</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>Bagikan</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>Ekspor</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>Riwayat versi</DropdownMenuItem>
                    <DropdownMenuItem onClick={onArchive}>{note.isArchived ? "Keluarkan dari arsip" : "Arsipkan"}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={remove} className="text-rose-600">Hapus</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <p className={cn("line-clamp-4 opacity-90", compact ? "text-xs" : "text-sm")}>{note.contentText || ""}</p>
            {note.reminderAt && (
              <div className="mt-2 flex items-center gap-1 text-xs opacity-70">
                <Icon icon={Clock} size={12} />
                <span>{new Date(note.reminderAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            )}
          </Link>
        </m.div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onPin}>{note.isPinned ? "Lepas sematan" : "Sematkan"}</ContextMenuItem>
        <ContextMenuItem onClick={onFavorite}>{note.isFavorite ? "Hapus favorit" : "Favorit"}</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDuplicate}>Duplikat</ContextMenuItem>
        <ContextMenuItem onClick={onArchive}>{note.isArchived ? "Keluarkan dari arsip" : "Arsipkan"}</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={remove} className="text-rose-600">Hapus</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

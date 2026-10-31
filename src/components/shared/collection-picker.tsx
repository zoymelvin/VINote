"use client";
import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { listCollections, getCollectionsOfNote, addNoteToCollections, removeNoteFromCollection, createCollection } from "@/lib/db/repo";
import { Icon } from "@/components/icons";
import { CollectionIcon } from "@/components/shared/collection-icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Plus, Check, MagnifyingGlass } from "@phosphor-icons/react";

interface CollectionPickerProps {
  noteId: string | null; // null for draft mode
  onDraftChange?: (collectionIds: string[]) => void;
  draftCollections?: string[];
  open: boolean;
  onClose: () => void;
}

export function CollectionPicker({ noteId, onDraftChange, draftCollections, open, onClose }: CollectionPickerProps) {
  const collections = useLiveQuery(() => listCollections(), []);
  const noteCollections = useLiveQuery(
    () => (noteId ? getCollectionsOfNote(noteId) : Promise.resolve([])),
    [noteId]
  );
  const [query, setQuery] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState("");

  const selectedIds = React.useMemo(() => {
    if (noteId) {
      return new Set((noteCollections ?? []).map((c) => c.id));
    }
    return new Set(draftCollections ?? []);
  }, [noteId, noteCollections, draftCollections]);

  const filtered = React.useMemo(() => {
    const all = collections ?? [];
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter((c) => c.name.toLowerCase().includes(q));
  }, [collections, query]);

  const sorted = React.useMemo(() => {
    const sel = filtered.filter((c) => selectedIds.has(c.id));
    const unsel = filtered.filter((c) => !selectedIds.has(c.id));
    return [...sel, ...unsel];
  }, [filtered, selectedIds]);

  async function toggle(cid: string) {
    if (noteId) {
      if (selectedIds.has(cid)) {
        await removeNoteFromCollection(noteId, cid);
      } else {
        await addNoteToCollections(noteId, [cid]);
      }
    } else {
      const next = new Set(selectedIds);
      if (next.has(cid)) next.delete(cid);
      else next.add(cid);
      onDraftChange?.([...next]);
    }
  }

  async function createNew() {
    if (!newName.trim()) return;
    const c = await createCollection({ name: newName.trim() });
    if (noteId) {
      await addNoteToCollections(noteId, [c.id]);
    } else {
      const next = new Set(selectedIds);
      next.add(c.id);
      onDraftChange?.([...next]);
    }
    setNewName("");
    setCreating(false);
  }

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} title="Tambahkan ke Koleksi">
      <div className="space-y-3">
        <div className="relative">
          <Icon icon={MagnifyingGlass} size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari koleksi..." className="pl-10" />
        </div>
        <div className="max-h-[40vh] overflow-y-auto space-y-1">
          {sorted.map((c) => (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[var(--card-muted)]"
            >
              <CollectionIcon icon={c.icon} color={c.color} size={28} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{c.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{c.description || "Koleksi"}</div>
              </div>
              <div className={cn("flex h-6 w-6 items-center justify-center rounded-md border transition", selectedIds.has(c.id) ? "bg-[var(--accent)] border-[var(--accent)] text-white" : "border-[var(--border)]")}>
                {selectedIds.has(c.id) && <Icon icon={Check} size={14} weight="bold" />}
              </div>
            </button>
          ))}
          {sorted.length === 0 && !creating && (
            <div className="py-4 text-center text-sm text-[var(--text-muted)]">Tidak ada koleksi</div>
          )}
        </div>
        {creating ? (
          <div className="flex gap-2">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nama koleksi baru" autoFocus onKeyDown={(e) => e.key === "Enter" && createNew()} />
            <Button size="sm" onClick={createNew}>Buat</Button>
            <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>Batal</Button>
          </div>
        ) : (
          <button onClick={() => setCreating(true)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-[var(--accent)] hover:bg-[var(--card-muted)]">
            <Icon icon={Plus} size={18} />
            <span>Koleksi baru...</span>
          </button>
        )}
      </div>
    </Dialog>
  );
}

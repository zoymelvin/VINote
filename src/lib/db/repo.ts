import { db } from "@/lib/db/db";
import type { Note, Collection, Tag, CardColor, Settings, NoteCollection, Backup } from "@/lib/notes/types";
import { uid, now } from "@/lib/utils";
import { normalizeCardColor } from "@/lib/notes/types";
import Fuse from "fuse.js";

export async function createNote(input: Partial<Note> = {}): Promise<Note> {
  const t = now();
  const note: Note = {
    id: input.id ?? uid(),
    userId: input.userId,
    type: input.type ?? "text",
    title: input.title ?? "",
    content: input.content ?? { type: "doc", content: [{ type: "paragraph" }] },
    contentText: input.contentText ?? "",
    color: normalizeCardColor(input.color),
    folderId: input.folderId ?? null,
    isPinned: input.isPinned ?? false,
    isFavorite: input.isFavorite ?? false,
    isArchived: input.isArchived ?? false,
    isLocked: input.isLocked ?? false,
    reminderAt: input.reminderAt ?? null,
    sortOrder: input.sortOrder ?? t,
    createdAt: input.createdAt ?? t,
    updatedAt: input.updatedAt ?? t,
    deletedAt: null,
    lastOpenedAt: input.lastOpenedAt ?? t,
    historyHiddenAt: null,
    version: input.version ?? 1,
  };
  await db.notes.put(note);
  if (input.folderId) {
    await addNoteToCollections(note.id, [input.folderId], note.userId);
  }
  return note;
}

export async function getNote(id: string) {
  return db.notes.get(id);
}

export async function updateNote(id: string, patch: Partial<Note>) {
  const current = await db.notes.get(id);
  if (!current) return null;
  const changed =
    (patch.title !== undefined && patch.title !== current.title) ||
    (patch.content !== undefined && JSON.stringify(patch.content) !== JSON.stringify(current.content));
  if (changed) {
    await db.revisions.add({
      id: uid(),
      noteId: id,
      userId: current.userId,
      title: current.title,
      content: current.content,
      createdAt: now(),
    });
    const revs = await db.revisions.where("noteId").equals(id).sortBy("createdAt");
    if (revs.length > 50) {
      const toDelete = revs.slice(0, revs.length - 50);
      await db.revisions.bulkDelete(toDelete.map((r) => r.id));
    }
  }
  const updated: Note = {
    ...current,
    ...patch,
    id,
    updatedAt: patch.updatedAt ?? now(),
    version: changed ? current.version + 1 : current.version,
    color: patch.color ? normalizeCardColor(patch.color) : current.color,
  };
  await db.notes.put(updated);
  return updated;
}

export async function openNote(id: string) {
  return updateNote(id, { lastOpenedAt: now() });
}

export async function softDeleteNote(id: string) {
  return updateNote(id, { deletedAt: now() });
}

export async function restoreNote(id: string) {
  return updateNote(id, { deletedAt: null });
}

export async function hardDeleteNote(id: string) {
  await db.notes.delete(id);
  await db.revisions.where("noteId").equals(id).delete();
  await db.noteTags.where("noteId").equals(id).delete();
  await db.noteCollections.where("noteId").equals(id).delete();
}

export async function emptyTrash() {
  const trashed = await db.notes.filter((n) => n.deletedAt !== null).toArray();
  for (const n of trashed) await hardDeleteNote(n.id);
}

export async function duplicateNote(id: string) {
  const n = await db.notes.get(id);
  if (!n) return null;
  const collections = (await getCollectionsOfNote(id)).map((c) => c.id);
  const dup = await createNote({ ...n, id: undefined, title: `${n.title} (salinan)`, createdAt: undefined, updatedAt: undefined });
  if (collections.length) await addNoteToCollections(dup.id, collections, dup.userId);
  return dup;
}

export async function archiveNote(id: string) {
  return updateNote(id, { isArchived: true });
}

export async function unarchiveNote(id: string) {
  return updateNote(id, { isArchived: false });
}

export async function moveNoteToCollection(id: string, collectionId: string | null) {
  return updateNote(id, { folderId: collectionId });
}

export async function togglePinNote(id: string) {
  const n = await db.notes.get(id);
  if (!n) return null;
  return updateNote(id, { isPinned: !n.isPinned });
}

export async function toggleFavoriteNote(id: string) {
  const n = await db.notes.get(id);
  if (!n) return null;
  return updateNote(id, { isFavorite: !n.isFavorite });
}

export async function listNotes(filter?: { includeDeleted?: boolean; archived?: boolean; collectionId?: string | null }) {
  let all = await db.notes.toArray();
  if (!filter?.includeDeleted) all = all.filter((n) => !n.deletedAt);
  if (filter?.archived === false) all = all.filter((n) => !n.isArchived);
  if (filter?.collectionId !== undefined && filter.collectionId !== null) {
    const noteIds = new Set(
      (await db.noteCollections.where("collectionId").equals(filter.collectionId).filter((r) => !r.deletedAt).toArray()).map((r) => r.noteId)
    );
    if (noteIds.size) {
      all = all.filter((n) => noteIds.has(n.id));
    } else {
      all = [];
    }
  }
  return all.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

export async function listHistory() {
  const all = await db.notes.filter((n) => !n.deletedAt && (n.historyHiddenAt == null || (n.lastOpenedAt ?? n.updatedAt) > (n.historyHiddenAt ?? 0))).toArray();
  return all.sort((a, b) => (b.lastOpenedAt ?? b.updatedAt) - (a.lastOpenedAt ?? a.updatedAt));
}

export async function listTrash() {
  return db.notes.filter((n) => n.deletedAt !== null).toArray();
}

export async function searchNotes(query: string, tagIds?: string[]) {
  const all = await listNotes();
  let filtered = all;
  if (tagIds?.length) {
    const withTags = await Promise.all(all.map(async (n) => ({ note: n, tags: await noteTags(n.id) })));
    filtered = withTags.filter(({ tags }) => tagIds.some((tid) => tags.some((t) => t.id === tid))).map(({ note }) => note);
  }
  if (!query.trim()) return filtered;
  const fuse = new Fuse(filtered, {
    keys: [
      { name: "title", weight: 0.5 },
      { name: "contentText", weight: 0.3 },
    ],
    threshold: 0.35,
    includeMatches: true,
    ignoreLocation: true,
    useExtendedSearch: false,
  });
  return fuse.search(query).map((r) => r.item);
}

export async function listRevisions(noteId: string) {
  return db.revisions.where("noteId").equals(noteId).sortBy("createdAt");
}

export async function restoreRevision(noteId: string, revisionId: string) {
  const rev = await db.revisions.get(revisionId);
  if (!rev) return null;
  const current = await db.notes.get(noteId);
  if (current) {
    await db.revisions.add({
      id: uid(),
      noteId,
      userId: current.userId,
      title: current.title,
      content: current.content,
      createdAt: now(),
    });
  }
  return updateNote(noteId, { title: rev.title, content: rev.content });
}

// Collections
export async function createCollection(input: Partial<Collection> = {}) {
  const t = now();
  const name = input.name?.trim() || "Koleksi baru";
  const userId = input.userId ?? "";
  const existing = await db.folders.filter((f) => !f.deletedAt && (f.userId || "") === userId && f.name.toLowerCase() === name.toLowerCase()).first();
  if (existing) {
    return existing;
  }
  const collection: Collection = {
    id: input.id ?? uid(),
    userId: input.userId,
    name,
    color: input.color ?? "#6366f1",
    icon: input.icon ?? "📁",
    description: input.description ?? "",
    cover: input.cover ?? "",
    parentId: input.parentId ?? null,
    smartRule: input.smartRule ?? null,
    isPinned: input.isPinned ?? false,
    sortOrder: input.sortOrder ?? t,
    createdAt: input.createdAt ?? t,
    updatedAt: input.updatedAt ?? t,
    deletedAt: null,
  };
  await db.folders.put(collection);
  return collection;
}

export async function listCollections() {
  return db.folders.filter((f) => !f.deletedAt).toArray();
}

export async function getCollection(id: string) {
  return db.folders.get(id);
}

export async function updateCollection(id: string, patch: Partial<Collection>) {
  const current = await db.folders.get(id);
  if (!current) return null;
  const updated = { ...current, ...patch, id, updatedAt: now() };
  await db.folders.put(updated);
  return updated;
}

export async function softDeleteCollection(id: string) {
  return updateCollection(id, { deletedAt: now() });
}

export async function listSmartCollections() {
  const all = await db.folders.filter((f) => !f.deletedAt && f.smartRule !== null).toArray();
  return all;
}

// Multi-collection
export async function addNoteToCollections(noteId: string, collectionIds: string[], userId?: string) {
  const t = now();
  const rels: NoteCollection[] = collectionIds.map((cid) => ({
    noteId,
    collectionId: cid,
    userId,
    createdAt: t,
    updatedAt: t,
    deletedAt: null,
  }));
  await db.noteCollections.bulkPut(rels);
}

export async function removeNoteFromCollection(noteId: string, collectionId: string) {
  await db.noteCollections.where("[noteId+collectionId]").equals([noteId, collectionId]).modify({ deletedAt: now() });
}

export async function setNoteCollections(noteId: string, collectionIds: string[], userId?: string) {
  const existing = await db.noteCollections.where("noteId").equals(noteId).toArray();
  const target = new Set(collectionIds);
  const toRemove = existing.filter((r) => !target.has(r.collectionId) && !r.deletedAt);
  const toAdd = collectionIds.filter((cid) => !existing.some((r) => r.collectionId === cid && !r.deletedAt));
  await db.noteCollections.where("[noteId+collectionId]").anyOf(toRemove.map((r) => [r.noteId, r.collectionId])).modify({ deletedAt: now() });
  if (toAdd.length) await addNoteToCollections(noteId, toAdd, userId);
}

export async function getCollectionsOfNote(noteId: string) {
  const rels = await db.noteCollections.where("noteId").equals(noteId).filter((r) => !r.deletedAt).toArray();
  const collections = await db.folders.bulkGet(rels.map((r) => r.collectionId));
  return collections.filter((c): c is Collection => !!c && !c.deletedAt);
}

export async function getNotesOfCollection(collectionId: string) {
  const rels = await db.noteCollections.where("collectionId").equals(collectionId).filter((r) => !r.deletedAt).toArray();
  const notes = await db.notes.bulkGet(rels.map((r) => r.noteId));
  return notes.filter((n): n is Note => !!n && !n.deletedAt).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

export async function countByCollection() {
  const all = await db.noteCollections.toArray();
  const counts: Record<string, number> = {};
  for (const r of all) {
    if (r.deletedAt) continue;
    counts[r.collectionId] = (counts[r.collectionId] || 0) + 1;
  }
  return counts;
}

// Tags
export async function createTag(input: Partial<Tag> = {}) {
  const tag: Tag = {
    id: input.id ?? uid(),
    userId: input.userId,
    name: input.name ?? "tag",
    color: input.color ?? "#64748b",
  };
  await db.tags.put(tag);
  return tag;
}

export async function listTags() {
  return db.tags.toArray();
}

export async function addTagToNote(noteId: string, tagId: string, userId?: string) {
  await db.noteTags.put({ noteId, tagId, userId });
}

export async function removeTagFromNote(noteId: string, tagId: string) {
  await db.noteTags.where("[noteId+tagId]").equals([noteId, tagId]).delete();
}

export async function noteTags(noteId: string) {
  const links = await db.noteTags.where("noteId").equals(noteId).toArray();
  const tags = await db.tags.bulkGet(links.map((l) => l.tagId));
  return tags.filter(Boolean) as Tag[];
}

export async function getSettings(userId: string) {
  return db.settings.get(userId);
}

export async function saveSettings(s: Settings) {
  await db.settings.put(s);
  return s;
}

export async function createBackup(): Promise<Backup> {
  const notes = await db.notes.toArray();
  const data = JSON.stringify(notes);
  const backup: Backup = {
    id: uid(),
    createdAt: now(),
    data,
    size: data.length,
  };
  await db.backups.add(backup);
  // Keep only 3 most recent
  const all = await db.backups.orderBy("createdAt").reverse().toArray();
  if (all.length > 3) {
    const toDelete = all.slice(3);
    await db.backups.bulkDelete(toDelete.map((b) => b.id));
  }
  return backup;
}

export async function listBackups() {
  return db.backups.orderBy("createdAt").reverse().toArray();
}

export async function restoreBackup(backupId: string) {
  const backup = await db.backups.get(backupId);
  if (!backup) return null;
  const notes = JSON.parse(backup.data) as Note[];
  await db.notes.bulkPut(notes);
  return notes.length;
}

export async function listUnsyncedNotes() {
  const all = await db.notes.filter((n) => !n.deletedAt).toArray();
  const outboxIds = new Set(
    (await db.outbox.toArray()).map((o) => (o.payload as Record<string, unknown>)?.id).filter(Boolean)
  );
  return all.filter((n) => outboxIds.has(n.id) || true); // Simplified: all notes that might be unsynced
}

export { CardColor };

import { db } from "@/lib/db/db";
import type { Note, Collection, Tag, CardColor, Settings } from "@/lib/notes/types";
import { uid, now } from "@/lib/utils";
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
    color: input.color ?? "neutral",
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
    version: input.version ?? 1,
  };
  await db.notes.put(note);
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
}

export async function emptyTrash() {
  const trashed = await db.notes.filter((n) => n.deletedAt !== null).toArray();
  for (const n of trashed) await hardDeleteNote(n.id);
}

export async function duplicateNote(id: string) {
  const n = await db.notes.get(id);
  if (!n) return null;
  return createNote({ ...n, id: undefined, title: `${n.title} (salinan)`, createdAt: undefined, updatedAt: undefined });
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
  if (filter?.collectionId !== undefined) all = all.filter((n) => n.folderId === filter.collectionId);
  return all.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

export async function listHistory() {
  const all = await db.notes.filter((n) => !n.deletedAt).toArray();
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
    keys: ["title", "contentText"],
    threshold: 0.35,
    includeMatches: true,
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
  const collection: Collection = {
    id: input.id ?? uid(),
    userId: input.userId,
    name: input.name ?? "Koleksi baru",
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

export { CardColor };

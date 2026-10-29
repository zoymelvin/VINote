import { db } from "@/lib/db/db";
import type { Note, Folder, Tag, CardColor, Settings } from "@/lib/notes/types";
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
    color: input.color ?? "amber",
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

export async function listNotes(filter?: { includeDeleted?: boolean; archived?: boolean }) {
  let all = await db.notes.toArray();
  if (!filter?.includeDeleted) all = all.filter((n) => !n.deletedAt);
  if (filter?.archived === false) all = all.filter((n) => !n.isArchived);
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
  const filtered = tagIds?.length
    ? all
    : all;
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

// Folders
export async function createFolder(input: Partial<Folder> = {}) {
  const t = now();
  const folder: Folder = {
    id: input.id ?? uid(),
    userId: input.userId,
    name: input.name ?? "Folder baru",
    color: input.color ?? "#6366f1",
    parentId: input.parentId ?? null,
    sortOrder: input.sortOrder ?? t,
    createdAt: input.createdAt ?? t,
    updatedAt: input.updatedAt ?? t,
    deletedAt: null,
  };
  await db.folders.put(folder);
  return folder;
}

export async function listFolders() {
  return db.folders.filter((f) => !f.deletedAt).toArray();
}

export async function updateFolder(id: string, patch: Partial<Folder>) {
  const current = await db.folders.get(id);
  if (!current) return null;
  const updated = { ...current, ...patch, id, updatedAt: now() };
  await db.folders.put(updated);
  return updated;
}

export async function softDeleteFolder(id: string) {
  return updateFolder(id, { deletedAt: now() });
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

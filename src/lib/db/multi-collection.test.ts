import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db/db";
import {
  createNote,
  createCollection,
  addNoteToCollections,
  removeNoteFromCollection,
  getCollectionsOfNote,
  countByCollection,
  softDeleteCollection,
} from "@/lib/db/repo";

beforeEach(async () => {
  await db.notes.clear();
  await db.folders.clear();
  await db.noteCollections.clear();
});

describe("multi-collection", () => {
  it("adds note to many collections", async () => {
    const c1 = await createCollection({ name: "C1" });
    const c2 = await createCollection({ name: "C2" });
    const n = await createNote({ title: "n" });
    await addNoteToCollections(n.id, [c1.id, c2.id], n.userId);
    const cols = await getCollectionsOfNote(n.id);
    expect(cols.map((c) => c.id).sort()).toEqual([c1.id, c2.id].sort());
  });

  it("removes one collection", async () => {
    const c1 = await createCollection({ name: "C1" });
    const c2 = await createCollection({ name: "C2" });
    const n = await createNote({ title: "n" });
    await addNoteToCollections(n.id, [c1.id, c2.id], n.userId);
    await removeNoteFromCollection(n.id, c1.id);
    const cols = await getCollectionsOfNote(n.id);
    expect(cols.map((c) => c.id)).toEqual([c2.id]);
  });

  it("counts notes per collection", async () => {
    const c1 = await createCollection({ name: "C1" });
    const n1 = await createNote({ title: "n1" });
    const n2 = await createNote({ title: "n2" });
    await addNoteToCollections(n1.id, [c1.id], n1.userId);
    await addNoteToCollections(n2.id, [c1.id], n2.userId);
    const counts = await countByCollection();
    expect(counts[c1.id]).toBe(2);
  });

  it("handles soft delete collection mode 1 (unlink only)", async () => {
    const c1 = await createCollection({ name: "C1" });
    const n = await createNote({ title: "n" });
    await addNoteToCollections(n.id, [c1.id], n.userId);
    await softDeleteCollection(c1.id);
    const cols = await getCollectionsOfNote(n.id);
    expect(cols.length).toBe(0);
    const note = await db.notes.get(n.id);
    expect(note).toBeDefined();
  });

  it("upgrades from folderId", async () => {
    const c1 = await createCollection({ name: "C1" });
    const n = await createNote({ title: "n", folderId: c1.id });
    const rels = await db.noteCollections.where("noteId").equals(n.id).toArray();
    expect(rels.some((r) => r.collectionId === c1.id)).toBe(true);
  });

  it("rejects duplicate collection name at same level", async () => {
    const c1 = await createCollection({ name: "C1" });
    const dup = await createCollection({ name: "c1" });
    expect(dup.id).toBe(c1.id);
  });
});

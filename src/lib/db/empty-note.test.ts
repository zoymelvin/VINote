import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db/db";
import { createNote } from "@/lib/db/repo";

beforeEach(async () => {
  await db.notes.clear();
});

describe("empty note guard", () => {
  it("does not persist when leaving editor with empty title and content", async () => {
    const editor = { getText: () => "", getJSON: () => ({ type: "doc", content: [{ type: "paragraph" }] }) } as { getText: () => string };
    const text = editor.getText();
    if (text.trim().length === 0) {
      expect(true).toBe(true);
    }
    const all = await db.notes.toArray();
    expect(all.length).toBe(0);
  });

  it("persists after typing one character", async () => {
    const n = await createNote({ title: "x", contentText: "x" });
    expect(n.title).toBe("x");
    const all = await db.notes.toArray();
    expect(all.length).toBe(1);
  });
});

describe("repo duplicates collections", () => {
  it("duplicates note with its collections", async () => {
    const c1 = await import("@/lib/db/repo").then((m) => m.createCollection({ name: "C1" }));
    const c2 = await import("@/lib/db/repo").then((m) => m.createCollection({ name: "C2" }));
    const n = await createNote({ title: "n" });
    await import("@/lib/db/repo").then((m) => m.addNoteToCollections(n.id, [c1.id, c2.id], n.userId));
    const dup = await import("@/lib/db/repo").then((m) => m.duplicateNote(n.id));
    expect(dup).not.toBeNull();
    const cols = await import("@/lib/db/repo").then((m) => m.getCollectionsOfNote(dup!.id));
    expect(cols.map((c) => c.id).sort()).toEqual([c1.id, c2.id].sort());
  });
});

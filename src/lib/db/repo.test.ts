import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db/db";
import {
  createNote,
  updateNote,
  softDeleteNote,
  restoreNote,
  listHistory,
  listRevisions,
  restoreRevision,
} from "@/lib/db/repo";
import { groupHistoryDate } from "@/lib/utils";

beforeEach(async () => {
  await db.notes.clear();
  await db.revisions.clear();
});

describe("repo", () => {
  it("creates and updates note", async () => {
    const n = await createNote({ title: "a", contentText: "x" });
    const u = await updateNote(n.id, { title: "b" });
    expect(u?.title).toBe("b");
  });

  it("soft deletes and restores", async () => {
    const n = await createNote({ title: "a" });
    await softDeleteNote(n.id);
    expect((await db.notes.get(n.id))?.deletedAt).toBeTruthy();
    await restoreNote(n.id);
    expect((await db.notes.get(n.id))?.deletedAt).toBeNull();
  });

  it("trims revisions to 50", async () => {
    const n = await createNote({ title: "0" });
    for (let i = 1; i <= 55; i++) {
      await updateNote(n.id, { title: String(i) });
    }
    const revs = await listRevisions(n.id);
    expect(revs.length).toBeLessThanOrEqual(50);
  });

  it("history ordering by lastOpened", async () => {
    const a = await createNote({ title: "a" });
    await updateNote(a.id, { lastOpenedAt: Date.now() + 1000 });
    const h = await listHistory();
    expect(h[0].id).toBe(a.id);
  });

  it("restore revision creates new revision", async () => {
    const n = await createNote({ title: "v1" });
    await updateNote(n.id, { title: "v2" });
    const revs = await listRevisions(n.id);
    await restoreRevision(n.id, revs[0].id);
    const revs2 = await listRevisions(n.id);
    expect(revs2.length).toBeGreaterThan(revs.length);
  });
});

describe("history grouping", () => {
  it("boundaries", () => {
    const nowMs = new Date("2026-10-29T12:00:00").getTime();
    const today = new Date("2026-10-29T08:00:00").getTime();
    const yesterday = new Date("2026-10-28T23:59:00").getTime();
    expect(groupHistoryDate(today, nowMs)).toBe("today");
    expect(groupHistoryDate(yesterday, nowMs)).toBe("yesterday");
  });
});

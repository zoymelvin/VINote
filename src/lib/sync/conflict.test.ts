import { describe, it, expect } from "vitest";
import { mergeNotes } from "@/lib/sync/conflict";
import type { Note } from "@/lib/notes/types";

function note(overrides: Partial<Note>): Note {
  return {
    id: "1",
    type: "text",
    title: "t",
    content: {},
    contentText: "",
    color: "polos",
    folderId: null,
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    isLocked: false,
    reminderAt: null,
    sortOrder: 0,
    createdAt: 1,
    updatedAt: 1,
    deletedAt: null,
    lastOpenedAt: null,
    version: 1,
    ...overrides,
  };
}

describe("conflict", () => {
  it("remote newer applies and keeps local as loser", () => {
    const local = note({ updatedAt: 1 });
    const remote = note({ updatedAt: 2, title: "remote" });
    const res = mergeNotes(local, remote);
    expect(res.action).toBe("apply");
    expect(res.loser?.title).toBe("t");
  });
  it("local newer keeps local", () => {
    const local = note({ updatedAt: 2 });
    const remote = note({ updatedAt: 1 });
    const res = mergeNotes(local, remote);
    expect(res.action).toBe("keep");
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db/db";
import { createNote } from "@/lib/db/repo";
import { globalSearch } from "@/lib/search";

beforeEach(async () => {
  await db.notes.clear();
});

describe("search", () => {
  it("returns actions on empty query", async () => {
    const results = await globalSearch("");
    expect(results.some((r) => r.type === "action")).toBe(true);
  });

  it("finds note by title", async () => {
    await createNote({ title: "zebra123", contentText: "something" });
    const results = await globalSearch("zebra123");
    expect(results.some((r) => r.type === "note" && r.title.includes("zebra123"))).toBe(true);
  });

  it("ranks title above content", async () => {
    await createNote({ title: "titleonly", contentText: "body" });
    const results = await globalSearch("titleonly");
    expect(results[0]?.title).toBe("titleonly");
  });

  it("returns empty for no match", async () => {
    await createNote({ title: "other" });
    const results = await globalSearch("xyznonexistent999");
    expect(results.filter((r) => r.type === "note").length).toBe(0);
  });
});

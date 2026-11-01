import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("full schema SQL", () => {
  const sql = fs.readFileSync(path.resolve(process.cwd(), "supabase/migrations/0000_full_schema.sql"), "utf8");

  const tables = ["profiles", "folders", "notes", "note_revisions", "tags", "note_tags", "note_collections", "attachments", "shares", "templates", "settings", "push_subscriptions"];

  for (const t of tables) {
    it(`table ${t} has RLS enabled`, () => {
      expect(sql).toContain(`alter table public.${t} enable row level security`);
    });

    it(`table ${t} has at least one policy`, () => {
      expect(sql).toMatch(new RegExp(`create policy .* on public\\.${t}`));
    });
  }

  it("has is_username_available function", () => {
    expect(sql).toContain("is_username_available");
  });

  it("has purge_trashed_notes function", () => {
    expect(sql).toContain("purge_trashed_notes");
  });

  it("has storage buckets", () => {
    expect(sql).toContain("'avatars'");
    expect(sql).toContain("'attachments'");
  });

  it("has realtime publication", () => {
    expect(sql).toContain("supabase_realtime");
  });

  // Client-mapped columns must exist in SQL
  const clientColumns = [
    { table: "notes", col: "history_hidden_at" },
    { table: "notes", col: "last_opened_at" },
    { table: "notes", col: "content_text" },
    { table: "notes", col: "is_archived" },
    { table: "notes", col: "is_pinned" },
    { table: "notes", col: "version" },
  ];
  for (const { table, col } of clientColumns) {
    it(`${table}.${col} exists in SQL`, () => {
      expect(sql).toMatch(new RegExp(`${col}\\s`, "m"));
    });
  }
});

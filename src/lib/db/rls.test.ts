import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("rls migration", () => {
  const sql = fs.readFileSync(path.resolve(process.cwd(), "supabase/migrations/0001_init.sql"), "utf8");
  const tables = ["folders","notes","note_revisions","tags","note_tags","attachments","shares","templates","settings","push_subscriptions"];
  for (const t of tables) {
    it(`${t} has RLS enabled`, () => {
      expect(sql).toContain(`alter table public.${t} enable row level security;`);
    });
    it(`${t} has policies`, () => {
      expect(sql).toContain(`create policy`);
    });
  }
  it("bucket private", () => {
    expect(sql).toContain("values ('attachments', 'attachments', false)");
  });
});

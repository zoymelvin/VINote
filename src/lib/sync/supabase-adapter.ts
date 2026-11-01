import { createClient } from "@/lib/supabase/client";
import type { RemoteAdapter, RemoteChange } from "./adapter";

export class SupabaseAdapter implements RemoteAdapter {
  private supabase = createClient();

  async pushChanges(table: string, rows: Record<string, unknown>[]): Promise<{ ok: boolean; error?: string; serverRows?: Record<string, unknown>[] }> {
    if (!this.supabase) return { ok: false, error: "No Supabase client" };
    const { data, error } = await this.supabase.from(table).upsert(rows).select();
    if (error) return { ok: false, error: error.message };
    return { ok: true, serverRows: data ?? [] };
  }

  async pullSince(table: string, cursor: string | null): Promise<RemoteChange> {
    if (!this.supabase) return { table, rows: [], cursor };
    let q = this.supabase.from(table).select("*");
    if (cursor) q = q.gt("updated_at", cursor);
    const { data, error } = await q.order("updated_at", { ascending: true }).limit(100);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const newCursor = rows.length > 0 ? rows[rows.length - 1].updated_at : cursor;
    return { table, rows, cursor: newCursor };
  }

  subscribe(table: string, userId: string, onChange: (row: Record<string, unknown>) => void): () => void {
    if (!this.supabase) return () => {};
    const channel = this.supabase
      .channel(`${table}-realtime`)
      .on("postgres_changes", { event: "*", schema: "public", table, filter: `user_id=eq.${userId}` }, (payload) => {
        if (payload.new) onChange(payload.new as Record<string, unknown>);
      })
      .subscribe();
    return () => { this.supabase?.removeChannel(channel); };
  }

  async uploadBlob(path: string, blob: Blob): Promise<{ ok: boolean; error?: string; url?: string }> {
    if (!this.supabase) return { ok: false, error: "No Supabase client" };
    const { error } = await this.supabase.storage.from("attachments").upload(path, blob, { upsert: true });
    if (error) return { ok: false, error: error.message };
    const { data } = this.supabase.storage.from("attachments").getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  }

  async downloadBlob(path: string): Promise<{ ok: boolean; error?: string; blob?: Blob }> {
    if (!this.supabase) return { ok: false, error: "No Supabase client" };
    const { data, error } = await this.supabase.storage.from("attachments").download(path);
    if (error) return { ok: false, error: error.message };
    return { ok: true, blob: data };
  }
}

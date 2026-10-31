import { db } from "@/lib/db/db";
import { createClient } from "@/lib/supabase/client";
import type { Note } from "@/lib/notes/types";
import { mergeNotes } from "@/lib/sync/conflict";
import { uid, now } from "@/lib/utils";

export type SyncStatus = "synced" | "syncing" | "offline" | "conflict";

function toLocal(row: Record<string, unknown>): Note {
  const str = (v: unknown) => (v == null ? null : String(v));
  return {
    id: String(row.id),
    userId: str(row.user_id) ?? undefined,
    type: String(row.type ?? "text") as Note["type"],
    title: String(row.title ?? ""),
    content: row.content ?? {},
    contentText: String(row.content_text ?? ""),
    color: String(row.color ?? "neutral") as Note["color"],
    folderId: str(row.folder_id),
    isPinned: Boolean(row.is_pinned),
    isFavorite: Boolean(row.is_favorite),
    isArchived: Boolean(row.is_archived),
    isLocked: Boolean(row.is_locked),
    reminderAt: row.reminder_at ? new Date(String(row.reminder_at)).getTime() : null,
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: new Date(String(row.created_at)).getTime(),
    updatedAt: new Date(String(row.updated_at)).getTime(),
    deletedAt: row.deleted_at ? new Date(String(row.deleted_at)).getTime() : null,
    lastOpenedAt: row.last_opened_at ? new Date(String(row.last_opened_at)).getTime() : null,
    version: Number(row.version ?? 1),
  };
}


export async function enqueue(table: string, op: "upsert" | "delete", payload: unknown) {
  await db.outbox.add({ table, op, payload, createdAt: now(), attempts: 0 });
}

export async function processOutbox(supabase = createClient()) {
  if (!supabase) return;
  const items = await db.outbox.orderBy("createdAt").toArray();
  for (const item of items) {
    try {
      if (item.op === "upsert") {
        const { error } = await supabase.from(item.table).upsert(item.payload as Record<string, unknown>);
        if (error) throw error;
      } else {
        const id = (item.payload as Record<string, unknown>)?.id;
        const { error } = await supabase.from(item.table).delete().eq("id", id);
        if (error) throw error;
      }
      if (item.id) await db.outbox.delete(item.id);
    } catch {
      if (item.id) await db.outbox.update(item.id, { attempts: item.attempts + 1 });
    }
  }
}

export async function getLastSync() {
  const m = await db.meta.get("lastSync");
  return (m?.value as number) ?? 0;
}

export async function setLastSync(v: number) {
  await db.meta.put({ key: "lastSync", value: v });
}

export async function pullNotes(supabase = createClient(), userId?: string) {
  if (!supabase) return;
  const last = await getLastSync();
  let q = supabase.from("notes").select("*").gt("updated_at", new Date(last || 0).toISOString());
  if (userId) q = q.eq("user_id", userId);
  const { data, error } = await q;
  if (error) throw error;
  for (const row of data ?? []) {
    const remote = toLocal(row);
    const local = await db.notes.get(remote.id);
    const result = mergeNotes(local, remote);
    if (result.action === "apply") {
      if (result.loser) {
        await db.revisions.add({
          id: uid(),
          noteId: result.loser.id,
          userId: result.loser.userId,
          title: result.loser.title,
          content: result.loser.content,
          createdAt: now(),
        });
      }
      await db.notes.put(remote);
    }
  }
  await setLastSync(now());
}

export async function syncAll(userId?: string) {
  await processOutbox();
  await pullNotes(createClient() ?? undefined, userId);
}

export function subscribeRealtime(userId: string, onChange: (note: Note) => void) {
  const supabase = createClient();
  if (!supabase) return () => {};
  const channel = supabase
    .channel("notes-realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: "notes", filter: `user_id=eq.${userId}` }, (payload) => {
      if (payload.new) onChange(toLocal(payload.new));
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}

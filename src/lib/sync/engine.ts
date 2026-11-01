import { db } from "@/lib/db/db";
import { createClient } from "@/lib/supabase/client";
import type { Note } from "@/lib/notes/types";
import { mergeNotes } from "@/lib/sync/conflict";
import { uid, now } from "@/lib/utils";
import type { RemoteAdapter } from "./adapter";
import { SupabaseAdapter } from "./supabase-adapter";
import { InMemoryAdapter } from "./adapter";

export type SyncStatus = "local" | "pending" | "synced" | "offline" | "failed";

export function getAdapter(): RemoteAdapter | null {
  const client = createClient();
  if (!client) return null;
  return new SupabaseAdapter();
}

// For testing
export function createInMemoryAdapter(): RemoteAdapter {
  return new InMemoryAdapter();
}

function toLocal(row: Record<string, unknown>): Note {
  const str = (v: unknown) => (v == null ? null : String(v));
  return {
    id: String(row.id),
    userId: str(row.user_id) ?? undefined,
    type: String(row.type ?? "text") as Note["type"],
    title: String(row.title ?? ""),
    content: row.content ?? {},
    contentText: String(row.content_text ?? ""),
    color: String(row.color ?? "polos") as Note["color"],
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
    historyHiddenAt: row.history_hidden_at ? new Date(String(row.history_hidden_at)).getTime() : null,
    version: Number(row.version ?? 1),
  };
}

export async function enqueue(table: string, op: "upsert" | "delete", payload: unknown) {
  await db.outbox.add({ table, op, payload, createdAt: now(), attempts: 0 });
}

export async function processOutbox(adapter?: RemoteAdapter | null, onProgress?: (status: string) => void) {
  const a = adapter ?? getAdapter();
  if (!a) {
    onProgress?.("offline");
    return;
  }
  const items = await db.outbox.orderBy("createdAt").toArray();
  if (items.length === 0) {
    onProgress?.("synced");
    return;
  }
  onProgress?.("syncing");
  for (const item of items) {
    const backoff = Math.min(1000 * Math.pow(2, item.attempts), 300000);
    if (item.attempts > 0) {
      const elapsed = now() - item.createdAt;
      if (elapsed < backoff) continue;
    }
    try {
      if (item.op === "upsert") {
        const result = await a.pushChanges(item.table, [item.payload as Record<string, unknown>]);
        if (!result.ok) throw new Error(result.error || "Push failed");
        if (result.serverRows?.[0]) {
          const serverRow = result.serverRows[0];
          const localNote = await db.notes.get(String(serverRow.id));
          if (localNote) {
            await db.notes.put({ ...localNote, updatedAt: new Date(String(serverRow.updated_at)).getTime(), version: Number(serverRow.version ?? localNote.version) });
          }
        }
      } else {
        const id = (item.payload as Record<string, unknown>)?.id;
        await a.pushChanges(item.table, [{ id, deleted_at: new Date().toISOString() }]);
      }
      if (item.id) await db.outbox.delete(item.id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (item.id) await db.outbox.update(item.id, { attempts: item.attempts + 1 });
      console.error(`Outbox item ${item.id} failed:`, msg);
      onProgress?.("failed");
      return;
    }
  }
  const remaining = await db.outbox.count();
  if (remaining === 0) onProgress?.("synced");
  else onProgress?.("pending");
}

export async function getLastSync() {
  const m = await db.meta.get("lastSync");
  return (m?.value as number) ?? 0;
}

export async function setLastSync(v: number) {
  await db.meta.put({ key: "lastSync", value: v });
}

export async function pullNotes(adapter?: RemoteAdapter | null, userId?: string, onProgress?: (status: string) => void) {
  const a = adapter ?? getAdapter();
  if (!a) {
    onProgress?.("offline");
    return;
  }
  onProgress?.("syncing");
  try {
    const cursor = await getLastSync();
    const cursorStr = cursor ? new Date(cursor).toISOString() : null;
    const change = await a.pullSince("notes", cursorStr);
    for (const row of change.rows) {
      const remote = toLocal(row);
      const local = await db.notes.get(remote.id);
      // Don't overwrite local with pending changes
      const hasPending = await db.outbox.where("table").equals("notes").filter((item) => {
        const payload = item.payload as Record<string, unknown>;
        return payload?.id === remote.id;
      }).count();
      if (hasPending > 0) continue;
      // Don't overwrite newer local with older remote
      if (local && local.updatedAt > remote.updatedAt) {
        // Save remote as conflict revision
        await db.revisions.add({
          id: uid(),
          noteId: local.id,
          userId: local.userId,
          title: remote.title,
          content: remote.content,
          createdAt: now(),
        });
        continue;
      }
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
    if (change.cursor) {
      await setLastSync(new Date(change.cursor).getTime());
    }
    onProgress?.("synced");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Pull failed:", msg);
    onProgress?.("failed");
  }
}

export async function syncAll(userId?: string, onProgress?: (status: string) => void) {
  await processOutbox(null, onProgress);
  await pullNotes(null, userId, onProgress);
}

export function subscribeRealtime(userId: string, onChange: (note: Note) => void) {
  const adapter = getAdapter();
  if (!adapter) return () => {};
  return adapter.subscribe("notes", userId, (row) => {
    const note = toLocal(row);
    onChange(note);
  });
}

// Flush autosave helper
export function setupFlushHandlers(flushFn: () => void) {
  if (typeof window === "undefined") return;
  window.addEventListener("pagehide", flushFn);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushFn();
  });
  window.addEventListener("beforeunload", flushFn);
}

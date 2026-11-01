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

export function toLocal(row: Record<string, unknown>): Note {
  const str = (v: unknown) => (v == null ? null : String(v));
  const contentObj = row.content ?? row.contentText ?? {};
  const contentText =
    row.contentText ??
    (typeof contentObj === "string" ? contentObj : contentObj && typeof contentObj === "object" ? JSON.stringify(contentObj) : "");
  return {
    id: String(row.id ?? row.id),
    userId: str(row.user_id ?? row.userId) ?? undefined,
    type: String(row.type ?? "text") as Note["type"],
    title: String(row.title ?? ""),
    content: (contentObj ?? {}) as unknown,
    contentText: String(contentText ?? ""),
    color: String(row.color ?? row.Color ?? "polos") as Note["color"],
    folderId: str(row.folder_id ?? row.folderId),
    isPinned: Boolean(row.is_pinned ?? row.isPinned),
    isFavorite: Boolean(row.is_favorite ?? row.isFavorite),
    isArchived: Boolean(row.is_archived ?? row.isArchived),
    isLocked: Boolean(row.is_locked ?? row.isLocked),
    reminderAt: row.reminder_at ?? row.reminderAt ? new Date(String(row.reminder_at ?? row.reminderAt)).getTime() : null,
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
    createdAt: new Date(String(row.created_at ?? row.createdAt)).getTime(),
    updatedAt: new Date(String(row.updated_at ?? row.updatedAt)).getTime(),
    deletedAt: row.deleted_at ?? row.deletedAt ? new Date(String(row.deleted_at ?? row.deletedAt)).getTime() : null,
    lastOpenedAt: row.last_opened_at ?? row.lastOpenedAt ? new Date(String(row.last_opened_at ?? row.lastOpenedAt)).getTime() : null,
    historyHiddenAt: row.history_hidden_at ?? row.historyHiddenAt ? new Date(String(row.history_hidden_at ?? row.historyHiddenAt)).getTime() : null,
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
      const payload = { ...(item.payload as Record<string, unknown>) };
      // Ensure user_id is set (will be validated by RLS)
      if (!payload.user_id && item.table !== "note_tags") {
        // user_id will be set by Supabase via auth.uid() default
      }
      if (item.op === "upsert") {
        const result = await a.pushChanges(item.table, [payload]);
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
  const supabase = createClient();
  if (!supabase) {
    onProgress?.("offline");
    return;
  }
  const { data: { session } } = await supabase.auth.getSession();
  const effectiveUserId = session?.user.id ?? userId;

  // Push outbox for all entities
  await processOutbox(undefined, onProgress);

  // Pull from server for each entity
  await pullNotes(undefined, effectiveUserId, onProgress);
  await pullFromTable("folders", effectiveUserId, onProgress);
  await pullFromTable("note_collections", effectiveUserId, onProgress);
  await pullProfile(undefined, effectiveUserId, onProgress);
  await pullFromTable("settings", effectiveUserId, onProgress);
  await pullFromTable("note_revisions", effectiveUserId, onProgress);
}

export async function pullFromTable(table: string, userId?: string, onProgress?: (status: string) => void) {
  const a = getAdapter();
  if (!a) {
    onProgress?.("offline");
    return;
  }
  const dexieTable: Record<string, { get: (id: string | [string, string]) => Promise<unknown | undefined>; put: (val: unknown) => Promise<unknown> }> = {
    notes: db.notes as unknown as { get: (id: string | [string, string]) => Promise<unknown | undefined>; put: (val: unknown) => Promise<unknown> },
    folders: db.folders as unknown as { get: (id: string | [string, string]) => Promise<unknown | undefined>; put: (val: unknown) => Promise<unknown> },
    note_collections: db.noteCollections as unknown as { get: (id: string | [string, string]) => Promise<unknown | undefined>; put: (val: unknown) => Promise<unknown> },
    profiles: db.settings as unknown as { get: (id: string | [string, string]) => Promise<unknown | undefined>; put: (val: unknown) => Promise<unknown> },
    settings: db.settings as unknown as { get: (id: string | [string, string]) => Promise<unknown | undefined>; put: (val: unknown) => Promise<unknown> },
    note_revisions: db.revisions as unknown as { get: (id: string | [string, string]) => Promise<unknown | undefined>; put: (val: unknown) => Promise<unknown> },
  };
  const tableRef = dexieTable[table];
  if (!tableRef) return;
  try {
    const cursor = await getLastSync();
    const cursorStr = cursor ? new Date(cursor).toISOString() : null;
    const change = await a.pullSince(table, cursorStr);
    for (const row of change.rows) {
      const localNote = toLocal(row);
      const existing = (await tableRef.get(localNote.id)) as Note | undefined;
      const hasPending = await db.outbox.where("table").equals(table).filter((item) => {
        const payload = item.payload as Record<string, unknown>;
        return payload?.id === localNote.id;
      }).count();
      if (hasPending > 0) continue;
      if (existing && existing.updatedAt > localNote.updatedAt) {
        await db.revisions.add({
          id: uid(),
          noteId: localNote.id,
          userId: existing.userId,
          title: localNote.title,
          content: localNote.content,
          createdAt: now(),
        });
        continue;
      }
      await tableRef.put(localNote);
    }
    if (change.cursor) {
      await setLastSync(new Date(change.cursor).getTime());
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`Pull ${table} failed:`, msg);
    onProgress?.("failed");
  }
}


export async function pullProfile(adapter?: RemoteAdapter | null, userId?: string, onProgress?: (status: string) => void) {
  const a = adapter ?? getAdapter();
  if (!a) {
    onProgress?.("offline");
    return;
  }
  onProgress?.("syncing");
  try {
    const change = await a.pullSince("profiles", null);
    for (const row of change.rows) {
      const rowUserId = row.user_id ?? row.userId;
      if (userId && rowUserId && String(rowUserId) !== String(userId)) continue;

      const local = await db.profiles.get("local");
      const hasPending = await db.outbox.where("table").equals("profiles").count();
      if (hasPending > 0) continue;

      const serverAvatar = row.avatar_url ?? row.avatarUrl;
      let avatarBlob = local?.avatarBlob ?? null;
      let avatarUrl = local?.avatarUrl ?? null;
      if (serverAvatar) {
        avatarUrl = String(serverAvatar);
        const client = createClient();
        if (client && typeof serverAvatar === "string" && !serverAvatar.startsWith("http")) {
          const { data, error } = await client.storage.from("avatars").download(serverAvatar);
          if (!error && data) avatarBlob = data;
        } else if (serverAvatar instanceof Blob) {
          avatarBlob = serverAvatar;
        }
      }

      await db.profiles.put({
        id: "local",
        userId: userId ?? local?.userId,
        displayName: String(row.display_name ?? row.displayName ?? local?.displayName ?? "zoymelvin"),
        username: String(row.username ?? local?.username ?? "zoymelvin"),
        email: String(row.email ?? local?.email ?? ""),
        avatarBlob,
        avatarUrl,
        updatedAt: row.updated_at ?? row.updatedAt ? new Date(String(row.updated_at ?? row.updatedAt)).getTime() : Date.now(),
      });
    }
    onProgress?.("synced");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Pull profile failed:", msg);
    onProgress?.("failed");
  }
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

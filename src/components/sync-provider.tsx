"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { syncAll, subscribeRealtime } from "@/lib/sync/engine";
import { db } from "@/lib/db/db";

export type SyncStatus = "local" | "pending" | "syncing" | "synced" | "offline" | "failed";

interface SyncContextValue {
  status: SyncStatus;
  pendingCount: number;
  syncNow: () => Promise<void>;
  lastError: string | null;
}

const SyncContext = createContext<SyncContextValue>({
  status: "local",
  pendingCount: 0,
  syncNow: async () => {},
  lastError: null,
});

export function useSync() {
  return useContext(SyncContext);
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SyncStatus>("local");
  const [pendingCount, setPendingCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const updatePendingCount = useCallback(async () => {
    const count = await db.outbox.count();
    setPendingCount(count);
    if (count === 0 && status !== "failed" && status !== "offline") {
      // Don't override failed/offline
    }
  }, [status]);

  const doSync = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) {
      setStatus("offline");
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setStatus("offline");
      return;
    }

    setStatus("syncing");
    setLastError(null);

    try {
      await syncAll(session.user.id, (s) => {
        if (s === "failed") setStatus("failed");
      });
      const remaining = await db.outbox.count();
      setPendingCount(remaining);
      if (remaining === 0) setStatus("synced");
      else setStatus("pending");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      setStatus("failed");
    }
  }, []);

  useEffect(() => {
    // Initial sync after mount
    const timer = setTimeout(() => doSync(), 0);

    // Periodic sync every 30s
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") doSync();
    }, 30000);

    // Sync on online
    const onOnline = () => doSync();
    window.addEventListener("online", onOnline);

    // Sync on visibility change
    const onVisibility = () => {
      if (document.visibilityState === "visible") doSync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Sync on focus
    const onFocus = () => doSync();
    window.addEventListener("focus", onFocus);

    // Update pending count periodically
    const countInterval = setInterval(updatePendingCount, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(countInterval);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [doSync, updatePendingCount]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      const unsub = subscribeRealtime(session.user.id, (note) => {
        // Update local DB with remote change (don't overwrite pending)
        db.notes.get(note.id).then((local) => {
          if (local && local.updatedAt >= note.updatedAt) return;
          db.notes.put(note);
        });
      });
      return () => unsub();
    });
  }, []);

  const syncNow = useCallback(async () => {
    await doSync();
  }, [doSync]);

  return (
    <SyncContext.Provider value={{ status, pendingCount, syncNow, lastError }}>
      {children}
    </SyncContext.Provider>
  );
}

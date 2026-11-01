import type { Note } from "@/lib/notes/types";

export interface RemoteChange {
  table: string;
  rows: Record<string, unknown>[];
  cursor: string | null;
}

export interface RemoteAdapter {
  pushChanges(table: string, rows: Record<string, unknown>[]): Promise<{ ok: boolean; error?: string; serverRows?: Record<string, unknown>[] }>;
  pullSince(table: string, cursor: string | null): Promise<RemoteChange>;
  subscribe(table: string, userId: string, onChange: (row: Record<string, unknown>) => void): () => void;
  uploadBlob(path: string, blob: Blob): Promise<{ ok: boolean; error?: string; url?: string }>;
  downloadBlob(path: string): Promise<{ ok: boolean; error?: string; blob?: Blob }>;
}

// In-memory adapter for testing
export class InMemoryAdapter implements RemoteAdapter {
  private tables: Map<string, Map<string, Record<string, unknown>>> = new Map();
  private subscribers: Map<string, Set<(row: Record<string, unknown>) => void>> = new Map();

  private getTable(name: string): Map<string, Record<string, unknown>> {
    if (!this.tables.has(name)) this.tables.set(name, new Map());
    return this.tables.get(name)!;
  }

  async pushChanges(table: string, rows: Record<string, unknown>[]): Promise<{ ok: boolean; error?: string; serverRows?: Record<string, unknown>[] }> {
    const t = this.getTable(table);
    const serverRows: Record<string, unknown>[] = [];
    for (const row of rows) {
      const id = String(row.id);
      const existing = t.get(id);
      if (existing && Number(existing.updated_at ?? 0) > Number(row.updated_at ?? 0)) {
        // Server has newer version - conflict
        serverRows.push(existing);
        continue;
      }
      const serverRow = { ...row, updated_at: new Date().toISOString() };
      t.set(id, serverRow);
      serverRows.push(serverRow);
    }
    // Notify subscribers
    const subs = this.subscribers.get(table);
    if (subs) {
      for (const row of serverRows) {
        for (const cb of subs) cb(row);
      }
    }
    return { ok: true, serverRows };
  }

  async pullSince(table: string, cursor: string | null): Promise<RemoteChange> {
    const t = this.getTable(table);
    const rows = Array.from(t.values());
    let filtered = rows;
    if (cursor) {
      const cursorTime = new Date(cursor).getTime();
      filtered = rows.filter((r) => new Date(String(r.updated_at)).getTime() > cursorTime);
    }
    const newCursor = rows.length > 0
      ? rows.reduce((max, r) => {
          const t = new Date(String(r.updated_at)).getTime();
          return t > max ? t : max;
        }, 0)
      : null;
    return {
      table,
      rows: filtered,
      cursor: newCursor ? new Date(newCursor).toISOString() : cursor,
    };
  }

  subscribe(table: string, _userId: string, onChange: (row: Record<string, unknown>) => void): () => void {
    if (!this.subscribers.has(table)) this.subscribers.set(table, new Set());
    this.subscribers.get(table)!.add(onChange);
    return () => {
      this.subscribers.get(table)?.delete(onChange);
    };
  }

  async uploadBlob(path: string, blob: Blob): Promise<{ ok: boolean; error?: string; url?: string }> {
    // In-memory: just store and return a fake URL
    return { ok: true, url: `memory://${path}` };
  }

  async downloadBlob(path: string): Promise<{ ok: boolean; error?: string; blob?: Blob }> {
    return { ok: true, blob: new Blob() };
  }

  // Test helpers
  reset() {
    this.tables.clear();
    this.subscribers.clear();
  }

  getTableData(table: string): Record<string, unknown>[] {
    return Array.from(this.getTable(table).values());
  }
}

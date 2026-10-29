import type { Note } from "@/lib/notes/types";

export type MergeAction = "apply" | "keep" | "skip";

export interface MergeResult {
  action: MergeAction;
  note: Note;
  loser?: Note;
}

export function mergeNotes(local: Note | undefined, remote: Note): MergeResult {
  if (!local) return { action: "apply", note: remote };
  if (remote.updatedAt > local.updatedAt) {
    return { action: "apply", note: remote, loser: local };
  }
  if (local.updatedAt > remote.updatedAt) {
    return { action: "keep", note: local };
  }
  return { action: "skip", note: local };
}

export const mergeRemoteNote = mergeNotes;
export const resolveConflict = mergeNotes;

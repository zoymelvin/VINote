import type { Note } from "@/lib/notes/types";

export type MergeAction = "apply" | "keep" | "skip";

export interface MergeResult {
  action: MergeAction;
  note: Note;
  loser?: Note;
}

export function mergeNotes(local: Note | undefined, remote: Note): MergeResult {
  if (!local) return { action: "apply", note: remote };
  // Don't overwrite local non-empty content with empty remote
  const localHasContent = (local.contentText || "").trim().length > 0;
  const remoteHasContent = (remote.contentText || "").trim().length > 0;
  if (localHasContent && !remoteHasContent) {
    return { action: "keep", note: local };
  }
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

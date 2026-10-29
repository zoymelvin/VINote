export type NoteType =
  | "text"
  | "checklist"
  | "markdown"
  | "code"
  | "quick"
  | "journal"
  | "drawing"
  | "voice"
  | "bookmark"
  | "template";

export type CardColor =
  | "amber"
  | "rose"
  | "sky"
  | "emerald"
  | "violet"
  | "slate"
  | "orange"
  | "teal";

export interface Note {
  id: string;
  userId?: string;
  type: NoteType;
  title: string;
  content: unknown;
  contentText: string;
  color: CardColor;
  folderId: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  isLocked: boolean;
  reminderAt: number | null;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
  lastOpenedAt: number | null;
  version: number;
}

export interface Folder {
  id: string;
  userId?: string;
  name: string;
  color: string;
  parentId: string | null;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface Tag {
  id: string;
  userId?: string;
  name: string;
  color: string;
}

export interface NoteTag {
  noteId: string;
  tagId: string;
  userId?: string;
}

export interface Revision {
  id: string;
  noteId: string;
  userId?: string;
  title: string;
  content: unknown;
  createdAt: number;
}

export interface Attachment {
  id: string;
  noteId: string;
  userId?: string;
  kind: string;
  storagePath: string;
  size: number;
  mime: string;
  createdAt: number;
}

export interface Share {
  id: string;
  noteId: string;
  userId?: string;
  token: string;
  expiresAt: number | null;
  revokedAt: number | null;
  createdAt: number;
}

export interface Template {
  id: string;
  userId?: string;
  name: string;
  type: NoteType;
  content: unknown;
  createdAt: number;
}

export interface Settings {
  userId: string;
  theme: "light" | "dark" | "system";
  accent: string;
  editorFont: "sans" | "serif" | "mono";
  editorSize: number;
  density: "compact" | "comfortable";
  language: "id" | "en";
  appLock: boolean;
  privacyMode: boolean;
}

export interface OutboxItem {
  id?: number;
  table: string;
  op: "upsert" | "delete";
  payload: unknown;
  createdAt: number;
  attempts: number;
}

export const NOTE_COLORS: CardColor[] = [
  "amber",
  "rose",
  "sky",
  "emerald",
  "violet",
  "slate",
  "orange",
  "teal",
];

export const EMPTY_NOTE_CONTENT = { type: "doc", content: [{ type: "paragraph" }] };

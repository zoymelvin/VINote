import Dexie, { type Table } from "dexie";
import type {
  Note,
  Folder,
  Tag,
  NoteTag,
  Revision,
  Attachment,
  Share,
  Template,
  Settings,
  OutboxItem,
} from "@/lib/notes/types";

export class VinoteDB extends Dexie {
  notes!: Table<Note, string>;
  folders!: Table<Folder, string>;
  tags!: Table<Tag, string>;
  noteTags!: Table<NoteTag, [string, string]>;
  revisions!: Table<Revision, string>;
  attachments!: Table<Attachment, string>;
  shares!: Table<Share, string>;
  templates!: Table<Template, string>;
  settings!: Table<Settings, string>;
  outbox!: Table<OutboxItem, number>;
  meta!: Table<{ key: string; value: unknown }, string>;

  constructor() {
    super("vinote");
    this.version(1).stores({
      notes: "id, userId, type, folderId, isPinned, isArchived, isFavorite, updatedAt, deletedAt, lastOpenedAt",
      folders: "id, userId, parentId, updatedAt, deletedAt",
      tags: "id, userId, name",
      noteTags: "[noteId+tagId], noteId, tagId, userId",
      revisions: "id, noteId, userId, createdAt",
      attachments: "id, noteId, userId, createdAt",
      shares: "id, noteId, userId, token",
      templates: "id, userId, type",
      settings: "userId",
      outbox: "++id, table, createdAt",
      meta: "key",
    });
  }
}

export const db = new VinoteDB();

import Dexie, { type Table } from "dexie";
import type {
  Note,
  Collection,
  Tag,
  NoteTag,
  Revision,
  Attachment,
  Share,
  Template,
  Settings,
  OutboxItem,
  NoteCollection,
} from "@/lib/notes/types";

export class VinoteDB extends Dexie {
  notes!: Table<Note, string>;
  folders!: Table<Collection, string>;
  tags!: Table<Tag, string>;
  noteTags!: Table<NoteTag, [string, string]>;
  revisions!: Table<Revision, string>;
  attachments!: Table<Attachment, string>;
  shares!: Table<Share, string>;
  templates!: Table<Template, string>;
  settings!: Table<Settings, string>;
  outbox!: Table<OutboxItem, number>;
  meta!: Table<{ key: string; value: unknown }, string>;
  noteCollections!: Table<NoteCollection, [string, string]>;

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
    this.version(2).stores({
      notes: "id, userId, type, folderId, isPinned, isArchived, isFavorite, updatedAt, deletedAt, lastOpenedAt",
      folders: "id, userId, parentId, updatedAt, deletedAt, isPinned",
      tags: "id, userId, name",
      noteTags: "[noteId+tagId], noteId, tagId, userId",
      revisions: "id, noteId, userId, createdAt",
      attachments: "id, noteId, userId, createdAt",
      shares: "id, noteId, userId, token",
      templates: "id, userId, type",
      settings: "userId",
      outbox: "++id, table, createdAt",
      meta: "key",
    }).upgrade((tx) => {
      return tx.table("folders").toCollection().modify((c: Record<string, unknown>) => {
        if (!("icon" in c)) c.icon = "";
        if (!("description" in c)) c.description = "";
        if (!("cover" in c)) c.cover = "";
        if (!("smartRule" in c)) c.smartRule = null;
        if (!("isPinned" in c)) c.isPinned = false;
      });
    });
    this.version(3).stores({
      notes: "id, userId, type, folderId, isPinned, isArchived, isFavorite, updatedAt, deletedAt, lastOpenedAt",
      folders: "id, userId, parentId, updatedAt, deletedAt, isPinned",
      tags: "id, userId, name",
      noteTags: "[noteId+tagId], noteId, tagId, userId",
      revisions: "id, noteId, userId, createdAt",
      attachments: "id, noteId, userId, createdAt",
      shares: "id, noteId, userId, token",
      templates: "id, userId, type",
      settings: "userId",
      outbox: "++id, table, createdAt",
      meta: "key",
      noteCollections: "[noteId+collectionId], collectionId, noteId, userId, deletedAt",
    }).upgrade((tx) => {
      return tx.table("notes").toCollection().toArray().then((notes) => {
        const rels: NoteCollection[] = [];
        for (const n of notes) {
          if (n.folderId) {
            rels.push({
              noteId: n.id,
              collectionId: n.folderId,
              userId: n.userId,
              createdAt: n.createdAt,
              updatedAt: n.updatedAt,
              deletedAt: null,
            });
          }
        }
        if (rels.length) return tx.table("noteCollections").bulkAdd(rels);
      });
    });
  }
}

export const db = new VinoteDB();

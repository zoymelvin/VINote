"use client";
import dynamic from "next/dynamic";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import { useParams } from "next/navigation";
import { listCollections, noteTags } from "@/lib/db/repo";
import { useMemo } from "react";

const RichEditor = dynamic(() => import("@/components/editor/rich-editor"), { ssr: false, loading: () => <div className="p-4">Memuat editor...</div> });

export default function NotePage() {
  const params = useParams();
  const id = String(params.id);
  const note = useLiveQuery(() => db.notes.get(id), [id]);
  const collections = useLiveQuery(() => listCollections(), []);
  const tags = useLiveQuery(() => noteTags(id), [id]);

  const isNew = useMemo(() => {
    if (note !== undefined) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  }, [note, id]);

  const collection = useMemo(() => (collections ?? []).find((c) => c.id === note?.folderId), [collections, note?.folderId]);

  if (note) {
    return (
      <div>
        <RichEditor
          noteId={note.id}
          initialTitle={note.title}
          initialContent={note.content}
          collectionName={collection?.name}
          tags={tags}
          isArchived={note.isArchived}
          isDeleted={!!note.deletedAt}
        />
      </div>
    );
  }

  if (isNew) {
    return (
      <div>
        <RichEditor
          noteId={id}
          initialTitle=""
          initialContent={{ type: "doc", content: [{ type: "paragraph" }] }}
          collectionName={undefined}
          tags={[]}
          isNew
        />
      </div>
    );
  }

  if (note === null || note === undefined) {
    // Wait for query to resolve
    return <div className="p-4">Memuat...</div>;
  }

  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <p className="text-[var(--text-muted)]">Catatan tidak ditemukan</p>
      <button onClick={() => window.history.back()} className="text-[var(--accent)] underline">Kembali</button>
    </div>
  );
}

"use client";
import dynamic from "next/dynamic";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import { useParams } from "next/navigation";
import { listCollections, noteTags } from "@/lib/db/repo";
import { useMemo, useState, useEffect } from "react";

const RichEditor = dynamic(() => import("@/components/editor/rich-editor"), { ssr: false, loading: () => <div className="p-4">Memuat editor...</div> });

export default function NotePage() {
  const params = useParams();
  const id = String(params.id);
  const [resolved, setResolved] = useState(false);
  const note = useLiveQuery(() => db.notes.get(id), [id]);
  const collections = useLiveQuery(() => listCollections(), []);
  const tags = useLiveQuery(() => noteTags(id), [id]);

  // Track when useLiveQuery has resolved
  useEffect(() => {
    if (note !== undefined) {
      // Note exists or not found - mark as resolved
      const timer = setTimeout(() => setResolved(true), 0);
      return () => clearTimeout(timer);
    }
  }, [note]);

  // For new notes (valid UUID not in DB), resolve after a short timeout
  useEffect(() => {
    const timer = setTimeout(() => setResolved(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const isNew = useMemo(() => {
    if (!resolved) return null; // still loading
    if (note) return false; // exists
    // Note doesn't exist - check if it's a valid UUID (draft mode)
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  }, [note, id, resolved]);

  const collection = useMemo(() => (collections ?? []).find((c) => c.id === note?.folderId), [collections, note?.folderId]);

  // Loading state - don't render editor until note is resolved
  if (!resolved) {
    return <div className="p-4">Memuat...</div>;
  }

  if (note) {
    return (
      <div>
        <RichEditor
          key={`loaded-${note.id}`}
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
          key={`draft-${id}`}
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

  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <p className="text-[var(--text-muted)]">Catatan tidak ditemukan</p>
      <button onClick={() => window.history.back()} className="text-[var(--accent)] underline">Kembali</button>
    </div>
  );
}

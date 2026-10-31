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

  const collection = useMemo(() => (collections ?? []).find((c) => c.id === note?.folderId), [collections, note?.folderId]);

  if (!note) return <div className="p-4">Memuat...</div>;
  return (
    <div>
      <RichEditor
        noteId={note.id}
        initialTitle={note.title}
        initialContent={note.content}
        collectionName={collection?.name}
        tags={tags}
      />
    </div>
  );
}

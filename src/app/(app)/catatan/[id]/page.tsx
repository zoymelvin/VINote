"use client";
import dynamic from "next/dynamic";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const RichEditor = dynamic(() => import("@/components/editor/rich-editor"), { ssr: false, loading: () => <div className="p-4">Memuat editor...</div> });

export default function NotePage() {
  const params = useParams();
  const id = String(params.id);
  const note = useLiveQuery(() => db.notes.get(id), [id]);
  const router = useRouter();
  if (!note) return <div className="p-4">Memuat...</div>;
  return (
    <div>
      <div className="flex items-center gap-2 p-4">
        <Button variant="ghost" onClick={() => router.back()}><ArrowLeft size={18} /></Button>
        <span className="text-sm text-[var(--muted)]">{note.type}</span>
      </div>
      <RichEditor noteId={note.id} initialTitle={note.title} initialContent={note.content} />
    </div>
  );
}

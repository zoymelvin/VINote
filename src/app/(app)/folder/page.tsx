"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { listFolders, createFolder } from "@/lib/db/repo";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Plus } from "lucide-react";

export default function FolderPage() {
  const folders = useLiveQuery(() => listFolders(), []);
  return (
    <div className="p-4 md:p-8">
      <PageHeader title="Folder" actions={<Button onClick={() => createFolder({ name: "Folder baru" })}><Plus size={18} /> Baru</Button>} />
      <div className="grid gap-3 sm:grid-cols-2">
        {(folders ?? []).map((f) => (
          <div key={f.id} className="rounded-2xl bg-[var(--card)] p-4 shadow-[var(--shadow-1)]">{f.name}</div>
        ))}
      </div>
    </div>
  );
}

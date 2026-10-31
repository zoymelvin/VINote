"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { listTrash, hardDeleteNote, emptyTrash } from "@/lib/db/repo";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { NoteRow } from "@/components/shared/note-row";
import { useToast } from "@/stores/toast";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import { Trash } from "@phosphor-icons/react";

export default function SampahPage() {
  const trash = useLiveQuery(() => listTrash(), []);
  const toast = useToast();
  const reduced = useReducedMotion();

  async function remove(n: { id: string }) {
    await hardDeleteNote(n.id);
    toast.push({ message: "Dihapus permanen" });
  }

  return (
    <div className="p-4 md:p-8">
      <PageHeader title="Sampah" description="Catatan yang dihapus" icon={<Trash size={24} weight="regular" />} actions={<Button variant="danger" onClick={() => emptyTrash()}>Kosongkan</Button>} />
      {!trash?.length && <EmptyState title="Sampah kosong" description="Catatan yang dihapus akan muncul di sini." />}
      <m.div variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : 0.04 } } }} initial="hidden" animate="show" className="space-y-2">
        {(trash ?? []).map((n) => (
          <m.div key={n.id} variants={{ hidden: { opacity: 0, y: reduced ? 0 : 4 }, show: { opacity: 1, y: 0 } }}>
            <NoteRow note={n} onRemove={() => remove(n)} />
          </m.div>
        ))}
      </m.div>
    </div>
  );
}

"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { listNotes, softDeleteNote } from "@/lib/db/repo";
import { db } from "@/lib/db/db";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { NoteRow } from "@/components/shared/note-row";
import { useToast } from "@/stores/toast";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import { Archive } from "@phosphor-icons/react";

export default function ArsipPage() {
  const notes = useLiveQuery(() => listNotes({ archived: true }), []);
  const toast = useToast();
  const reduced = useReducedMotion();

  async function remove(n: { id: string }) {
    await softDeleteNote(n.id);
    toast.push({ message: "Dipindahkan ke Sampah", undo: async () => db.notes.update(n.id, { deletedAt: null }) });
  }

  return (
    <div className="p-4 md:p-8">
      <PageHeader title="Arsip" description="Catatan yang diarsipkan" icon={<Icon icon={Archive} size={24} weight="regular" />} />
      {!notes?.length && <EmptyState title="Belum ada arsip" description="Catatan yang diarsipkan akan muncul di sini." />}
      <m.div variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : 0.04 } } }} initial="hidden" animate="show" className="space-y-2">
        {(notes ?? []).map((n) => (
          <m.div key={n.id} variants={{ hidden: { opacity: 0, y: reduced ? 0 : 4 }, show: { opacity: 1, y: 0 } }}>
            <NoteRow note={n} onRemove={() => remove(n)} archived />
          </m.div>
        ))}
      </m.div>
    </div>
  );
}

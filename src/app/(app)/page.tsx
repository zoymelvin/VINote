"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import { createNote } from "@/lib/db/repo";
import { NoteCard } from "@/components/notes/note-card";
import { useRouter } from "next/navigation";
import { Plus, NotebookPen, Flame, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import * as m from "motion/react-m";
import { startOfWeek } from "date-fns";
import { useReducedMotion } from "motion/react";

export default function Home() {
  const notes = useLiveQuery(() => db.notes.filter((n) => !n.deletedAt && !n.isArchived).toArray(), []);
  const router = useRouter();
  const reduced = useReducedMotion();

  async function quick() {
    const n = await createNote({ type: "quick", title: "Catatan cepat" });
    router.push(`/catatan/${n.id}`);
  }

  const list = notes ?? [];
  const total = list.length;
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).getTime();
  const checklistWeek = list.filter((n) => n.type === "checklist" && n.createdAt >= weekStart).length;

  const days = new Set(list.map((n) => new Date(n.updatedAt).toDateString()));
  let streak = 0;
  const d = new Date();
  while (days.has(d.toDateString())) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: reduced ? 0 : 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, y: reduced ? 0 : 8 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Beranda"
        description={new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
        actions={<Button onClick={quick}><Icon icon={Plus} size={18} /> Baru</Button>}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Icon icon={NotebookPen} size={20} className="text-[var(--accent)]" />
            <div>
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-xs text-[var(--text-muted)]">Catatan</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Icon icon={Flame} size={20} className="text-[var(--accent)]" />
            <div>
              <div className="text-2xl font-bold">{streak}</div>
              <div className="text-xs text-[var(--text-muted)]">Streak</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Icon icon={CheckSquare} size={20} className="text-[var(--accent)]" />
            <div>
              <div className="text-2xl font-bold">{checklistWeek}</div>
              <div className="text-xs text-[var(--text-muted)]">Checklist minggu ini</div>
            </div>
          </div>
        </Card>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<Icon icon={NotebookPen} size={32} className="text-[var(--accent)]" />}
          title="Belum ada catatan"
          description="Tekan tombol Baru untuk mulai menulis."
          action={<Button onClick={quick}><Icon icon={Plus} size={18} /> Buat catatan</Button>}
        />
      ) : (
        <m.div variants={container} initial="hidden" animate="show" className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
          {list.map((n, i) => (
            <m.div key={n.id} variants={i < 8 ? item : undefined}>
              <NoteCard note={n} />
            </m.div>
          ))}
        </m.div>
      )}
    </div>
  );
}
"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { listCollections, createCollection } from "@/lib/db/repo";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";

const EMOJIS = ["📁", "💼", "🏠", "💡", "🎨", "📚", "🎯", "✈️", "💪", "🧘"];

export default function KoleksiPage() {
  const collections = useLiveQuery(() => listCollections(), []);
  const router = useRouter();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📁");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const exists = (collections ?? []).some((c) => c.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) {
      alert("Nama koleksi sudah ada");
      return;
    }
    const c = await createCollection({ name: name.trim(), icon });
    setOpen(false);
    setName("");
    setIcon("📁");
    router.push(`/koleksi/${c.id}`);
  }

  const list = collections ?? [];
  const noCollection = list.filter((c) => !c.parentId && c.name !== "Tanpa Koleksi");

  return (
    <div className="p-4 md:p-8">
      <PageHeader title="Koleksi" description="Kelompokkan catatan Anda" actions={<Button onClick={() => setOpen(true)}><Plus size={18} /> Koleksi baru</Button>} />
      {noCollection.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={32} className="text-[var(--accent)]" />}
          title="Belum ada koleksi"
          description="Buat koleksi pertama untuk mengorganisir catatan."
          action={<Button onClick={() => setOpen(true)}><Plus size={18} /> Buat koleksi</Button>}
        />
      ) : (
        <m.div variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : 0.05 } } }} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <m.div variants={{ hidden: { opacity: 0, y: reduced ? 0 : 8 }, show: { opacity: 1, y: 0 } }}>
            <button
              onClick={() => setOpen(true)}
              className="flex h-40 w-full flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed border-[var(--border)] bg-[var(--card-muted)]/50 p-4 transition hover:border-[var(--accent)] hover:bg-[var(--card-muted)]"
            >
              <Plus size={24} className="text-[var(--accent)]" />
              <span className="text-sm font-medium text-[var(--text-muted)]">Koleksi baru</span>
            </button>
          </m.div>
          {noCollection.map((c) => (
            <m.div key={c.id} variants={{ hidden: { opacity: 0, y: reduced ? 0 : 8 }, show: { opacity: 1, y: 0 } }}>
              <button onClick={() => router.push(`/koleksi/${c.id}`)} className="flex h-40 w-full flex-col gap-2 rounded-[24px] bg-[var(--card)] p-5 text-left shadow-[var(--shadow-1)] transition hover:-translate-y-[2px]">
                <span className="text-4xl">{c.icon || "📁"}</span>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{c.description || "Koleksi"}</div>
              </button>
            </m.div>
          ))}
        </m.div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Koleksi baru">
        <form onSubmit={submit} className="space-y-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama koleksi" required />
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => setIcon(e)} className={cn("text-2xl rounded-xl p-2 transition", icon === e ? "ring-2 ring-[var(--accent)] bg-[var(--card-muted)]" : "hover:bg-[var(--card-muted)]")}>{e}</button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit">Buat</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { listCollections, createCollection, updateCollection, softDeleteCollection, countByCollection } from "@/lib/db/repo";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { CollectionIcon } from "@/components/shared/collection-icon";
import { CollectionDialog } from "@/components/shared/collection-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DotsThree, PencilSimple, Trash } from "@phosphor-icons/react";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import type { Collection } from "@/lib/notes/types";

const ICONS = ["📁", "💼", "🏠", "💡", "🎨", "📚", "🎯", "✈️", "💪", "🧘"];

function CollectionCardMobile({ c, counts, onEdit, onDelete }: { c: Collection; counts: Record<string, number>; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <article className="relative cursor-pointer rounded-[16px] border border-[var(--border)] bg-[var(--card)]" style={{ height: "76px", padding: "12px 16px", marginBottom: "10px" }}>
      <Link href={`/koleksi/${c.id}`} className="absolute inset-0 z-0 rounded-[inherit]" aria-label={`Buka koleksi: ${c.name}`} />
      <div className="relative z-[1] flex items-center gap-3 h-full">
        <CollectionIcon icon={c.icon} color={c.color} size={48} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[16px] leading-[22px] truncate">{c.name}</div>
          <div className="text-[12.5px] text-[var(--text-muted)]">{counts?.[c.id] ?? 0} catatan{c.description ? ` · ${c.description}` : ""}</div>
        </div>
        <div className="relative z-[10] pointer-events-auto">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-[var(--card-muted)]"
                onClick={(e) => e.stopPropagation()}
              >
                <Icon icon={DotsThree} size={18} weight="bold" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem icon={<Icon icon={PencilSimple} size={18} />} onSelect={() => { setMenuOpen(false); onEdit(c.id); }}>Edit koleksi</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem icon={<Icon icon={Trash} size={18} />} onSelect={() => { setMenuOpen(false); onDelete(c.id); }} className="text-rose-600">Hapus koleksi</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}

export default function KoleksiPage() {
  const collections = useLiveQuery(() => listCollections(), []);
  const counts = useLiveQuery(() => countByCollection(), []);
  const router = useRouter();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📁");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const c = await createCollection({ name: name.trim(), icon });
    setOpen(false);
    setName("");
    setIcon("📁");
    router.push(`/koleksi/${c.id}`);
  }

  async function handleEdit(id: string, newName: string) {
    await updateCollection(id, { name: newName.trim() || "Tanpa judul" });
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    await softDeleteCollection(id);
    setDeleteId(null);
  }

  const list = collections ?? [];
  const noCollection = list.filter((c) => !c.parentId);

  return (
    <div className="p-4 md:p-8">
      <PageHeader title="Koleksi" description="Kelompokkan catatan Anda" actions={<Button onClick={() => { setEditingId(null); setDialogOpen(true); }}><Icon icon={Plus} size={18} /> Koleksi baru</Button>} />
      {noCollection.length === 0 ? (
        <EmptyState
          icon={<CollectionIcon size={40} />}
          title="Belum ada koleksi"
          description="Buat koleksi pertama untuk mengorganisir catatan."
          action={<Button onClick={() => { setEditingId(null); setDialogOpen(true); }}><Icon icon={Plus} size={18} /> Buat koleksi</Button>}
        />
      ) : (
        <div className="md:grid md:grid-cols-2 md:lg:grid-cols-3 md:gap-4">
          <div className="md:hidden flex flex-col">
            {noCollection.map((c) => (
              <CollectionCardMobile
                key={c.id}
                c={c}
                counts={counts ?? {}}
                onEdit={(id) => { setEditingId(id); setDialogOpen(true); }}
                onDelete={setDeleteId}
              />
            ))}
          </div>
          <m.div variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : 0.05 } } }} initial="hidden" animate="show" className="hidden md:flex flex-col gap-4">
            {noCollection.map((c) => (
              <m.div key={c.id} variants={{ hidden: { opacity: 0, y: reduced ? 0 : 8 }, show: { opacity: 1, y: 0 } }}>
                <div className="group relative cursor-pointer rounded-[16px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-1)] transition-transform [@media(hover:hover)]:hover:-translate-y-[1px]">
                  <Link href={`/koleksi/${c.id}`} className="absolute inset-0 z-0 rounded-[inherit]" aria-label={`Buka koleksi: ${c.name}`} />
                  <div className="relative z-[1] pointer-events-none">
                    <div className="mb-3 flex items-start justify-between">
                      <CollectionIcon icon={c.icon} color={c.color} size={40} />
                      <div className="pointer-events-auto relative z-[2]">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex h-9 w-9 items-center justify-center rounded-xl opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                            <Icon icon={DotsThree} size={18} weight="bold" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem icon={<Icon icon={PencilSimple} size={18} />} onSelect={() => { setEditingId(c.id); setDialogOpen(true); }}>Edit koleksi</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem icon={<Icon icon={Trash} size={18} />} onSelect={() => setDeleteId(c.id)} className="text-rose-600">Hapus koleksi</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      </div>
                    </div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{counts?.[c.id] ?? 0} catatan</div>
                  </div>
                </div>
              </m.div>
            ))}
          </m.div>
        </div>
      )}

      <CollectionDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingId(null); }} editingId={editingId} key={dialogOpen ? "open" : "closed"} />

      <Dialog open={!!editingId} onClose={() => setEditingId(null)} title="Edit koleksi">
        {editingId && (
          <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.target as HTMLFormElement); handleEdit(editingId, formData.get("name") as string); }} className="space-y-4">
            <Input name="name" defaultValue={list.find((c) => c.id === editingId)?.name} placeholder="Nama koleksi" required />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>Batal</Button>
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        )}
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus koleksi">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">Hapus koleksi ini?</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button type="button" variant="danger" onClick={() => deleteId && handleDelete(deleteId)}>Hapus</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
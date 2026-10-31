"use client";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { SettingsRow } from "@/components/ui/settings-row";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Palette, Monitor, Download, Question, SignOut, Trash, User } from "@phosphor-icons/react";
import { Icon } from "@/components/icons";
import { ACCENT_LABEL, THEME_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

const ACCENTS = [
  { id: "indigo", color: "#6366f1" },
  { id: "rose", color: "#f43f5e" },
  { id: "sky", color: "#0ea5e9" },
  { id: "emerald", color: "#10b981" },
  { id: "violet", color: "#8b5cf6" },
  { id: "slate", color: "#64748b" },
  { id: "orange", color: "#f97316" },
  { id: "teal", color: "#14b8a6" },
  { id: "pink", color: "#ec4899" },
  { id: "amber", color: "#f59e0b" },
  { id: "cyan", color: "#06b6d4" },
  { id: "fuchsia", color: "#d946ef" },
];

export default function PengaturanPage() {
  const { theme, setTheme, setAccent } = useTheme();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState("zoymelvin");
  const [username, setUsername] = useState("zoymelvin");
  async function signOut() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/login");
  }
  return (
    <div className="p-4 md:p-8 space-y-6 overflow-x-hidden">
      <PageHeader title="Pengaturan" description="Kelola preferensi aplikasi" />

      <div className="flex items-center gap-4 rounded-[24px] bg-[var(--card)] p-4 shadow-[var(--shadow-1)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-lg font-bold text-white">Z</div>
        <div className="min-w-0">
          <div className="font-semibold">Akun</div>
          <div className="text-xs text-[var(--text-muted)]">zoymelvin@email.com</div>
        </div>
        <Button variant="secondary" className="ml-auto" onClick={() => setEditOpen(true)}><Icon icon={User} size={16} /> Edit profil</Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-muted)]">Tampilan</h2>
        <SettingsRow icon={<Icon icon={Monitor} size={20} />} label="Tema" description={THEME_LABEL[theme]}>
          <div className="w-full overflow-x-auto md:w-auto">
            <Segmented options={[{ id: "light", label: "Terang" }, { id: "dark", label: "Gelap" }, { id: "system", label: "Sistem" }]} value={theme} onChange={(id: string) => setTheme(id as "light" | "dark" | "system")} className="min-w-[200px]" />
          </div>
        </SettingsRow>
        <SettingsRow icon={<Icon icon={Palette} size={20} />} label="Warna aksen">
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAccent(a.id)}
                className={cn("h-11 w-11 min-h-[44px] min-w-[44px] rounded-full border-2 transition", theme === a.id ? "border-[var(--foreground)] scale-110" : "border-transparent")}
                style={{ background: a.color }}
                aria-label={ACCENT_LABEL[a.id] || a.id}
              />
            ))}
          </div>
        </SettingsRow>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-muted)]">Data dan Cadangan</h2>
        <SettingsRow icon={<Icon icon={Download} size={20} />} label="Ekspor data" description="Simpan cadangan catatan">
          <Button size="sm" variant="secondary">Ekspor</Button>
        </SettingsRow>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-muted)]">Bantuan</h2>
        <SettingsRow icon={<Icon icon={Question} size={20} />} label="Pintasan keyboard" description="Lihat daftar pintasan">
          <Button size="sm" variant="ghost">Lihat</Button>
        </SettingsRow>
      </section>

      <section className="rounded-[24px] border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-rose-700 dark:text-rose-300">Zona Berbahaya</h2>
          <Button variant="danger" className="w-full" onClick={signOut}><Icon icon={SignOut} size={18} /> Keluar</Button>
          <Button variant="danger" className="w-full" onClick={() => {}}><Icon icon={Trash} size={18} /> Hapus semua data lokal</Button>
        </div>
      </section>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit profil">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Nama tampilan</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nama tampilan" className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Username</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" className="mt-1" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button type="button" onClick={() => setEditOpen(false)}>Simpan</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

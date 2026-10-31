"use client";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Segmented } from "@/components/ui/segmented";
import { SettingsRow } from "@/components/ui/settings-row";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/field";
import { Avatar } from "@/components/shared/avatar";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Palette, Monitor, Download, Question, SignOut, Trash, User, Camera } from "@phosphor-icons/react";
import { Icon } from "@/components/icons";
import { ACCENT_LABEL, THEME_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { useProfile } from "@/stores/profile";
import { db } from "@/lib/db/db";

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
  const profile = useProfile();
  const [editOpen, setEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  }

  async function saveProfile() {
    const updated = {
      displayName: displayName.trim() || profile.displayName,
      username: username.trim() || profile.username,
      email: profile.email,
      avatarUrl: avatarPreview,
    };
    await db.meta.put({ key: "profile", value: updated });
    setEditOpen(false);
  }

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
        <Avatar src={avatarPreview ?? undefined} alt={profile.displayName} initials={profile.displayName.charAt(0).toUpperCase()} size={48} />
        <div className="min-w-0">
          <div className="font-semibold">{profile.displayName}</div>
          <div className="text-xs text-[var(--text-muted)]">@{profile.username}</div>
          <div className="text-xs text-[var(--text-muted)]">{profile.email}</div>
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
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar src={avatarPreview ?? undefined} alt={displayName} initials={displayName.charAt(0).toUpperCase()} size={96} className="rounded-full object-cover" />
              <label className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-white cursor-pointer shadow-[var(--shadow-1)]">
                <Icon icon={Camera} size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => { setAvatarPreview(null); setAvatarFile(null); }}>Hapus foto</Button>
            </div>
          </div>
          <Field label="Nama tampilan">
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nama tampilan" />
          </Field>
          <Field label="Username">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
          </Field>
          <Field label="Email">
            <Input value={profile.email} disabled placeholder="email@contoh.com" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button type="button" onClick={saveProfile}>Simpan</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

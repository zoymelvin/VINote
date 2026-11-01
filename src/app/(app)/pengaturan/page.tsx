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
import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Palette, Monitor, Download, Question, Trash, Archive, User, Camera } from "@phosphor-icons/react";
import { Icon } from "@/components/icons";
import { ACCENT_LABEL, THEME_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { useProfile } from "@/stores/profile";
import { db } from "@/lib/db/db";
import { createBackup, listBackups, restoreBackup, listUnsyncedNotes } from "@/lib/db/repo";

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
  const [sessionEmail, setSessionEmail] = React.useState<string | null>(null);
  React.useEffect(() => {
    const client = createClient();
    if (!client) return;
    client.auth.getSession().then(({ data: { session } }) => {
      setSessionEmail(session?.user?.email ?? null);
    });
  }, []);
  const [editOpen, setEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl);
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
  const [backups, setBackups] = useState<Awaited<ReturnType<typeof listBackups>>>([]);
  const [unsynced, setUnsynced] = useState<Awaited<ReturnType<typeof listUnsyncedNotes>>>([]);
  const [backupOpen, setBackupOpen] = useState(false);
  const [unsyncedOpen, setUnsyncedOpen] = useState(false);
  const [mounted] = React.useState(() => typeof window !== "undefined");

  async function resizeToJpeg(file: File): Promise<Blob> {
    const img = await createImageBitmap(file);
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    const scale = Math.max(size / img.width, size / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    return new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.85);
    });
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const blob = await resizeToJpeg(file);
      const url = URL.createObjectURL(blob);
      setAvatarBlob(blob);
      setAvatarPreview(url);
    } catch {
      const url = URL.createObjectURL(file);
      setAvatarBlob(file);
      setAvatarPreview(url);
    }
  }

  async function saveProfile() {
    const current = await db.profiles.get("local");
    const userId = current?.userId;
    const updatedAvatarUrl = avatarPreview && avatarBlob ? (userId ? `${userId}/avatar.jpg` : current?.avatarUrl ?? null) : (avatarPreview ? current?.avatarUrl ?? null : null);
    await db.profiles.put({
      id: "local",
      userId,
      displayName: displayName.trim() || profile.displayName,
      username: username.trim() || profile.username,
      email: profile.email,
      avatarBlob: avatarBlob ?? current?.avatarBlob ?? null,
      avatarUrl: avatarBlob ? updatedAvatarUrl : (avatarPreview ? current?.avatarUrl ?? null : null),
      updatedAt: Date.now(),
    });

    // Upload to avatars bucket when possible; enqueue outbox on failure.
    if (avatarBlob && userId) {
      const client = createClient();
      if (client) {
        const path = `${userId}/avatar.jpg`;
        const { error } = await client.storage.from("avatars").upload(path, avatarBlob, { upsert: true, contentType: "image/jpeg" });
        if (error) {
          const { enqueue } = await import("@/lib/sync/engine");
          await enqueue("profiles", "upsert", { id: userId, user_id: userId, display_name: displayName.trim() || profile.displayName, username: username.trim() || profile.username, email: profile.email, avatar_url: path, updated_at: new Date().toISOString() });
        } else {
          const { processOutbox } = await import("@/lib/sync/engine");
          await db.profiles.put({ id: "local", userId, displayName: displayName.trim() || profile.displayName, username: username.trim() || profile.username, email: profile.email, avatarBlob, avatarUrl: path, updatedAt: Date.now() });
          const { enqueue } = await import("@/lib/sync/engine");
          await enqueue("profiles", "upsert", { id: userId, user_id: userId, display_name: displayName.trim() || profile.displayName, username: username.trim() || profile.username, email: profile.email, avatar_url: path, updated_at: new Date().toISOString() });
          await processOutbox();
        }
      } else {
        const { enqueue } = await import("@/lib/sync/engine");
        await enqueue("profiles", "upsert", { id: userId ?? "local", user_id: userId, display_name: displayName.trim() || profile.displayName, username: username.trim() || profile.username, email: profile.email, avatar_url: avatarPreview, updated_at: new Date().toISOString() });
      }
    } else {
      const { enqueue } = await import("@/lib/sync/engine");
      await enqueue("profiles", "upsert", { id: userId ?? "local", user_id: userId, display_name: displayName.trim() || profile.displayName, username: username.trim() || profile.username, email: profile.email, avatar_url: avatarPreview, updated_at: new Date().toISOString() });
    }

    setEditOpen(false);
  }

  async function loadBackups() {
    setBackups(await listBackups());
  }

  async function loadUnsynced() {
    setUnsynced(await listUnsyncedNotes());
  }

  async function handleCreateBackup() {
    await createBackup();
    await loadBackups();
  }

  async function handleRestoreBackup(id: string) {
    const count = await restoreBackup(id);
    alert(`Dipulihkan ${count} catatan`);
    setBackupOpen(false);
  }

  async function handleUploadUnsynced() {
    const { processOutbox } = await import("@/lib/sync/engine");
    await processOutbox();
    await loadUnsynced();
  }

  return (
    <div className="p-4 md:p-8 space-y-6 overflow-x-hidden">
      <PageHeader title="Pengaturan" description="Kelola preferensi aplikasi" />

      <div className="flex items-center gap-4 rounded-[24px] bg-[var(--card)] p-4 shadow-[var(--shadow-1)]">
        <Avatar src={avatarPreview ?? undefined} alt={profile.displayName} initials={profile.displayName.charAt(0).toUpperCase()} size={48} />
        <div className="min-w-0">
          <div className="font-semibold">{profile.displayName}</div>
          <div className="text-xs text-[var(--text-muted)]">@{profile.username}</div>
          <div className="text-xs text-[var(--text-muted)]">{sessionEmail || "Belum masuk"}</div>
        </div>
        <Button variant="secondary" className="ml-auto" onClick={() => setEditOpen(true)}><Icon icon={User} size={16} /> Edit profil</Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-muted)]">Tampilan</h2>
        <SettingsRow icon={<Icon icon={Monitor} size={20} />} label="Tema" description={mounted ? THEME_LABEL[theme] : undefined}>
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
        <SettingsRow icon={<Icon icon={Download} size={20} />} label="Pulihkan dari cadangan lokal" description="Daftar cadangan yang tersimpan">
          <Button size="sm" variant="secondary" onClick={() => { loadBackups(); setBackupOpen(true); }}>Buka</Button>
        </SettingsRow>
        <SettingsRow icon={<Icon icon={Download} size={20} />} label="Periksa catatan yang belum tersinkron" description="Daftar catatan lokal/gagal">
          <Button size="sm" variant="secondary" onClick={() => { loadUnsynced(); setUnsyncedOpen(true); }}>Buka</Button>
        </SettingsRow>
        <SettingsRow icon={<Icon icon={Archive} size={20} />} label="Arsip" description="Catatan yang diarsipkan">
          <Button size="sm" variant="secondary" onClick={() => router.push("/arsip")}>Buka</Button>
        </SettingsRow>
        <SettingsRow icon={<Icon icon={Trash} size={20} />} label="Sampah" description="Catatan yang dihapus">
          <Button size="sm" variant="secondary" onClick={() => router.push("/sampah")}>Buka</Button>
        </SettingsRow>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-muted)]">Bantuan</h2>
        <SettingsRow icon={<Icon icon={Question} size={20} />} label="Pintasan keyboard" description="Lihat daftar pintasan">
          <Button size="sm" variant="ghost">Lihat</Button>
        </SettingsRow>
        <SettingsRow icon={<Icon icon={Question} size={20} />} label="Diagnostik sinkron" description="Periksa koneksi server">
          <Button size="sm" variant="ghost" onClick={() => router.push("/pengaturan/diagnostik")}>Buka</Button>
        </SettingsRow>
      </section>

      <section className="rounded-[24px] border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-rose-700 dark:text-rose-300">Zona Berbahaya</h2>
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
              <Button size="sm" variant="secondary" onClick={() => { setAvatarPreview(null); setAvatarBlob(null); }}>Hapus foto</Button>
            </div>
          </div>
          <Field label="Nama tampilan">
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nama tampilan" />
          </Field>
          <Field label="Username">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
          </Field>
          <Field label="Email">
            <Input value={sessionEmail || "Belum masuk"} disabled placeholder="email@contoh.com" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button type="button" onClick={saveProfile}>Simpan</Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={backupOpen} onClose={() => setBackupOpen(false)} title="Pulihkan dari cadangan lokal">
        <div className="space-y-4">
          <Button size="sm" onClick={handleCreateBackup}>Buat cadangan baru</Button>
          {backups.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">Belum ada cadangan.</p>
          ) : (
            <div className="space-y-2">
              {backups.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-xl bg-[var(--card-muted)] p-3">
                  <div>
                    <div className="text-sm font-medium">{new Date(b.createdAt).toLocaleString("id-ID")}</div>
                    <div className="text-xs text-[var(--text-muted)]">{(b.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => handleRestoreBackup(b.id)}>Pulihkan</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Dialog>

      <Dialog open={unsyncedOpen} onClose={() => setUnsyncedOpen(false)} title="Catatan yang belum tersinkron">
        <div className="space-y-4">
          {unsynced.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">Semua catatan sudah tersinkron.</p>
          ) : (
            <>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {unsynced.map((n) => (
                  <div key={n.id} className="flex items-center justify-between rounded-xl bg-[var(--card-muted)] p-3">
                    <div className="text-sm">{n.title || "Tanpa judul"}</div>
                  </div>
                ))}
              </div>
              <Button size="sm" onClick={handleUploadUnsynced}>Unggah semua</Button>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
}

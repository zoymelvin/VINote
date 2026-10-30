"use client";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function PengaturanPage() {
  const { theme, setTheme, setAccent } = useTheme();
  const [pin, setPin] = useState(false);
  const router = useRouter();
  async function signOut() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/login");
  }
  return (
    <div className="p-4 md:p-8 space-y-6">
      <PageHeader title="Pengaturan" />
      <section className="space-y-3">
        <h2 className="font-semibold">Tema</h2>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <Button key={t} variant={theme === t ? "primary" : "secondary"} onClick={() => setTheme(t)}>{t}</Button>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold">Warna aksen</h2>
        <div className="flex flex-wrap gap-2">
          {["indigo", "rose", "sky", "emerald", "violet", "slate", "orange", "teal"].map((a) => (
            <button key={a} onClick={() => setAccent(a)} className="h-8 w-8 rounded-full border" style={{ background: a }} aria-label={a} />
          ))}
        </div>
      </section>
      <section className="flex items-center justify-between">
        <span>Kunci aplikasi PIN</span>
        <Switch checked={pin} onCheckedChange={setPin} label="Kunci aplikasi PIN" />
      </section>
      <Button variant="danger" onClick={signOut}>Keluar</Button>
    </div>
  );
}

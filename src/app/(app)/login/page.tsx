"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { Icon } from "@/components/icons";
import { Envelope, Key, ArrowLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signIn() {
    const supabase = createClient();
    if (!supabase) { setError("Supabase tidak terkonfigurasi"); return; }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push("/");
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4 rounded-[28px] bg-[var(--card)] p-6 shadow-[var(--shadow-2)]">
        <PageHeader title="Masuk VINOTE" description="Sinkronkan catatan Anda" />
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com" type="email" className="text-base" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" className="text-base" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button className="w-full" onClick={signIn} disabled={loading || !email || !password}>
          {loading ? "Masuk..." : "Masuk"}
        </Button>
      </div>
    </div>
  );
}

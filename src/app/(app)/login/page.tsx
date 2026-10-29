"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  async function send() {
    const supabase = createClient();
    await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setSent(true);
  }
  async function google() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  }
  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4 rounded-[28px] bg-[var(--card)] p-6 shadow-[var(--shadow-2)]">
        <h1 className="text-2xl font-bold">Masuk VINOTE</h1>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com" type="email" />
        <Button className="w-full" onClick={send}>Kirim magic link</Button>
        {sent && <p className="text-sm text-[var(--muted)]">Cek email Anda.</p>}
        <Button className="w-full" variant="secondary" onClick={google}>Masuk dengan Google</Button>
      </div>
    </div>
  );
}

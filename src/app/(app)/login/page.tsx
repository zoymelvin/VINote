"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { Icon } from "@/components/icons";
import { Key, ArrowLeft, Envelope } from "@phosphor-icons/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  async function sendCode() {
    const supabase = createClient();
    if (!supabase) { setError("Supabase tidak terkonfigurasi"); return; }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
    setStep("code");
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  async function verifyCode() {
    const supabase = createClient();
    if (!supabase) { setError("Supabase tidak terkonfigurasi"); return; }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    window.location.href = "/";
  }

  async function resendCode() {
    if (countdown > 0) return;
    await sendCode();
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4 rounded-[28px] bg-[var(--card)] p-6 shadow-[var(--shadow-2)]">
        <PageHeader title="Masuk VINOTE" description="Sinkronkan catatan Anda" />

        {step === "email" ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@contoh.com"
                type="email"
                className="text-base"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button className="w-full" onClick={sendCode} disabled={loading || !email}>
              {loading ? "Mengirim..." : "Kirim kode"}
            </Button>
          </>
        ) : (
          <>
            <button onClick={() => setStep("email")} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Icon icon={ArrowLeft} size={16} /> Kembali
            </button>
            <p className="text-sm text-[var(--text-muted)]">
              Kode 6 digit telah dikirim ke <strong>{email}</strong>
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kode verifikasi</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button className="w-full" onClick={verifyCode} disabled={loading || code.length !== 6}>
              {loading ? "Memverifikasi..." : "Verifikasi"}
            </Button>
            <button
              onClick={resendCode}
              disabled={countdown > 0}
              className="w-full text-center text-sm text-[var(--accent)] disabled:text-[var(--text-muted)]"
            >
              {countdown > 0 ? `Kirim ulang dalam ${countdown}s` : "Kirim ulang kode"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
